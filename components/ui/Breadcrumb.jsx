/**
 * Breadcrumb.jsx
 * Navigation breadcrumb trail.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   items: Array<{ label: string, href?: string }>,
 *   className?: string,
 * }} props
 */
export default function Breadcrumb({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-xs", className)}>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <svg
                className="h-3 w-3 text-slate-300 shrink-0"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            )}
            {isLast || !item.href ? (
              <span
                className={cn(
                  isLast ? "font-medium text-slate-700" : "text-slate-500"
                )}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-slate-500 hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
