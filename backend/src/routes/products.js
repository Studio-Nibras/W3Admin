const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const categoryId = req.query.categoryId;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const offset = (page - 1) * limit;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("ProductName LIKE ?");
      params.push(`%${search}%`);
    }

    if (categoryId !== undefined) {
      const parsedCategoryId = Number(categoryId);

      if (!Number.isInteger(parsedCategoryId) || parsedCategoryId < 1) {
        return res.status(400).json({
          status: "error",
          message: "categoryId must be a positive integer",
        });
      }

      conditions.push("CategoryID = ?");
      params.push(parsedCategoryId);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products ${whereClause}`,
      params,
    );

    const total = Number(countRows[0].total);
    const totalPages = Math.ceil(total / limit);

    const [products] = await pool.query(
      `
        SELECT
          ProductID AS id,
          ProductName AS name,
          SupplierID AS supplierId,
          CategoryID AS categoryId,
          Unit AS unit,
          Price AS price
        FROM products
        ${whereClause}
        ORDER BY ProductID DESC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    res.status(200).json({
      status: "success",
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve products",
    });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Product ID must be a positive integer",
    });
  }

  try {
    const [products] = await pool.query(
      `
        SELECT
          ProductID AS id,
          ProductName AS name,
          SupplierID AS supplierId,
          CategoryID AS categoryId,
          Unit AS unit,
          Price AS price
        FROM products
        WHERE ProductID = ?
        LIMIT 1
      `,
      [id],
    );

    if (products.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: products[0],
    });
  } catch (error) {
    console.error("Get product detail error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve product",
    });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  const { name, supplierId, categoryId, unit, price } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof unit !== "string" ||
    !unit.trim()
  ) {
    return res.status(400).json({
      status: "error",
      message: "Name and unit must be non-empty strings",
    });
  }

  if (
    !Number.isInteger(supplierId) ||
    supplierId < 1 ||
    !Number.isInteger(categoryId) ||
    categoryId < 1
  ) {
    return res.status(400).json({
      status: "error",
      message: "Supplier ID and category ID must be positive integers",
    });
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      status: "error",
      message: "Price must be a non-negative number",
    });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO products
          (ProductName, SupplierID, CategoryID, Unit, Price)
        VALUES (?, ?, ?, ?, ?)
      `,
      [name.trim(), supplierId, categoryId, unit.trim(), price],
    );

    const [products] = await pool.query(
      `
        SELECT
          ProductID AS id,
          ProductName AS name,
          SupplierID AS supplierId,
          CategoryID AS categoryId,
          Unit AS unit,
          Price AS price
        FROM products
        WHERE ProductID = ?
      `,
      [result.insertId],
    );

    return res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: products[0],
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        status: "error",
        message: "Supplier or category does not exist",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to create product",
    });
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Product ID must be a positive integer",
    });
  }

  const { name, supplierId, categoryId, unit, price } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof unit !== "string" ||
    !unit.trim()
  ) {
    return res.status(400).json({
      status: "error",
      message: "Name and unit must be non-empty strings",
    });
  }

  if (
    !Number.isInteger(supplierId) ||
    supplierId < 1 ||
    !Number.isInteger(categoryId) ||
    categoryId < 1
  ) {
    return res.status(400).json({
      status: "error",
      message: "Supplier ID and category ID must be positive integers",
    });
  }

  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return res.status(400).json({
      status: "error",
      message: "Price must be a non-negative number",
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT ProductID FROM products WHERE ProductID = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    await pool.query(
      `
        UPDATE products
        SET
          ProductName = ?,
          SupplierID = ?,
          CategoryID = ?,
          Unit = ?,
          Price = ?
        WHERE ProductID = ?
      `,
      [name.trim(), supplierId, categoryId, unit.trim(), price, id],
    );

    const [products] = await pool.query(
      `
        SELECT
          ProductID AS id,
          ProductName AS name,
          SupplierID AS supplierId,
          CategoryID AS categoryId,
          Unit AS unit,
          Price AS price
        FROM products
        WHERE ProductID = ?
      `,
      [id],
    );

    return res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: products[0],
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        status: "error",
        message: "Supplier or category does not exist",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to update product",
    });
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Product ID must be a positive integer",
    });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM products WHERE ProductID = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("Delete product error:", {
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      message: error.message,
    });

    if (
      error.code === "ER_ROW_IS_REFERENCED" ||
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.errno === 1217 ||
      error.errno === 1451
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete product because it is referenced by existing order details",
      });
    }
    return res.status(409).json({
      status: "error",
      message:
        "Cannot delete product because it is referenced by existing order details",
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Failed to delete product",
  });
});

module.exports = router;
