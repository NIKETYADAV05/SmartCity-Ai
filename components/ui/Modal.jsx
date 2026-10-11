"use client";
/**
 * Modal.jsx — Accessible dialog overlay.
 */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      {/* Panel */}
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative w-full rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]",
          sizes[size] ?? sizes.md
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Close">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {/* Footer */}
        {footer && <div className="border-t border-slate-100 px-5 py-3 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
