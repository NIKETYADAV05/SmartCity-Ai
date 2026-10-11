/**
 * Textarea.jsx
 * Multi-line text input with label + error support.
 */
"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  { label, helperText, errorText, className, id, rows = 4, ...rest },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = Boolean(errorText);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2",
          "text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed",
          "resize-y transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          "disabled:cursor-not-allowed disabled:bg-slate-50",
          hasError ? "border-red-400" : "border-slate-300 hover:border-slate-400",
          className
        )}
        aria-invalid={hasError}
        {...rest}
      />
      {hasError && <p className="text-xs text-red-600">{errorText}</p>}
      {!hasError && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

export default Textarea;
