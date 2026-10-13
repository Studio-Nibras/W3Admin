import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="min-h-screen lg:pl-[76px]">
        <div className="mx-auto w-full max-w-[1800px] p-4 sm:p-6 lg:p-8">
          <div className="mb-5 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100"
            >
              <span className="text-sm font-medium">☰ Menu</span>
            </button>
          </div>

          <Outlet />
        </div>
      </main>
    </div>
  );
}
