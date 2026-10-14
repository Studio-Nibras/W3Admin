const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiRequest(path, options = {}) {
  const headers = {
    ...options.headers,
  };

  let body = options.body;

  if (body !== undefined && body !== null) {
    if (typeof body === "object" && !(body instanceof FormData)) {
      body = JSON.stringify(body);
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    } else if (typeof body === "string") {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
}
