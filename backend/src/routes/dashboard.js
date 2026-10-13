const { Router } = require("express");
const pool = require("../db");

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", async (_req, res, next) => {
  try {
    const [productRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM products",
    );

    const [customerRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM customers",
    );

    const [orderRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM orders",
    );

    const [salesRows] = await pool.query(`
      SELECT COALESCE(SUM(od.Quantity * p.Price), 0) AS total
      FROM order_details od
      INNER JOIN products p ON p.ProductID = od.ProductID
    `);

    res.json({
      totalProducts: Number(productRows[0].total),
      totalCustomers: Number(customerRows[0].total),
      totalOrders: Number(orderRows[0].total),
      totalSales: Number(salesRows[0].total),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/dashboard/recent-orders
router.get("/recent-orders", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        o.OrderID AS id,
        o.OrderDate AS orderDate,
        c.CustomerName AS customerName,
        COUNT(od.OrderDetailID) AS itemCount,
        COALESCE(SUM(od.Quantity * p.Price), 0) AS total
      FROM orders o
      LEFT JOIN customers c ON c.CustomerID = o.CustomerID
      LEFT JOIN order_details od ON od.OrderID = o.OrderID
      LEFT JOIN products p ON p.ProductID = od.ProductID
      GROUP BY
        o.OrderID,
        o.OrderDate,
        c.CustomerName
      ORDER BY o.OrderDate DESC, o.OrderID DESC
      LIMIT 5
    `);

    res.json({
      data: rows.map((row) => ({
        ...row,
        id: Number(row.id),
        itemCount: Number(row.itemCount),
        total: Number(row.total),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/sales-overview", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(`
  SELECT
    DATE_FORMAT(o.OrderDate, '%Y-%m') AS period,
    SUM(od.Quantity * p.Price) AS sales
  FROM orders o
  INNER JOIN order_details od ON od.OrderID = o.OrderID
  INNER JOIN products p ON p.ProductID = od.ProductID
  WHERE o.OrderDate IS NOT NULL
  GROUP BY DATE_FORMAT(o.OrderDate, '%Y-%m')
  ORDER BY period DESC
  LIMIT 6
`);
    const data = rows.reverse().map((row) => ({
      period: row.period,
      sales: Number(Number(row.sales).toFixed(2)),
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
