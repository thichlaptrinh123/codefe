"use client";

import { useState } from "react";
import Sidebar from "./components/shared/sidebar";
import Topbar from "./components/shared/topbar";
import "./styles/admin.css";
import "boxicons/css/boxicons.min.css";
import clsx from "clsx";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
   
    <div className="flex h-screen overflow-hidden bg-[#F5F6F9]">
      {/* SIDEBAR */}
      <aside
        className={clsx(
          "fixed z-40 top-0 left-0 h-full w-64 bg-white border-r shadow transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:static"
        )}
      >
        <Sidebar onToggleSidebar={() => setSidebarOpen(false)} />
      </aside>

      {/* OVERLAY khi sidebar mở ở mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
   
  );
}