import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus, Search, Pencil, Trash2, RotateCw } from "lucide-react";

import { apiRequest } from "../../../services/api";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../products.api";

import DataTable from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";

const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  supplierId: "",
  categoryId: "",
  unit: "",
  price: "",
};

const glassPanel =
  "overflow-hidden rounded-2xl border border-white/80 bg-white/65 shadow-[0_12px_36px_rgba(15,70,45,0.07)] backdrop-blur-xl";

const fieldClassName =
  "w-full rounded-xl border border-emerald-950/10 bg-white/70 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

const primaryButtonClassName =
  "bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [metadataError, setMetadataError] = useState("");

  const [modalMode, setModalMode] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function loadMetadata() {
      try {
        const [categoryResponse, supplierResponse] = await Promise.all([
          apiRequest("/categories"),
          apiRequest("/suppliers"),
        ]);

        if (!cancelled) {
          setCategories(categoryResponse.data ?? []);
          setSuppliers(supplierResponse.data ?? []);
          setMetadataError("");
        }
      } catch (error) {
        if (!cancelled) {
          setMetadataError(
            error.message || "Failed to load categories and suppliers.",
          );
        }
      }
    }

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getProducts({
        search,
        categoryId,
        page,
        limit: PAGE_SIZE,
      });

      setProducts(response.data ?? []);
      setPagination(
        response.pagination ?? {
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
        },
      );
    } catch (error) {
      setProducts([]);
      setPageError(error.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categoryNames = useMemo(
    () => new Map(categories.map((item) => [item.id, item.name])),
    [categories],
  );

  const supplierNames = useMemo(
    () => new Map(suppliers.map((item) => [item.id, item.name])),
    [suppliers],
  );

  function openCreateModal() {
    setSelectedProduct(null);
    setForm(emptyForm);
    setFormError("");
    setModalMode("create");
  }

  function openEditModal(product) {
    setSelectedProduct(product);
    setForm({
      name: product.name ?? "",
      supplierId: String(product.supplierId ?? ""),
      categoryId: String(product.categoryId ?? ""),
      unit: product.unit ?? "",
      price: String(product.price ?? ""),
    });
    setFormError("");
    setModalMode("edit");
  }

  function openDeleteModal(product) {
    setSelectedProduct(product);
    setFormError("");
    setModalMode("delete");
  }

  function closeModal() {
    if (saving) return;

    setModalMode(null);
    setSelectedProduct(null);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const price = Number(form.price);
    const supplierIdValue = Number(form.supplierId);
    const categoryIdValue = Number(form.categoryId);

    if (
      !form.name.trim() ||
      !form.unit.trim() ||
      !form.supplierId ||
      !form.categoryId ||
      form.price.trim() === ""
    ) {
      setFormError("Please complete all fields.");
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(supplierIdValue) ||
      !Number.isInteger(categoryIdValue)
    ) {
      setFormError("Please enter valid supplier, category, and price values.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      supplierId: supplierIdValue,
      categoryId: categoryIdValue,
      unit: form.unit.trim(),
      price,
    };

    setSaving(true);

    try {
      if (modalMode === "edit") {
        await updateProduct(selectedProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setModalMode(null);
      setSelectedProduct(null);
      setForm(emptyForm);

      if (modalMode === "create") {
        setPage(1);
      }

      await loadProducts();
    } catch (error) {
      setFormError(error.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedProduct) return;

    setSaving(true);
    setFormError("");

    try {
      await deleteProduct(selectedProduct.id);
      setModalMode(null);
      setSelectedProduct(null);

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProducts();
      }
    } catch (error) {
      setFormError(error.message || "Failed to delete product.");
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
      cellClassName: "font-mono text-xs text-slate-500",
      render: (product) => `#${product.id}`,
    },
    {
      key: "name",
      header: "Product",
      render: (product) => (
        <div>
          <p className="font-medium text-slate-900">{product.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {product.unit || "No unit specified"}
          </p>
        </div>
      ),
    },
    {
      key: "categoryId",
      header: "Category",
      render: (product) => (
        <span className="text-slate-600">
          {categoryNames.get(product.categoryId) ??
            `Category #${product.categoryId}`}
        </span>
      ),
    },
    {
      key: "supplierId",
      header: "Supplier",
      render: (product) => (
        <span className="text-slate-600">
          {supplierNames.get(product.supplierId) ??
            `Supplier #${product.supplierId}`}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      className: "text-right",
      cellClassName: "text-right font-medium tabular-nums text-slate-900",
      render: (product) =>
        Number(product.price).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cellClassName: "text-right",
      render: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${product.name}`}
            onClick={() => openEditModal(product)}
          >
            <Pencil size={15} />
            Edit
          </Button>
          <button
            type="button"
            onClick={() => openDeleteModal(product)}
            aria-label={`Delete ${product.name}`}
            title={`Delete ${product.name}`}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6 sm:space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
            <Package size={14} />
            INVENTORY
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your products, categories, and suppliers.
          </p>
        </div>

        <Button onClick={openCreateModal} className={primaryButtonClassName}>
          <Plus size={16} />
          Add Product
        </Button>
      </header>

      {metadataError && (
        <div
          role="status"
          className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm text-amber-900 backdrop-blur"
        >
          {metadataError} Dropdown data may be incomplete.
        </div>
      )}

      <section className={glassPanel}>
        <div className="flex flex-col gap-4 border-b border-emerald-950/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">All Products</h2>
            <p className="mt-1 text-xs text-slate-500">
              {pagination.total} products in total
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className={`${fieldClassName} py-2.5 pl-10`}
              />
            </div>

            <select
              value={categoryId}
              onChange={(event) => {
                setCategoryId(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className={`${fieldClassName} sm:w-52`}
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <Button
              variant="secondary"
              onClick={loadProducts}
              disabled={loading}
              aria-label="Refresh products"
              title="Refresh products"
              className="self-end border-emerald-950/10 bg-white/70 text-slate-600 hover:bg-emerald-50 sm:self-auto"
            >
              <RotateCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>

        {pageError && (
          <div
            role="alert"
            className="m-4 flex flex-col gap-3 rounded-xl border border-rose-200/80 bg-rose-50/80 p-4 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{pageError}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="self-start rounded-lg px-3 py-1.5 font-medium transition hover:bg-rose-100 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyTitle={
            search || categoryId ? "No matching products" : "No products yet"
          }
          emptyDescription={
            search || categoryId
              ? "Try changing your search or category filter."
              : "Add your first product to get started."
          }
          emptyAction={
            !search && !categoryId ? (
              <Button
                size="sm"
                onClick={openCreateModal}
                className={primaryButtonClassName}
              >
                <Plus size={15} />
                Add Product
              </Button>
            ) : undefined
          }
        />

        <Pagination
          page={pagination.page || page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit || PAGE_SIZE}
          onPageChange={setPage}
        />
      </section>

      <Modal
        open={modalMode === "create" || modalMode === "edit"}
        onClose={closeModal}
        title={modalMode === "edit" ? "Edit Product" : "Add Product"}
        description={
          modalMode === "edit"
            ? "Update the details for this product."
            : "Enter the details for the new product."
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="product-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Product name
            </label>
            <input
              id="product-name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              required
              className={fieldClassName}
              placeholder="Enter product name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="product-category"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="product-category"
                name="categoryId"
                value={form.categoryId}
                onChange={handleFormChange}
                required
                className={fieldClassName}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="product-supplier"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Supplier
              </label>
              <select
                id="product-supplier"
                name="supplierId"
                value={form.supplierId}
                onChange={handleFormChange}
                required
                className={fieldClassName}
              >
                <option value="">Select supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="product-unit"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Unit
              </label>
              <input
                id="product-unit"
                name="unit"
                value={form.unit}
                onChange={handleFormChange}
                required
                className={fieldClassName}
                placeholder="e.g. 10 boxes x 20 bags"
              />
            </div>

            <div>
              <label
                htmlFor="product-price"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Price (USD)
              </label>
              <input
                id="product-price"
                name="price"
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={handleFormChange}
                required
                className={fieldClassName}
                placeholder="0.00"
              />
            </div>
          </div>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-sm text-rose-800"
            >
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-emerald-950/5 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
              className="border-emerald-950/10 bg-white/70 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              disabled={saving}
              className={primaryButtonClassName}
            >
              {modalMode === "edit" ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalMode === "delete"}
        onClose={closeModal}
        title="Delete Product"
        description="This action cannot be undone."
        size="md"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              {selectedProduct?.name}
            </span>
            ?
          </p>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200/80 bg-rose-50/80 p-3 text-sm text-rose-800"
            >
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-emerald-950/5 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={saving}
              className="border-emerald-950/10 bg-white/70 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={saving}
              disabled={saving}
            >
              <Trash2 size={16} />
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
