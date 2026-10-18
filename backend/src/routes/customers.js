const express = require("express");
const pool = require("../db");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

const customerFields = `
  CustomerID AS id,
  CustomerName AS name,
  ContactName AS contactName,
  Address AS address,
  City AS city,
  PostalCode AS postalCode,
  Country AS country
`;

const customerColumns = [
  "CustomerName",
  "ContactName",
  "Address",
  "City",
  "PostalCode",
  "Country",
];

// GET /api/customers
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const offset = (page - 1) * limit;

    const whereClause = search
      ? `WHERE ${customerColumns
          .map((column) => `${column} LIKE ?`)
          .join(" OR ")}`
      : "";

    const params = search ? customerColumns.map(() => `%${search}%`) : [];

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM customers ${whereClause}`,
      params,
    );

    const total = Number(countRows[0].total);
    const totalPages = Math.ceil(total / limit);

    const [customers] = await pool.query(
      `
        SELECT ${customerFields}
        FROM customers
        ${whereClause}
        ORDER BY CustomerID ASC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    return res.status(200).json({
      status: "success",
      pagination: { total, page, limit, totalPages },
      data: customers,
    });
  } catch (error) {
    console.error("Get customers error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve customers",
    });
  }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Customer ID must be a positive integer",
    });
  }

  try {
    const [customers] = await pool.query(
      `
        SELECT ${customerFields}
        FROM customers
        WHERE CustomerID = ?
        LIMIT 1
      `,
      [id],
    );

    if (customers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: customers[0],
    });
  } catch (error) {
    console.error("Get customer detail error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve customer",
    });
  }
});

// POST /api/customers

router.post("/", async (req, res) => {
  const {
    name,
    contactName = "",
    address = "",
    city = "",
    postalCode = "",
    country = "",
  } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Customer name must be a non-empty string",
    });
  }

  const optionalFields = {
    contactName,
    address,
    city,
    postalCode,
    country,
  };

  for (const [field, value] of Object.entries(optionalFields)) {
    if (typeof value !== "string") {
      return res.status(400).json({
        status: "error",
        message: `${field} must be a string`,
      });
    }
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `
        INSERT INTO customers
          (
            CustomerName,
            ContactName,
            Address,
            City,
            PostalCode,
            Country
          )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        contactName.trim(),
        address.trim(),
        city.trim(),
        postalCode.trim(),
        country.trim(),
      ],
    );

    const [customers] = await connection.query(
      `SELECT ${customerFields} FROM customers WHERE CustomerID = ?`,
      [result.insertId],
    );

    const customer = customers[0];

    await logActivity({
      action: "CREATE",
      entityType: "CUSTOMER",
      entityId: customer.id,
      description: `Created customer: ${customer.name}`,
      metadata: {
        name: customer.name,
        city: customer.city,
        country: customer.country,
      },
      connection,
    });

    await connection.commit();

    return res.status(201).json({
      status: "success",
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Create customer error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to create customer",
    });
  } finally {
    if (connection) connection.release();
  }
});

// PUT /api/customers/:id

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Customer ID must be a positive integer",
    });
  }

  const {
    name,
    contactName = "",
    address = "",
    city = "",
    postalCode = "",
    country = "",
  } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Customer name must be a non-empty string",
    });
  }

  const optionalFields = {
    contactName,
    address,
    city,
    postalCode,
    country,
  };

  for (const [field, value] of Object.entries(optionalFields)) {
    if (typeof value !== "string") {
      return res.status(400).json({
        status: "error",
        message: `${field} must be a string`,
      });
    }
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT CustomerID FROM customers WHERE CustomerID = ?",
      [id],
    );

    if (existing.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    await connection.query(
      `
        UPDATE customers
        SET
          CustomerName = ?,
          ContactName = ?,
          Address = ?,
          City = ?,
          PostalCode = ?,
          Country = ?
        WHERE CustomerID = ?
      `,
      [
        name.trim(),
        contactName.trim(),
        address.trim(),
        city.trim(),
        postalCode.trim(),
        country.trim(),
        id,
      ],
    );

    const [customers] = await connection.query(
      `SELECT ${customerFields} FROM customers WHERE CustomerID = ?`,
      [id],
    );

    const customer = customers[0];

    await logActivity({
      action: "UPDATE",
      entityType: "CUSTOMER",
      entityId: customer.id,
      description: `Updated customer: ${customer.name}`,
      metadata: {
        name: customer.name,
        city: customer.city,
        country: customer.country,
      },
      connection,
    });

    await connection.commit();

    return res.status(200).json({
      status: "success",
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Update customer error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to update customer",
    });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE /api/customers/:id

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Customer ID must be a positive integer",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [customers] = await connection.query(
      "SELECT CustomerID AS id, CustomerName AS name FROM customers WHERE CustomerID = ?",
      [id],
    );

    if (customers.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        status: "error",
        message: "Customer not found",
      });
    }

    const customer = customers[0];

    await connection.query("DELETE FROM customers WHERE CustomerID = ?", [id]);

    await logActivity({
      action: "DELETE",
      entityType: "CUSTOMER",
      entityId: customer.id,
      description: `Deleted customer: ${customer.name}`,
      metadata: {
        name: customer.name,
      },
      connection,
    });

    await connection.commit();

    return res.status(200).json({
      status: "success",
      message: "Customer deleted successfully",
      data: { id },
    });
  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Delete customer error:", error.message);

    if (
      error.code === "ER_ROW_IS_REFERENCED" ||
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.errno === 1217 ||
      error.errno === 1451
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete customer because it is referenced by existing orders",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to delete customer",
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
