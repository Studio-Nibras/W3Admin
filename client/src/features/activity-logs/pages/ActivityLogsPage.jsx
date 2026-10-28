import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  LogIn,
  LogOut,
  UserRound,
  Plus,
} from "lucide-react";

import { getActivityLogs } from "../activityLogs.api";
import DataTable from "../../../components/ui/DataTable";
import Pagination from "../../../components/ui/Pagination";
import Button from "../../../components/ui/Button";

const PAGE_SIZE = 10;

const actionOptions = [
  { value: "", label: "All actions" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "ACCOUNT_UPDATE", label: "Account update" },
];

const actionStyles = {
  CREATE: "bg-emerald-50 text-emerald-700",
  UPDATE: "bg-blue-50 text-blue-700",
  DELETE: "bg-rose-50 text-rose-700",
  LOGIN: "bg-violet-50 text-violet-700",
  LOGOUT: "bg-slate-100 text-slate-600",
  ACCOUNT_UPDATE: "bg-amber-50 text-amber-700",
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAction(value) {
  return String(value ?? "UNKNOWN")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatEntity(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getActivityLogs({
        page,
        limit: PAGE_SIZE,
        action,
      });

      setLogs(response.data ?? []);
      setPagination(
        response.pagination ?? {
          total: 0,
          page: 1,
          limit: PAGE_SIZE,
          totalPages: 0,
        },
      );
    } catch (requestError) {
      setLogs([]);
      setError(requestError.message || "Failed to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [page, action]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const columns = [
    {
      key: "createdAt",
      header: "Date & time",
      className: "min-w-[170px]",
      cellClassName: "whitespace-nowrap text-xs text-slate-500",
      render: (log) => formatDate(log.createdAt),
    },
    {
      key: "actorName",
      header: "Admin",
      className: "min-w-[140px]",
      render: (log) => (
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <UserRound size={16} />
          </span>
          <span className="font-medium text-slate-800">
            {log.actorName || "Unknown admin"}
          </span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      className: "min-w-[140px]",
      render: (log) => (
        <span
          className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${
            actionStyles[log.action] ?? "bg-slate-100 text-slate-600"
          }`}
        >
          {formatAction(log.action)}
        </span>
      ),
    },
    {
      key: "entityType",
      header: "Resource",
      className: "min-w-[120px]",
      render: (log) => (
        <div>
          <p className="font-medium text-slate-800">
            {formatEntity(log.entityType)}
          </p>
          {log.entityId != null && (
            <p className="mt-0.5 text-xs text-slate-400">ID: {log.entityId}</p>
          )}
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      className: "min-w-[240px]",
      cellClassName: "max-w-md text-slate-600",
      render: (log) => (
        <span className="break-words">
          {log.description || "No description"}
        </span>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/60 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur">
            <Activity size={14} />
            ACTIVITY
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Activity Logs
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Review administrative actions recorded by W3Admin.
          </p>
        </div>

        <Button
          onClick={loadLogs}
          disabled={loading}
          className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Recorded activities</p>
            <Activity size={18} className="text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination.total.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Activities matching the selected filter
          </p>
        </div>

        <div className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Current page</p>
            <CheckCircle2 size={18} className="text-blue-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">
            {pagination.totalPages > 0 ? page : 0}
            <span className="ml-1 text-sm font-medium text-slate-400">
              / {pagination.totalPages}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {logs.length} activities displayed
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-emerald-950/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Activity history</h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest recorded actions appear first.
            </p>
          </div>

          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-emerald-950/10 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:w-52"
            aria-label="Filter by action"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="m-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Unable to load activity logs</p>
              <p className="mt-1 break-words">{error}</p>
              <button
                type="button"
                onClick={loadLogs}
                className="mt-2 font-semibold underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyTitle={
            error ? "Activity logs unavailable" : "No activities found"
          }
          emptyDescription={
            error
              ? "Check your connection and try again."
              : action
                ? "No activities match this action filter."
                : "Activities will appear here when administrative actions are recorded."
          }
          getRowKey={(log) => log.id}
        />

        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
