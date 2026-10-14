import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-lime-50 text-slate-900 selection:bg-emerald-200">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="fixed inset-x-3 top-3 z-30 flex h-[68px] items-center justify-between rounded-2xl border border-white/80 bg-white/70 px-3 shadow-[0_10px_32px_rgba(15,70,45,0.1)] backdrop-blur-2xl lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation"
          aria-expanded={sidebarOpen}
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-white/70 text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Menu size={19} strokeWidth={1.9} />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-semibold leading-5 text-slate-900">
              W3Admin
            </p>
            <p className="truncate text-[11px] leading-4 text-slate-500">
              Admin workspace
            </p>
          </div>

          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 text-sm font-bold text-white shadow-sm shadow-emerald-800/20">
            W
          </span>
        </div>
      </header>

      <main className="min-h-screen lg:pl-[116px]">
        <div className="mx-auto w-full max-w-[1800px] px-4 pb-4 pt-24 sm:px-6 sm:pb-6 sm:pt-24 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
