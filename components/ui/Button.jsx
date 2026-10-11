/**
 * Button.jsx
 * Accessible, variant-aware button with loading state.
 * Variants: primary | secondary | ghost | danger | outline
 * Sizes: sm | md | lg
 */
"use client";

import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  primary:
    "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 focus-visible:ring-blue-500",
  secondary:
    "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 focus-visible:ring-slate-400",
  ghost:
    "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 focus-visible:ring-slate-400",
  danger:
    "bg-red-600 text-white border-red-600 hover:bg-red-700 focus-visible:ring-red-500",
  outline:
    "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400",
};

const SIZE_STYLES = {
  sm: "h-7  px-2.5 text-xs  gap-1.5",
  md: "h-9  px-4   text-sm  gap-2",
  lg: "h-11 px-5   text-base gap-2",
};

/**
 * @param {{
 *   variant?: keyof VARIANT_STYLES,
 *   size?: "sm"|"md"|"lg",
 *   loading?: boolean,
 *   fullWidth?: boolean,
 *   leftIcon?: React.ReactNode,
 *   rightIcon?: React.ReactNode,
 *   className?: string,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...rest
}) {
  const variantCls = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const sizeCls    = SIZE_STYLES[size]    ?? SIZE_STYLES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg border font-medium",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        variantCls,
        sizeCls,
        fullWidth && "w-full",
        className
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <Spinner className="h-4 w-4 shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
}

function Spinner({ className }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
