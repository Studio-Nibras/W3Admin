import {
  LayoutDashboard,
  Package,
  Users,
  Tags,
  Settings,
  ChevronLeft,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const mainNavigation = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Categories", path: "/categories", icon: Tags },
];

export default function Sidebar({ open = false, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[76px] flex-col border-r border-slate-200 bg-white",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-[72px] items-center justify-center border-b border-slate-100">
          <NavLink
            to="/"
            onClick={onClose}
            aria-label="W3Admin overview"
            className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm shadow-indigo-600/20"
          >
            W
          </NavLink>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col items-center gap-2 overflow-y-auto py-5"
        >
          {mainNavigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              title={label}
              aria-label={label}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "group relative flex size-10 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-[18px] h-6 w-[3px] rounded-r-full bg-indigo-600" />
                  )}
                  <Icon size={19} strokeWidth={1.8} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-2 border-t border-slate-100 py-4">
          <NavLink
            to="/settings"
            title="Settings"
            aria-label="Settings"
            onClick={onClose}
            className={({ isActive }) =>
              [
                "flex size-10 items-center justify-center rounded-xl transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
              ].join(" ")
            }
          >
            <Settings size={19} strokeWidth={1.8} />
          </NavLink>

          <div
            title="Administrator"
            className="mt-1 flex size-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600"
          >
            AD
          </div>
        </div>
      </aside>
    </>
  );
}
