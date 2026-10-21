import { apiRequest } from "../../services/api";

export async function getActivityLogs({
  page = 1,
  limit = 10,
  action = "",
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (action) {
    params.set("action", action);
  }

  return apiRequest(`/activity-logs?${params.toString()}`);
}
