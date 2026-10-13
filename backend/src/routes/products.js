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

module.exports = router;
