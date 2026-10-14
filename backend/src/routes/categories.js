const express = require("express");
const pool = require("../db");

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );
    const offset = (page - 1) * limit;

    const whereClause = search ? "WHERE CategoryName LIKE ?" : "";
    const params = search ? [`%${search}%`] : [];

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM categories ${whereClause}`,
      params,
    );

    const total = Number(countRows[0].total);

    const [categories] = await pool.query(
      `
        SELECT
          CategoryID AS id,
          CategoryName AS name,
          Description AS description
        FROM categories
        ${whereClause}
        ORDER BY CategoryName ASC
        LIMIT ? OFFSET ?
      `,
      [...params, limit, offset],
    );

    return res.status(200).json({
      status: "success",
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve categories",
    });
  }
});

// GET /api/categories/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Category ID must be a positive integer",
    });
  }

  try {
    const [categories] = await pool.query(
      `
        SELECT
          CategoryID AS id,
          CategoryName AS name,
          Description AS description
        FROM categories
        WHERE CategoryID = ?
        LIMIT 1
      `,
      [id],
    );

    if (categories.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      data: categories[0],
    });
  } catch (error) {
    console.error("Get category detail error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve category",
    });
  }
});

// POST /api/categories
router.post("/", async (req, res) => {
  const { name, description } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Category name must be a non-empty string",
    });
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      status: "error",
      message: "Description must be a string",
    });
  }

  try {
    const [result] = await pool.query(
      `
        INSERT INTO categories (CategoryName, Description)
        VALUES (?, ?)
      `,
      [name.trim(), description?.trim() || ""],
    );

    const [categories] = await pool.query(
      `
        SELECT
          CategoryID AS id,
          CategoryName AS name,
          Description AS description
        FROM categories
        WHERE CategoryID = ?
      `,
      [result.insertId],
    );

    return res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: categories[0],
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to create category",
    });
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Category ID must be a positive integer",
    });
  }

  const { name, description } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      status: "error",
      message: "Category name must be a non-empty string",
    });
  }

  if (
    description !== undefined &&
    description !== null &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      status: "error",
      message: "Description must be a string",
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT CategoryID FROM categories WHERE CategoryID = ?",
      [id],
    );

    if (existing.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    await pool.query(
      `
        UPDATE categories
        SET CategoryName = ?, Description = ?
        WHERE CategoryID = ?
      `,
      [name.trim(), description?.trim() || "", id],
    );

    const [categories] = await pool.query(
      `
        SELECT
          CategoryID AS id,
          CategoryName AS name,
          Description AS description
        FROM categories
        WHERE CategoryID = ?
      `,
      [id],
    );

    return res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: categories[0],
    });
  } catch (error) {
    console.error("Update category error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to update category",
    });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({
      status: "error",
      message: "Category ID must be a positive integer",
    });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM categories WHERE CategoryID = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
      data: { id },
    });
  } catch (error) {
    console.error("Delete category error:", error.message);

    if (
      error.code === "ER_ROW_IS_REFERENCED" ||
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.errno === 1217 ||
      error.errno === 1451
    ) {
      return res.status(409).json({
        status: "error",
        message:
          "Cannot delete category because it is still used by existing products",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to delete category",
    });
  }
});

module.exports = router;
