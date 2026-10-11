/**
 * utils.js
 * Shared utility functions used across components and pages.
 */

/**
 * Merge class names, filtering out falsy values.
 * A lightweight alternative to clsx/classnames.
 * @param {...string} classes
 * @returns {string}
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format an ISO date string into a human-readable format.
 * @param {string} isoString
 * @param {"short"|"long"|"relative"} format
 * @returns {string}
 */
export function formatDate(isoString, format = "short") {
  if (!isoString) return "—";
  const date = new Date(isoString);

  if (format === "relative") {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }

  if (format === "long") {
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // short (default)
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate a string to a maximum length, appending "…" if truncated.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(text, maxLen = 60) {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "…";
}

/**
 * Convert a number to a compact locale string (1 200 → "1.2K").
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Map a priority / status string to Tailwind colour classes.
 * Returns an object with { bg, text, border } class strings.
 * @param {"danger"|"warning"|"success"|"info"|"default"} variant
 */
export function variantClasses(variant) {
  const map = {
    danger:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"   },
    warning: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
    success: { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
    info:    { bg: "bg-cyan-50",   text: "text-cyan-700",   border: "border-cyan-200"  },
    default: { bg: "bg-slate-100", text: "text-slate-600",  border: "border-slate-200" },
  };
  return map[variant] ?? map.default;
}
