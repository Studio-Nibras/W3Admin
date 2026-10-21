import { apiRequest } from "../../services/api";

export function getSettings() {
  return apiRequest("/settings");
}

export function updateProfile(payload) {
  return apiRequest("/settings/profile", {
    method: "PUT",
    body: payload,
  });
}

export function updatePassword(payload) {
  return apiRequest("/settings/password", {
    method: "PUT",
    body: payload,
  });
}
