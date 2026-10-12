const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT
        ProductID AS id,
        ProductName AS name,
        SupplierID AS supplierId,
        CategoryID AS categoryId,
        Unit AS unit,
        Price AS price
      FROM products
      ORDER BY ProductID DESC
    `);

    res.status(200).json({
      status: "success",
      total: products.length,
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
