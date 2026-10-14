import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Pencil,
  Plus,
  RotateCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { apiRequest } from "../../../services/api";
import DataTable from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  name: "",
  contactName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
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
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        search,
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      const response = await apiRequest(`/customers?${query.toString()}`);

      setCustomers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openCreateModal() {
    setEditingCustomer(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setFormOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      contactName: customer.contactName || "",
      address: customer.address || "",
      city: customer.city || "",
      postalCode: customer.postalCode || "",
      country: customer.country || "",
    });
    setFormError("");
    setFormOpen(true);
  }

  function closeFormModal() {
    if (saving) return;

    setFormOpen(false);
    setEditingCustomer(null);
    setForm({ ...EMPTY_FORM });
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

    if (!form.name.trim()) {
      setFormError("Customer name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      contactName: form.contactName.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
    };

    setSaving(true);

    try {
      if (editingCustomer) {
        await apiRequest(`/customers/${editingCustomer.id}`, {
          method: "PUT",
          body: payload,
        });
        setNotice("Customer updated successfully.");
      } else {
        await apiRequest("/customers", {
          method: "POST",
          body: payload,
        });
        setNotice("Customer created successfully.");
        setPage(1);
      }

      setFormOpen(false);
      setEditingCustomer(null);
      setForm({ ...EMPTY_FORM });

      if (page === 1 || editingCustomer) {
        await loadCustomers();
      }
    } catch (err) {
      setFormError(err.message || "Failed to save customer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingCustomer) return;

    setDeleting(true);
    setError("");

    try {
      await apiRequest(`/customers/${deletingCustomer.id}`, {
        method: "DELETE",
      });

      setNotice("Customer deleted successfully.");
      setDeletingCustomer(null);

      const remainingItems = customers.length - 1;

      if (remainingItems === 0 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadCustomers();
      }
    } catch (err) {
      setError(err.message || "Failed to delete customer.");
      setDeletingCustomer(null);
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      className: "w-20",
      render: (customer) => (
        <span className="font-mono text-xs text-slate-500">#{customer.id}</span>
      ),
    },
    {
      key: "name",
      header: "Customer",
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-lime-50 text-emerald-700">
            <Building2 size={17} />
          </div>
          <div>
            <p className="font-medium text-slate-900">{customer.name || "—"}</p>
            <p className="mt-1 text-xs text-slate-500">
              {customer.contactName || "No contact"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (customer) => (
        <div>
          <p className="text-slate-700">{customer.address || "—"}</p>
          <p className="mt-1 text-xs text-slate-500">
            {[customer.city, customer.postalCode].filter(Boolean).join(" ") ||
              "—"}
          </p>
        </div>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (customer) => (
        <span className="text-slate-600">{customer.country || "—"}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-32",
      cellClassName: "whitespace-nowrap",
      render: (customer) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${customer.name}`}
            onClick={() => openEditModal(customer)}
          >
            <Pencil size={15} />
            Edit
          </Button>
          <button
            type="button"
            aria-label={`Delete ${customer.name}`}
            title={`Delete ${customer.name}`}
            onClick={() => setDeletingCustomer(customer)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
            <Users size={14} />
            CUSTOMERS
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Customers
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Manage your customer records and contact information.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800"
        >
          <Plus size={16} />
          Add Customer
        </Button>
      </header>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <span>{notice}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={loadCustomers}>
            Retry
          </Button>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">All Customers</h2>
            <p className="mt-1 text-xs text-slate-500">
              {pagination.total} customers in total
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                aria-label="Search customers"
                placeholder="Search customers..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
              />
            </div>

            <Button
              variant="secondary"
              onClick={loadCustomers}
              disabled={loading}
              aria-label="Refresh customers"
              title="Refresh customers"
            >
              <RotateCw size={16} className={loading ? "animate-spin" : ""} />
              <span className="sm:hidden">Refresh</span>
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          getRowKey={(customer) => customer.id}
          loading={loading}
          emptyTitle={search ? "No matching customers" : "No customers yet"}
          emptyDescription={
            search
              ? "Try another search term."
              : "Add your first customer to get started."
          }
          emptyAction={
            !search ? (
              <Button size="sm" onClick={openCreateModal}>
                <Plus size={15} />
                Add Customer
              </Button>
            ) : null
          }
        />

        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.limit}
          onPageChange={setPage}
        />
      </section>

      <Modal
        open={formOpen}
        onClose={closeFormModal}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        description={
          editingCustomer
            ? "Update the customer's information."
            : "Enter the customer's information below."
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Customer name"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Customer name"
              required
              autoFocus
            />

            <Input
              label="Contact name"
              name="contactName"
              value={form.contactName}
              onChange={handleFormChange}
              placeholder="Contact person"
            />

            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleFormChange}
              placeholder="Street address"
              wrapperClassName="sm:col-span-2"
            />

            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleFormChange}
              placeholder="City"
            />

            <Input
              label="Postal code"
              name="postalCode"
              value={form.postalCode}
              onChange={handleFormChange}
              placeholder="Postal code"
            />

            <Input
              label="Country"
              name="country"
              value={form.country}
              onChange={handleFormChange}
              placeholder="Country"
              wrapperClassName="sm:col-span-2"
            />
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              onClick={closeFormModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingCustomer ? "Save Changes" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deletingCustomer)}
        onClose={() => {
          if (!deleting) setDeletingCustomer(null);
        }}
        title="Delete Customer"
        description="This action cannot be undone."
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">{deletingCustomer?.name}</strong>
            ?
          </p>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingCustomer(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              <Trash2 size={15} />
              Delete Customer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
