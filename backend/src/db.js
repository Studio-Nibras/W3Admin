const fs = require("node:fs");
const mysql = require("mysql2/promise");
require("dotenv").config();

if (process.env.NODE_ENV === "production" && !process.env.DB_SSL_CA) {
  throw new Error("DB_SSL_CA must be configured in production");
}

const ssl = process.env.DB_SSL_CA
  ? {
      ca: fs.readFileSync(process.env.DB_SSL_CA, "utf8"),
      rejectUnauthorized: true,
    }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
