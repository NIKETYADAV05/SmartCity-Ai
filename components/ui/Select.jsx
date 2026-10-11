/**
 * Select.jsx
 * Styled native <select> with label + error support.
 */
"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Select = forwardRef(function Select(
  { label, helperText, errorText, options = [], placeholder, className, id, ...rest },
  ref
) {
  const selectId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = Boolean(errorText);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-8",
            "text-sm text-slate-800 leading-snug",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            hasError ? "border-red-400" : "border-slate-300 hover:border-slate-400",
            className
          )}
          aria-invalid={hasError}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
      {hasError && <p className="text-xs text-red-600">{errorText}</p>}
      {!hasError && helperText && <p className="text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

export default Select;
