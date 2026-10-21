
const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT admin_id, name, email, created_at, updated_at
       FROM admins
       WHERE admin_id = ?
       LIMIT 1`,
      [req.session.admin.id],
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Admin account not found" });
    }

    return res.json({ admin: rows[0] });
  } catch (error) {
    console.error("Get settings error:", error.message);
    return res.status(500).json({ message: "Failed to load account settings" });
  }
});

router.put("/profile", async (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  if (name.length > 100 || email.length > 255) {
    return res.status(400).json({ message: "Input is too long" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT admin_id, name, email
       FROM admins
       WHERE admin_id = ?
       LIMIT 1`,
      [req.session.admin.id],
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Admin account not found" });
    }

    const currentAdmin = rows[0];

    const [result] = await connection.execute(
      `UPDATE admins
       SET name = ?, email = ?
       WHERE admin_id = ?`,
      [name, email, currentAdmin.admin_id],
    );

    if (currentAdmin.name !== name || currentAdmin.email !== email) {
      await logActivity({
        actorId: currentAdmin.admin_id,
        actorName: name,
        action: "ACCOUNT_UPDATE",
        entityType: "admin",
        entityId: currentAdmin.admin_id,
        description: "Updated admin profile",
        metadata: {
          changedFields: [
            ...(currentAdmin.name !== name ? ["name"] : []),
            ...(currentAdmin.email !== email ? ["email"] : []),
          ],
        },
        connection,
      });
    }

    await connection.commit();

    req.session.admin = {
      ...req.session.admin,
      name,
      email,
    };

    await new Promise((resolve, reject) => {
      req.session.save((error) => (error ? reject(error) : resolve()));
    });

    return res.json({
      message: "Profile updated successfully",
      admin: { id: currentAdmin.admin_id, name, email },
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

    console.error("Update profile error:", error.message);
    return res.status(500).json({ message: "Failed to update profile" });
  } finally {
    if (connection) connection.release();
  }
});

router.put("/password", async (req, res) => {
  const currentPassword =
    typeof req.body.currentPassword === "string"
      ? req.body.currentPassword
      : "";
  const newPassword =
    typeof req.body.newPassword === "string" ? req.body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Current password and new password are required",
    });
  }

  if (
    newPassword.length < 8 ||
    Buffer.byteLength(newPassword, "utf8") > 72
  ) {
    return res.status(400).json({
      message: "New password must be at least 8 characters and at most 72 bytes",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT admin_id, name, password_hash
       FROM admins
       WHERE admin_id = ?
       LIMIT 1`,
      [req.session.admin.id],
    );

    if (!rows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Admin account not found" });
    }

    const admin = rows[0];
    const matches = await bcrypt.compare(
      currentPassword,
      admin.password_hash,
    );

    if (!matches) {
      await connection.rollback();
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      admin.password_hash,
    );

    if (samePassword) {
      await connection.rollback();
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await connection.execute(
      `UPDATE admins
       SET password_hash = ?
       WHERE admin_id = ?`,
      [passwordHash, admin.admin_id],
    );

    await logActivity({
      actorId: admin.admin_id,
      actorName: admin.name,
      action: "ACCOUNT_UPDATE",
      entityType: "admin",
      entityId: admin.admin_id,
      description: "Changed admin password",
      metadata: { changedFields: ["password"] },
      connection,
    });

    await connection.commit();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    console.error("Change password error:", error.message);
    return res.status(500).json({ message: "Failed to update password" });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
