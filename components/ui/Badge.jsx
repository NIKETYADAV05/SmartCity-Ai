/**
 * Badge.jsx
 * Small status/label chip used throughout the app.
 * Variants: default | success | warning | danger | info | brand
 */
"use client";

import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  default: "bg-slate-100 text-slate-600 border-slate-200",
  success: "bg-green-50  text-green-700  border-green-200",
  warning: "bg-amber-50  text-amber-700  border-amber-200",
  danger:  "bg-red-50    text-red-700    border-red-200",
  info:    "bg-cyan-50   text-cyan-700   border-cyan-200",
  brand:   "bg-blue-50   text-blue-700   border-blue-200",
};

const SIZE_STYLES = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs     px-2   py-0.5",
  lg: "text-sm     px-2.5 py-1",
};

/**
 * @param {{
 *   variant?: keyof VARIANT_STYLES,
 *   size?: "sm"|"md"|"lg",
 *   dot?: boolean,
 *   className?: string,
 *   children: React.ReactNode,
 * }} props
 */
export default function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
}) {
  const variantCls = VARIANT_STYLES[variant] ?? VARIANT_STYLES.default;
  const sizeCls    = SIZE_STYLES[size]    ?? SIZE_STYLES.md;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium leading-none",
        variantCls,
        sizeCls,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-amber-500",
            variant === "danger"  && "bg-red-500",
            variant === "info"    && "bg-cyan-500",
            variant === "brand"   && "bg-blue-500",
            variant === "default" && "bg-slate-400"
          )}
        />
      )}
      {children}
    </span>
  );
}
