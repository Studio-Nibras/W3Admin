import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems === 0 || totalPages === 0) return null;

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  ).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - currentPage) <= 1,
  );

  const pageButtonClass =
    "rounded-xl p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3 border-t border-emerald-950/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-700">{startItem}</span>{" "}
        to <span className="font-medium text-slate-700">{endItem}</span> of{" "}
        <span className="font-medium text-slate-700">{totalItems}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`${pageButtonClass} border border-emerald-950/10 text-slate-600 hover:bg-emerald-50`}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((pageNumber, index) => {
          const previousPage = pages[index - 1];
          const hasGap = previousPage && pageNumber - previousPage > 1;

          return (
            <span key={pageNumber} className="contents">
              {hasGap && (
                <span className="px-1 text-slate-400" aria-hidden="true">
                  …
                </span>
              )}

              <button
                type="button"
                aria-label={`Page ${pageNumber}`}
                aria-current={currentPage === pageNumber ? "page" : undefined}
                onClick={() => onPageChange(pageNumber)}
                className={[
                  "min-w-9 rounded-xl px-3 py-2 text-xs font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                  currentPage === pageNumber
                    ? "bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-sm shadow-emerald-800/15"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-800",
                ].join(" ")}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          aria-label="Next page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`${pageButtonClass} border border-emerald-950/10 text-slate-600 hover:bg-emerald-50`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
