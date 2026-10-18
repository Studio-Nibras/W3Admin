const pool = require("../db");

async function logActivity({
  actorId = null,
  actorName = null,
  action,
  entityType,
  entityId = null,
  description,
  metadata = null,
  connection = pool,
}) {
  const allowedActions = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "ACCOUNT_UPDATE",
  ];

  if (!allowedActions.includes(action)) {
    throw new Error("Invalid activity action");
  }

  const safeMetadata =
    metadata && typeof metadata === "object" ? JSON.stringify(metadata) : null;

  await connection.execute(
    `
      INSERT INTO activity_logs (
        actor_id,
        actor_name,
        action,
        entity_type,
        entity_id,
        description,
        metadata
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      actorId,
      actorName,
      action,
      entityType,
      entityId === null ? null : String(entityId),
      description,
      safeMetadata,
    ],
  );
}

module.exports = logActivity;
