require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");
const productsRouter = require("./routes/products");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS database_connected");

    res.status(200).json({
      status: "ok",
      message: "W3Admin API is running",
      database: rows[0].database_connected === 1 ? "connected" : "disconnected",
    });
  } catch (error) {
    console.error("Database connection error:", error.message);

    res.status(500).json({
      status: "error",
      message: "API is running, but database connection failed",
    });
  }
});

app.use("/api/products", productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`W3Admin API running at http://localhost:${PORT}`);
});
