const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

router.get("/setup-status", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT COUNT(*) AS total FROM admins");

    res.json({ setupRequired: Number(rows[0].total) === 0 });
  } catch (error) {
    console.error("Setup status error:", error.message);
    res.status(500).json({ message: "Failed to check admin setup" });
  }
});

router.post("/setup-admin", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  if (name.length > 100 || email.length > 255) {
    return res.status(400).json({ message: "Input is too long" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
      message: "Password must be at least 8 characters and at most 72 bytes",
    });
  }

  let connection;
  let lockAcquired = false;

  try {
    connection = await pool.getConnection();

    const [lockRows] = await connection.query(
      "SELECT GET_LOCK('w3admin_initial_setup', 10) AS acquired",
    );

    if (lockRows[0].acquired !== 1) {
      return res.status(503).json({
        message: "Could not initialize admin. Please try again.",
      });
    }

    lockAcquired = true;

    const [existing] = await connection.execute(
      "SELECT admin_id FROM admins LIMIT 1",
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Admin setup has already been completed",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO admins (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, passwordHash],
    );

    await logActivity({
      actorId: result.insertId,
      actorName: name,
      action: "CREATE",
      entityType: "admin",
      entityId: result.insertId,
      description: "Initial admin account created",
      connection,
    });

    await connection.commit();

    return res.status(201).json({
      message: "Admin account created. You can now log in.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    console.error("Admin setup error:", error.message);
    return res.status(500).json({ message: "Failed to create admin account" });
  } finally {
    if (connection) {
      if (lockAcquired) {
        await connection
          .query("SELECT RELEASE_LOCK('w3admin_initial_setup')")
          .catch(() => {});
      }

      connection.release();
    }
  }
});

router.post("/login", async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT admin_id, name, email, password_hash
       FROM admins
       WHERE email = ?
       LIMIT 1`,
      [email],
    );

    const admin = rows[0];
    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.password_hash)
      : false;

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    req.session.regenerate(async (sessionError) => {
      if (sessionError) {
        console.error("Session regeneration error:", sessionError.message);
        return res.status(500).json({ message: "Login failed" });
      }

      req.session.admin = {
        id: admin.admin_id,
        name: admin.name,
        email: admin.email,
      };

      try {
        await new Promise((resolve, reject) => {
          req.session.save((error) => (error ? reject(error) : resolve()));
        });

        await logActivity({
          actorId: admin.admin_id,
          actorName: admin.name,
          action: "LOGIN",
          entityType: "admin",
          entityId: admin.admin_id,
          description: "Admin logged in",
        });

        return res.json({
          message: "Login successful",
          admin: req.session.admin,
        });
      } catch (error) {
        console.error("Login session error:", error.message);

        return req.session.destroy(() => {
          res.clearCookie("w3admin.sid");
          res.status(500).json({ message: "Login failed" });
        });
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Login failed" });
  }
});

router.get("/me", (req, res) => {
  if (!req.session?.admin) {
    return res.status(401).json({
      authenticated: false,
      message: "Not authenticated",
    });
  }

  res.json({
    authenticated: true,
    admin: req.session.admin,
  });
});

router.post("/logout", async (req, res) => {
  const admin = req.session?.admin;

  if (!admin) {
    return req.session.destroy(() => {
      res.clearCookie("w3admin.sid");
      res.json({ message: "Logged out" });
    });
  }

  try {
    await logActivity({
      actorId: admin.id,
      actorName: admin.name,
      action: "LOGOUT",
      entityType: "admin",
      entityId: admin.id,
      description: "Admin logged out",
    });

    req.session.destroy((error) => {
      res.clearCookie("w3admin.sid");

      if (error) {
        return res.status(500).json({ message: "Logout failed" });
      }

      return res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    return res.status(500).json({ message: "Logout failed" });
  }
});

module.exports = router;
