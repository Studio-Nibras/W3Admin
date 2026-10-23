const fs = require("node:fs");
const mysql = require("mysql2/promise");
require("dotenv").config();

const caContent = process.env.DB_SSL_CA_CONTENT
  ? process.env.DB_SSL_CA_CONTENT.replace(/\\n/g, "\n")
  : process.env.DB_SSL_CA
    ? fs.readFileSync(process.env.DB_SSL_CA, "utf8")
    : null;

if (process.env.NODE_ENV === "production" && !caContent) {
  throw new Error("DB_SSL_CA_CONTENT or DB_SSL_CA must be configured");
}

const ssl = caContent
  ? {
      ca: caContent,
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
  connectionLimit: 5,
  queueLimit: 0,
});

module.exports = pool;
