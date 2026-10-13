import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { getSalesOverview } from "../../../services/dashboardService";
import { useEffect, useState } from "react";
import { Boxes, Users, ShoppingCart, Wallet } from "lucide-react";
import StatCard from "../components/StatCard";
import { getDashboardSummary } from "../../../services/dashboardService";
import { getRecentOrders } from "../../../services/dashboardService";

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSalesOverview() {
      try {
        setSalesLoading(true);
        setSalesError("");

        const result = await getSalesOverview();

        if (!cancelled) {
          setSalesData(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setSalesError(err.message || "Failed to load sales overview");
        }
      } finally {
        if (!cancelled) {
          setSalesLoading(false);
        }
      }
    }

    loadSalesOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        setLoading(true);
        setError("");

        const data = await getDashboardSummary();

        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentOrders() {
      try {
        setOrdersLoading(true);
        setOrdersError("");

        const result = await getRecentOrders();

        if (!cancelled) {
          setRecentOrders(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setOrdersError(err.message || "Failed to load recent orders");
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    }

    loadRecentOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      title: "Total Products",
      value: summary ? numberFormatter.format(summary.totalProducts) : "—",
      description: "Products in catalog",
      icon: Boxes,
    },
    {
      title: "Total Customers",
      value: summary ? numberFormatter.format(summary.totalCustomers) : "—",
      description: "Registered customers",
      icon: Users,
    },
    {
      title: "Total Orders",
      value: summary ? numberFormatter.format(summary.totalOrders) : "—",
      description: "Orders recorded",
      icon: ShoppingCart,
    },
    {
      title: "Total Sales",
      value: summary ? numberFormatter.format(summary.totalSales) : "—",
      description: "Sales value",
      icon: Wallet,
    },
  ];

  return (
    <section className="space-y-7">
      <header>
        <p className="text-sm font-medium text-indigo-600">OVERVIEW</p>

        <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Business Overview
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Monitor your products, customers, orders, and sales in one place.
            </p>
          </div>

          <p className="text-xs text-slate-400">W3Admin Dashboard</p>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-red-700">
            Failed to load dashboard data: {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="self-start text-sm font-medium text-red-700 hover:text-red-900 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            {...stat}
            description={loading ? "Loading data..." : stat.description}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <section className="min-h-80 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
          <h2 className="font-semibold text-slate-900">Sales Overview</h2>
          <p className="mt-1 text-sm text-slate-500">
            Monthly sales performance from your order history.
          </p>

          <div className="mt-6 h-64 w-full">
            {salesLoading ? (
              <div className="grid h-full place-items-center text-sm text-slate-500">
                Loading sales data...
              </div>
            ) : salesError ? (
              <div
                role="alert"
                className="grid h-full place-items-center text-sm text-red-600"
              >
                Could not load sales data: {salesError}
              </div>
            ) : salesData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-500">
                No sales data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesData}
                  margin={{ top: 10, right: 8, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#4F46E5"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#06B6D4"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="period"
                    tickFormatter={(period) =>
                      new Date(`${period}-15T12:00:00`).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "2-digit",
                        },
                      )
                    }
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                  />

                  <YAxis
                    width={65}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                    tick={{ fill: "#94A3B8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(Number(value)),
                      "Sales",
                    ]}
                    labelFormatter={(period) =>
                      new Date(`${period}-15T12:00:00`).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fill="url(#salesGradient)"
                    activeDot={{
                      r: 5,
                      fill: "#4F46E5",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Recent Orders</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest transactions from your store.
              </p>
            </div>

            <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
              Latest 5
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {ordersLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading recent orders...
              </p>
            ) : ordersError ? (
              <p role="alert" className="py-8 text-center text-sm text-red-600">
                Could not load recent orders: {ordersError}
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No orders found.
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-start gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ShoppingCart size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {order.customerName || "Unknown customer"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Order #{order.id}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                        }).format(Number(order.total) || 0)}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span>
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "Date unavailable"}
                      </span>
                      <span>{order.itemCount} items</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
