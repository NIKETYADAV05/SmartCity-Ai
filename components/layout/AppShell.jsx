/**
 * AppShell.jsx
 * The main layout wrapper: Sidebar + Header + scrollable content area.
 * Manages sidebar open/close state.
 * Accepts a `user` prop (from the server layout) for Header display.
 */
"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   children: React.ReactNode,
 *   notificationCount?: number,
 *   user?: { name: string, email: string },
 * }} props
 */
export default function AppShell({ children, notificationCount = 0, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header
        onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        notificationCount={notificationCount}
        user={user}
      />

      {/* Main content — offset for sidebar and header */}
      <main
        className={cn(
          "min-h-screen",
          "pt-14",
          "lg:pl-64",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
