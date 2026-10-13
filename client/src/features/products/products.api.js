import { apiRequest } from "../../services/api";

export function getProducts({
  search = "",
  categoryId = "",
  page = 1,
  limit = 10,
} = {}) {
  const params = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });

  if (categoryId !== "") {
    params.set("categoryId", String(categoryId));
  }

  return apiRequest(`/products?${params.toString()}`);
}

export function getProduct(id) {
  return apiRequest(`/products/${id}`);
}

export function createProduct(product) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updateProduct(id, product) {
  return apiRequest(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
}
