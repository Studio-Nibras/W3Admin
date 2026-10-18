import { apiRequest } from "./api";

export async function getDashboardSummary() {
  return apiRequest("/dashboard/summary");
}

export async function getRecentOrders() {
  return apiRequest("/dashboard/recent-orders");
}

export async function getSalesOverview() {
  return apiRequest("/dashboard/sales-overview");
}
