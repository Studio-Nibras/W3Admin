import { apiRequest } from "../../services/api";

export function getCurrentAdmin() {
  return apiRequest("/auth/me");
}

export function loginAdmin(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export function logoutAdmin() {
  return apiRequest("/auth/logout", {
    method: "POST",
  });
}
