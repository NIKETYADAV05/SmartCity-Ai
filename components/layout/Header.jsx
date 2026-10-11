/**
 * Header.jsx
 * Top navigation bar — mobile menu toggle, notifications, user avatar, logout.
 * Accepts `user` prop from AppShell (populated by the server layout).
 */
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function HamburgerIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

/** Derive up-to-2-char initials from a display name or email. */
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "U";
}

/**
 * @param {{
 *   onMenuToggle: () => void,
 *   notificationCount?: number,
 *   user?: { name: string, email: string },
 * }} props
 */
export default function Header({ onMenuToggle, notificationCount = 0, user }) {
  const router = useRouter();

  const displayName = user?.name ?? "User";
  const initials    = getInitials(displayName);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className={cn(
      "fixed top-0 right-0 z-20",
      "left-0 lg:left-64",
      "h-14 bg-white border-b border-slate-200",
      "flex items-center px-4 gap-3"
    )}>
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Open navigation menu"
      >
        <HamburgerIcon />
      </button>

      {/* Admin indicator if inside admin portal */}
      {isAdmin && (
        <div className="hidden sm:flex items-center gap-1.5">
          <Link
            href="/citizen/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
          >
            <span>👤</span>
            <span>Switch to Citizen View</span>
          </Link>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Notifications */}
      <Link
        href="/citizen/notifications"
        className="relative p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
      >
        <BellIcon />
        {notificationCount > 0 && (
          <span className="absolute top-0.5 right-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </Link>

      {/* User avatar + name */}
      <Link
        href="/citizen/profile"
        className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Your profile"
      >
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold select-none">
          {initials}
        </span>
        <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
          {displayName}
        </span>
      </Link>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        aria-label="Sign out"
        title="Sign out"
      >
        <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
      </button>
    </header>
  );
}
