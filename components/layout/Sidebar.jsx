/**
 * Sidebar.jsx
 * Collapsible left navigation sidebar.
 * On mobile: hidden by default, slides in via overlay.
 * On desktop: fixed width, always visible.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/lib/navigation";
import ComingSoonBadge from "@/components/ui/ComingSoonBadge";

/* ── Inline SVG icons (no external dependency) ── */
function CityIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21V11m0 0h8m-8 0V7m8 4v10M8 7h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function NavIcon({ name }) {
  const icons = {
    HomeIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
    ExclamationCircleIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/>
      </svg>
    ),
    ClipboardDocumentListIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 6h6m-6 4h4"/>
      </svg>
    ),
    MapIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
    BellIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    ),
    UserCircleIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    ChartBarIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="8"/><rect x="10" y="8" width="4" height="12"/><rect x="17" y="4" width="4" height="16"/>
      </svg>
    ),
    InboxStackIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16l-2 7H6L4 4z"/><path d="M6 11l-2 9h16l-2-9"/>
      </svg>
    ),
    BuildingOffice2Icon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="17" rx="1"/><path d="M8 21V9m4 12V9m4 12V9M3 9h18"/>
      </svg>
    ),
    TruckIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    TrashIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
      </svg>
    ),
    LightBulbIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21h6m-6-3h6M12 3a7 7 0 015 11.9V18H7v-3.1A7 7 0 0112 3z"/>
      </svg>
    ),
    ShieldExclamationIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l9 4v6c0 5-3.5 9.7-9 11C6.5 21.7 3 17 3 12V6l9-4z"/><path d="M12 9v3m0 3h.01"/>
      </svg>
    ),
    PresentationChartLineIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/><polyline points="6 13 10 9 14 11 18 7"/>
      </svg>
    ),
    UsersIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
      </svg>
    ),
    Cog6ToothIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    ),
    SparklesIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
      </svg>
    ),
    BoltIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    ArrowsPointingOutIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6m0 0v6m0-6l-7 7M9 21H3m0 0v-6m0 6l7-7"/>
      </svg>
    ),
    MagnifyingGlassCircleIcon: (
      <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6m-3-3h6"/>
      </svg>
    ),
  };
  return icons[name] ?? (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/>
    </svg>
  );
}

/* ── Component ── */
export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col",
          "bg-slate-900 text-slate-100",
          "transition-transform duration-200 ease-in-out",
          // Desktop: always visible
          "lg:translate-x-0",
          // Mobile: slide in/out
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
              <CityIcon />
            </span>
            <span className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white leading-tight truncate">SmartCity AI</span>
              <span className="text-[10px] text-slate-400 leading-tight truncate">Urban Management</span>
            </span>
          </Link>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 no-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.id} className="mb-4">
              <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group.label}
              </p>
              <ul role="list">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.comingSoon ? "#" : item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors duration-100",
                          "rounded-none",
                          active
                            ? "bg-blue-700 text-white font-medium"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                          item.comingSoon && "pointer-events-none opacity-60"
                        )}
                        tabIndex={item.comingSoon ? -1 : undefined}
                      >
                        <span className={cn("shrink-0", active ? "text-white" : "text-slate-500")}>
                          <NavIcon name={item.icon} />
                        </span>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.comingSoon && <ComingSoonBadge />}
                        {item.badge && !item.comingSoon && (
                          <span className={cn(
                            "ml-auto inline-flex h-4.5 min-w-[1.125rem] items-center justify-center",
                            "rounded-full px-1.5 text-[10px] font-bold",
                            item.badgeVariant === "danger"
                              ? "bg-red-500 text-white"
                              : item.badgeVariant === "brand"
                              ? "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-2xs"
                              : "bg-blue-500 text-white"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 px-4 py-3">
          <p className="text-[10px] text-slate-600 leading-snug">
            SmartCity AI — v0.1.0
            <br />
            Demo data only. Not real government data.
          </p>
        </div>
      </aside>
    </>
  );
}
