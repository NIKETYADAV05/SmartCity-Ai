"use client";
/**
 * Navbar.jsx
 * Public-facing navigation bar for marketing/public pages.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "City Map", href: "/map" },
  { label: "AI Engine", href: "/ai/classification" },
  { label: "Administration", href: "/admin?demo=admin" },
  { label: "Citizen Portal", href: "/citizen/dashboard?demo=citizen" },
];

function CityLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M8 21V11m0 0h8m-8 0V7m8 4v10M8 7h8"/>
        </svg>
      </span>
      <span className="text-base font-bold text-slate-900 leading-tight">
        SmartCity <span className="text-blue-600">AI</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <CityLogo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
                pathname === link.href || pathname.startsWith(link.href.split("?")[0])
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/admin?demo=admin"
            className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>🛡️</span>
            <span>Admin Console</span>
          </Link>
          <Link
            href="/citizen/report"
            className="px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            + Report Issue
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium",
                pathname === link.href
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md">Sign In</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white text-center hover:bg-blue-700">Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}
