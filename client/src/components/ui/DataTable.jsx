import { LoaderCircle } from "lucide-react";

export default function DataTable({
  columns,
  data,
  getRowKey = (row) => row.id,
  loading = false,
  emptyTitle = "No data found",
  emptyDescription = "There is no data to display yet.",
  emptyAction,
}) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-5 py-3 font-medium ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-14 text-center">
                <LoaderCircle
                  size={22}
                  className="mx-auto animate-spin text-indigo-600"
                />
                <p className="mt-3 text-sm text-slate-500">Loading data...</p>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-14 text-center">
                <p className="font-medium text-slate-800">{emptyTitle}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {emptyDescription}
                </p>
                {emptyAction && <div className="mt-4">{emptyAction}</div>}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={getRowKey(row)}
                className="transition-colors hover:bg-slate-50/70"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 text-slate-700 ${column.cellClassName ?? ""}`}
                  >
                    {column.render
                      ? column.render(row)
                      : (row[column.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
