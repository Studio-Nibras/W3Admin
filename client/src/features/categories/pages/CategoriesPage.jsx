import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Search, Tags, Trash2 } from "lucide-react";
import { apiRequest } from "../../../services/api";
import DataTable from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: "",
  description: "",
};

const glassPanel =
  "overflow-hidden rounded-2xl border border-white/80 bg-white/65 shadow-[0_12px_36px_rgba(15,70,45,0.07)] backdrop-blur-xl";

const primaryButtonClassName =
  "bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (search) query.set("search", search);

      const result = await apiRequest(`/categories?${query.toString()}`);

      setCategories(result.data ?? []);
      setPagination(
        result.pagination ?? {
          total: result.data?.length ?? 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: result.data?.length ? 1 : 0,
        },
      );
    } catch (err) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreateModal() {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);
    setForm({
      name: category.name ?? "",
      description: category.description ?? "",
    });
    setFormError("");
    setFormOpen(true);
  }

  function closeFormModal() {
    if (saving) return;

    setFormOpen(false);
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setFormError("Category name is required.");
      return;
    }

    setSaving(true);
    setFormError("");
    setNotice("");

    try {
      const payload = { name, description };

      if (editingCategory) {
        await apiRequest(`/categories/${editingCategory.id}`, {
          method: "PUT",
          body: payload,
        });
        setNotice("Category updated successfully.");
      } else {
        await apiRequest("/categories", {
          method: "POST",
          body: payload,
        });
        setNotice("Category created successfully.");
      }

      setFormOpen(false);
      setEditingCategory(null);
      setForm(EMPTY_FORM);
      setPage(1);
      await loadCategories();
    } catch (err) {
      setFormError(err.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await apiRequest(`/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });

      setNotice("Category deleted successfully.");
      setDeletingCategory(null);

      if (categories.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadCategories();
      }
    } catch (err) {
      setDeletingCategory(null);
      setError(err.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-20",
      render: (category) => (
        <span className="font-mono text-xs text-slate-500">#{category.id}</span>
      ),
    },
    {
      key: "name",
      header: "Category",
      render: (category) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 text-emerald-700">
            <Tags size={17} strokeWidth={1.8} />
          </div>
          <span className="font-medium text-slate-900">
            {category.name || "—"}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (category) => (
        <span className="block max-w-md whitespace-normal text-slate-600">
          {category.description || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      cellClassName: "whitespace-nowrap",
      render: (category) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${category.name}`}
            onClick={() => openEditModal(category)}
          >
            <Pencil size={15} />
            Edit
          </Button>
          <button
            type="button"
            aria-label={`Delete ${category.name}`}
            title={`Delete ${category.name}`}
            onClick={() => setDeletingCategory(category)}
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
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
            <Tags size={14} />
            CATALOG
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your product categories and descriptions.
          </p>
        </div>

        <Button onClick={openCreateModal} className={primaryButtonClassName}>
          <Plus size={17} />
          Add Category
        </Button>
      </header>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/75 px-4 py-3 text-sm text-emerald-900 backdrop-blur"
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            className="rounded-lg px-2 py-1 font-medium transition hover:bg-emerald-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm text-rose-800 backdrop-blur"
        >
          <span>{error}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadCategories}
            className="border-rose-200 bg-white/70 text-rose-700 hover:bg-rose-100"
          >
            Retry
          </Button>
        </div>
      )}

      <section className={glassPanel}>
        <div className="flex flex-col gap-4 border-b border-emerald-950/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">All Categories</h2>
            <p className="mt-1 text-xs text-slate-500">
              {pagination.total} categories in total
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              aria-label="Search categories"
              placeholder="Search categories..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-xl border border-emerald-950/10 bg-white/70 py-2.5 pl-10 pr-3 text-sm text-slate-800 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={categories}
          loading={loading}
          emptyTitle={search ? "No matching categories" : "No categories yet"}
          emptyDescription={
            search
              ? "Try another search term."
              : "Create your first category to get started."
          }
          emptyAction={
            !search ? (
              <Button
                size="sm"
                onClick={openCreateModal}
                className={primaryButtonClassName}
              >
                <Plus size={15} />
                Add Category
              </Button>
            ) : null
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
        open={formOpen}
        onClose={closeFormModal}
        title={editingCategory ? "Edit Category" : "Add Category"}
        description={
          editingCategory
            ? "Update the category information."
            : "Enter the information for the new category."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Category name"
            name="name"
            placeholder="e.g. Beverages"
            value={form.name}
            onChange={handleFormChange}
            required
            maxLength={255}
            autoFocus
          />

          <div className="grid gap-1.5">
            <label
              htmlFor="category-description"
              className="text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="category-description"
              name="description"
              placeholder="Describe this category..."
              value={form.description}
              onChange={handleFormChange}
              maxLength={255}
              rows={4}
              className="w-full resize-y rounded-xl border border-emerald-950/10 bg-white/70 px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none backdrop-blur transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
            <p className="text-xs text-slate-400">
              {form.description.length}/255 characters
            </p>
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
              variant="secondary"
              onClick={closeFormModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deletingCategory)}
        onClose={() => {
          if (!deleting) setDeletingCategory(null);
        }}
        title="Delete Category"
        description="This action cannot be undone."
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">{deletingCategory?.name}</strong>
            ? If this category is used by existing products, the deletion will
            be rejected to protect the related data.
          </p>

          <div className="flex justify-end gap-3 border-t border-emerald-950/5 pt-4">
            <Button
              variant="secondary"
              onClick={() => setDeletingCategory(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              <Trash2 size={15} />
              Delete Category
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
