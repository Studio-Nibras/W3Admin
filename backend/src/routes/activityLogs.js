const express = require("express");
const pool = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const offset = (page - 1) * limit;

    const action = (req.query.action || "").trim().toUpperCase();

    const allowedActions = [
      "CREATE",
      "UPDATE",
      "DELETE",
      "LOGIN",
      "LOGOUT",
      "ACCOUNT_UPDATE",
    ];

    if (action && !allowedActions.includes(action)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid activity action",
      });
    }

    const whereClause = action ? "WHERE action = ?" : "";
    const params = action ? [action] : [];

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM activity_logs ${whereClause}`,
      params,
    );

    const total = Number(countRows[0].total);

    const [logs] = await pool.execute(
      `
        SELECT
          id,
          actor_id AS actorId,
          actor_name AS actorName,
          action,
          entity_type AS entityType,
          entity_id AS entityId,
          description,
          metadata,
          created_at AS createdAt
        FROM activity_logs
        ${whereClause}
        ORDER BY created_at DESC, id DESC
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
      data: logs.map((log) => ({
        ...log,
        metadata:
          typeof log.metadata === "string"
            ? JSON.parse(log.metadata)
            : log.metadata,
      })),
    });
  } catch (error) {
    console.error("Get activity logs error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Failed to retrieve activity logs",
    });
  }
});

module.exports = router;
