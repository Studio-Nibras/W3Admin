import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const mainNavigation = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Customers", path: "/customers", icon: Users },
  { label: "Categories", path: "/categories", icon: Tags },
  { label: "Activity Log", path: "/activity-logs", icon: Activity },
];

export default function Sidebar({ open = false, onClose }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;

    function handlePointerDown(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userMenuOpen]);

  function closeUserMenu() {
    setUserMenuOpen(false);
    onClose?.();
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setLoggingOut(false);
      closeUserMenu();
      navigate("/login", { replace: true });
    }
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-emerald-950/25 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-3 left-3 z-50 group/sidebar flex w-[min(86vw,300px)] flex-col overflow-visible rounded-[24px]",
          "border border-white/70 bg-white/55 shadow-[0_16px_48px_rgba(15,70,45,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl",
          "transition-[width,transform] duration-300 ease-out lg:w-[76px] lg:hover:w-[240px] lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-[110%] lg:translate-x-0",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/75 via-white/35 to-emerald-100/30"
        />

        <div className="relative z-10 flex h-[72px] shrink-0 items-center justify-between border-b border-emerald-950/5 px-4 lg:justify-center lg:group-hover/sidebar:justify-start">
          <div className="flex items-center gap-3 lg:w-full lg:justify-center lg:group-hover/sidebar:justify-start">
            <NavLink
              to="/"
              onClick={onClose}
              aria-label="W3Admin overview"
              className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-400 via-emerald-600 to-green-700 text-lg font-bold text-white shadow-[0_6px_18px_rgba(5,150,105,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_9px_22px_rgba(5,150,105,0.38)]"
            >
              W
            </NavLink>

            <div className="lg:max-w-0 lg:overflow-hidden lg:whitespace-nowrap lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:group-hover/sidebar:max-w-40 lg:group-hover/sidebar:opacity-100">
              <p className="text-sm font-semibold text-slate-900">W3Admin</p>
              <p className="mt-0.5 text-xs text-slate-500">Admin Workspace</p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="rounded-xl border border-white/70 bg-white/60 p-2 text-slate-500 transition hover:bg-white hover:text-emerald-800 lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="relative z-10 flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5 lg:items-center lg:gap-2 lg:group-hover/sidebar:items-stretch"
        >
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 lg:hidden">
            Main menu
          </p>

          {mainNavigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              aria-label={label}
              title={label}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "relative flex min-h-11 w-full shrink-0 items-center gap-3 rounded-2xl px-3 transition-all duration-300",
                  "lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:group-hover/sidebar:w-full lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:gap-3 lg:group-hover/sidebar:px-3",
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-[0_5px_16px_rgba(5,150,105,0.24)] lg:bg-gradient-to-br"
                    : "text-slate-600 hover:bg-white/75 hover:text-emerald-800 hover:shadow-sm lg:text-slate-500",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-lime-300 lg:left-0 lg:top-1/2 lg:bottom-auto lg:h-6 lg:w-[3px] lg:-translate-y-1/2 lg:bg-gradient-to-b lg:from-lime-300 lg:to-emerald-600 lg:shadow-[0_0_10px_rgba(16,185,129,0.45)]" />
                  )}

                  <Icon size={19} strokeWidth={1.8} className="shrink-0" />

                  <span className="text-sm font-medium lg:max-w-0 lg:overflow-hidden lg:whitespace-nowrap lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:group-hover/sidebar:max-w-40 lg:group-hover/sidebar:opacity-100">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          ref={userMenuRef}
          className="relative z-20 shrink-0 border-t border-emerald-950/5 p-3 lg:flex lg:justify-center lg:py-4 lg:group-hover/sidebar:justify-start"
        >
          {userMenuOpen && (
            <div
              id="account-menu"
              className="absolute bottom-full left-3 right-3 z-[80] mb-2 rounded-2xl border border-white/80 bg-white/85 p-1.5 shadow-[0_16px_40px_rgba(15,70,45,0.18)] backdrop-blur-2xl lg:bottom-2 lg:left-[62px] lg:right-auto lg:mb-0 lg:w-52"
            >
              <div className="rounded-xl border-b border-emerald-100/70 px-3 py-2.5">
                <p className="text-sm font-semibold text-slate-900">
                  {admin?.name || "Administrator"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {admin?.email || "Admin account"}
                </p>
              </div>

              <NavLink
                to="/settings"
                onClick={closeUserMenu}
                className={({ isActive }) =>
                  [
                    "mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-emerald-100/80 text-emerald-800"
                      : "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-800",
                  ].join(" ")
                }
              >
                <Settings size={16} />
                Settings
              </NavLink>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                <LogOut size={16} />
                {loggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}

          <button
            type="button"
            aria-expanded={userMenuOpen}
            aria-controls="account-menu"
            aria-label="Account settings"
            onClick={() => setUserMenuOpen((current) => !current)}
            className={[
              "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition duration-200",
              "lg:h-10 lg:w-10 lg:justify-center lg:rounded-2xl lg:p-0 lg:group-hover/sidebar:w-full lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-2",
              userMenuOpen
                ? "border-emerald-300/80 bg-emerald-100/80 text-emerald-800"
                : "border-white/80 bg-white/55 text-emerald-800 hover:bg-white/85 hover:shadow-sm",
            ].join(" ")}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-xs font-semibold text-white shadow-sm lg:size-9 lg:rounded-2xl">
              AD
            </span>

            <span className="min-w-0 flex-1 lg:max-w-0 lg:overflow-hidden lg:whitespace-nowrap lg:opacity-0 lg:transition-[max-width,opacity] lg:duration-200 lg:group-hover/sidebar:max-w-40 lg:group-hover/sidebar:opacity-100">
              <span className="block truncate text-sm font-semibold text-slate-800">
                {admin?.name || "Administrator"}
              </span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {admin?.email || "Account settings"}
              </span>
            </span>

            <ChevronDown
              size={16}
              className={[
                "shrink-0 text-slate-400 transition-transform lg:hidden",
                userMenuOpen ? "rotate-180" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
