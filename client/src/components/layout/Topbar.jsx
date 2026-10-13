import { useLocation } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

const pageTitles = {
  "/": "Overview",
  "/products": "Products",
  "/customers": "Customers",
  "/categories": "Categories",
  "/settings": "Settings",
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] ?? "W3Admin";

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h1>
          <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
            Manage your business in one place.
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <span className="hidden text-xs text-slate-500 md:block">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date())}
        </span>

        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

        <button
          type="button"
          aria-label="Notifications"
          title="Notifications"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell size={19} strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
            AD
          </div>

          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800">
              Administrator
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">Admin account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
