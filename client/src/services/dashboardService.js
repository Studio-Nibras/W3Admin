const API_URL = "http://localhost:3000/api/dashboard";

export async function getDashboardSummary() {
  const response = await fetch(`${API_URL}/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return response.json();
}

export async function getRecentOrders() {
  const response = await fetch(`${API_URL}/recent-orders`);

  if (!response.ok) {
    throw new Error("Failed to fetch recent orders");
  }

  return response.json();
}

export async function getSalesOverview() {
  const response = await fetch(`${API_URL}/sales-overview`);

  if (!response.ok) {
    throw new Error("Failed to fetch sales overview");
  }

  return response.json();
}
