const express = require("express");
const pool = require("../db");
const logActivity = require("../utils/activityLogger");

const router = express.Router();

const supplierSelect = `
  SELECT
    SupplierID AS id,
    SupplierName AS name,
    ContactName AS contactName,
    Address AS address,
    City AS city,
    PostalCode AS postalCode,
    Country AS country,
    Phone AS phone
  FROM suppliers
`;

const searchColumns = [
  "SupplierName",
  "ContactName",
  "Address",
  "City",
  "PostalCode",
  "Country",
  "Phone",
];

function validateSupplierInput(body) {
  const { name, contactName, address, city, postalCode, country, phone } =
    body || {};

  if (typeof name !== "string" || !name.trim()) {
    return {
      error: "Supplier name must be a non-empty string",
    };
  }

  const optionalFields = {
    contactName,
    address,
    city,
    postalCode,
    country,
    phone,
  };

  for (const [field, value] of Object.entries(optionalFields)) {
    if (value !== undefined && value !== null && typeof value !== "string") {
      return {
        error: `${field} must be a string`,
      };
    }
  }

  const normalize = (value) => (typeof value === "string" ? value.trim() : "");

  return {
    data: {
      name: name.trim(),
      contactName: normalize(contactName),
      address: normalize(address),
      city: normalize(city),
      postalCode: normalize(postalCode),
      country: normalize(country),
      phone: normalize(phone),
    },
  };
}

// GET /api/suppliers
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
      ? `WHERE ${searchColumns
          .map((column) => `${column} LIKE ?`)
          .join(" OR ")}`
      : "";

    const searchParams = search ? searchColumns.map(() => `%${search}%`) : [];

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM suppliers
       ${whereClause}`,
      searchParams,
    );

    const total = Number(countRows[0].total);

    const [suppliers] = await pool.query(
      `${supplierSelect}
       ${whereClause}
       ORDER BY SupplierName ASC
       LIMIT ? OFFSET ?`,
      [...searchParams, limit, offset],
    );

    return res.status(200).json({
      status: "success",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve suppliers",
    });
  }
});

// GET /api/suppliers/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Supplier ID must be a positive integer",
    });
  }

  try {
    const [suppliers] = await pool.query(
      `${supplierSelect}
       WHERE SupplierID = ?
       LIMIT 1`,
      [id],
    );

    if (suppliers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Supplier not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: suppliers[0],
    });
  } catch (error) {
    console.error("Get supplier detail error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve supplier",
    });
  }
});

// POST /api/suppliers
router.post("/", async (req, res) => {
  const validation = validateSupplierInput(req.body);

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      message: validation.error,
    });
  }

  const supplierData = validation.data;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO suppliers (
        SupplierName,
        ContactName,
        Address,
        City,
        PostalCode,
        Country,
        Phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        supplierData.name,
        supplierData.contactName,
        supplierData.address,
        supplierData.city,
        supplierData.postalCode,
        supplierData.country,
        supplierData.phone,
      ],
    );

    const [suppliers] = await connection.query(
      `${supplierSelect}
       WHERE SupplierID = ?`,
      [result.insertId],
    );

    const supplier = suppliers[0];

    await logActivity({
      action: "CREATE",
      entityType: "SUPPLIER",
      entityId: supplier.id,
      description: `Created supplier: ${supplier.name}`,
      metadata: {
        name: supplier.name,
        country: supplier.country,
      },
      connection,
    });

    await connection.commit();

    return res.status(201).json({
      status: "success",
      message: "Supplier created successfully",
      data: supplier,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Supplier rollback error:", rollbackError.message);
      }
    }

    console.error("Create supplier error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to create supplier",
    });
  } finally {
    if (connection) connection.release();
  }
});

// PUT /api/suppliers/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Supplier ID must be a positive integer",
    });
  }

  const validation = validateSupplierInput(req.body);

  if (validation.error) {
    return res.status(400).json({
      status: "error",
      message: validation.error,
    });
  }

  const supplierData = validation.data;
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT SupplierID FROM suppliers WHERE SupplierID = ?",
      [id],
    );

    if (existing.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        status: "error",
        message: "Supplier not found",
      });
    }

    await connection.query(
      `UPDATE suppliers
       SET
         SupplierName = ?,
         ContactName = ?,
         Address = ?,
         City = ?,
         PostalCode = ?,
         Country = ?,
         Phone = ?
       WHERE SupplierID = ?`,
      [
        supplierData.name,
        supplierData.contactName,
        supplierData.address,
        supplierData.city,
        supplierData.postalCode,
        supplierData.country,
        supplierData.phone,
        id,
      ],
    );

    const [suppliers] = await connection.query(
      `${supplierSelect}
       WHERE SupplierID = ?`,
      [id],
    );

    const supplier = suppliers[0];

    await logActivity({
      action: "UPDATE",
      entityType: "SUPPLIER",
      entityId: supplier.id,
      description: `Updated supplier: ${supplier.name}`,
      metadata: {
        name: supplier.name,
        country: supplier.country,
      },
      connection,
    });

    await connection.commit();

    return res.status(200).json({
      status: "success",
      message: "Supplier updated successfully",
      data: supplier,
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Supplier rollback error:", rollbackError.message);
      }
    }

    console.error("Update supplier error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to update supplier",
    });
  } finally {
    if (connection) connection.release();
  }
});

// DELETE /api/suppliers/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Supplier ID must be a positive integer",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [suppliers] = await connection.query(
      `SELECT SupplierID AS id, SupplierName AS name
       FROM suppliers
       WHERE SupplierID = ?
       LIMIT 1`,
      [id],
    );

    if (suppliers.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        status: "error",
        message: "Supplier not found",
      });
    }

    const supplier = suppliers[0];

    await connection.query("DELETE FROM suppliers WHERE SupplierID = ?", [id]);

    await logActivity({
      action: "DELETE",
      entityType: "SUPPLIER",
      entityId: supplier.id,
      description: `Deleted supplier: ${supplier.name}`,
      metadata: {
        name: supplier.name,
      },
      connection,
    });

    await connection.commit();

    return res.status(200).json({
      status: "success",
      message: "Supplier deleted successfully",
      data: { id },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Supplier rollback error:", rollbackError.message);
      }
    }

    console.error("Delete supplier error:", error.message);

    if (
      error.code === "ER_ROW_IS_REFERENCED" ||
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.errno === 1217 ||
      error.errno === 1451
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete supplier because it is still used by existing products",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to delete supplier",
    });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
