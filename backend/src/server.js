require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session");
const fs = require("node:fs");

const pool = require("./db");
const productsRouter = require("./routes/products");
const dashboardRouter = require("./routes/dashboard");
const categoriesRouter = require("./routes/categories");
const suppliersRouter = require("./routes/suppliers");
const customersRouter = require("./routes/customers");
const activityLogsRouter = require("./routes/activityLogs");
const authRouter = require("./routes/auth");
const requireAuth = require("./middleware/requireAuth");
const settingsRouter = require("./routes/settings");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be configured");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);

  if (!process.env.DB_SSL_CA) {
    throw new Error("DB_SSL_CA must be configured in production");
  }
}

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

const ssl = process.env.DB_SSL_CA
  ? {
      ca: fs.readFileSync(process.env.DB_SSL_CA, "utf8"),
      rejectUnauthorized: true,
    }
  : undefined;

const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 24 * 60 * 60 * 1000,
  createDatabaseTable: false,
  schema: {
    tableName: "sessions",
    columnNames: {
      session_id: "session_id",
      expires: "expires",
      data: "data",
    },
  },
});

sessionStore.on("error", (error) => {
  console.error("Session store error:", error.message);
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  session({
    name: "w3admin.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/api/auth", authRouter);

app.use("/api/dashboard", requireAuth, dashboardRouter);
app.use("/api/products", requireAuth, productsRouter);
app.use("/api/categories", requireAuth, categoriesRouter);
app.use("/api/suppliers", requireAuth, suppliersRouter);
app.use("/api/customers", requireAuth, customersRouter);
app.use("/api/activity-logs", requireAuth, activityLogsRouter);
app.use("/api/settings", requireAuth, settingsRouter);

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

app.listen(PORT, () => {
  console.log(`W3Admin API running on port ${PORT}`);
});
