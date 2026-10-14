const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [suppliers] = await pool.query(`
      SELECT
        SupplierID AS id,
        SupplierName AS name
      FROM suppliers
      ORDER BY SupplierName ASC
    `);

    return res.status(200).json({
      status: "success",
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

module.exports = router;
