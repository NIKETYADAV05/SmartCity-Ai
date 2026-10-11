/**
 * Input.jsx
 * Accessible text input with optional label, helper text, and error state.
 */
"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

/**
 * @param {{
 *   label?: string,
 *   helperText?: string,
 *   errorText?: string,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   className?: string,
 * } & React.InputHTMLAttributes<HTMLInputElement>} props
 */
const Input = forwardRef(function Input(
  { label, helperText, errorText, leftIcon, rightIcon, className, id, ...rest },
  ref
) {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const hasError = Boolean(errorText);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 flex items-center text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-white text-sm text-slate-800",
            "placeholder:text-slate-400",
            "px-3 py-2 leading-snug",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 focus:border-blue-500",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400",
            hasError
              ? "border-red-400 focus:ring-red-400"
              : "border-slate-300 hover:border-slate-400",
            leftIcon  && "pl-9",
            rightIcon && "pr-9",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...rest}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 flex items-center text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>
      {hasError && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {errorText}
        </p>
      )}
      {!hasError && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
