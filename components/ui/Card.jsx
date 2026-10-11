/**
 * Card.jsx
 * Surface container used for panels, widgets, and content blocks.
 */
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   padding?: "none"|"sm"|"md"|"lg",
 *   className?: string,
 *   children: React.ReactNode,
 * }} props
 */
export function Card({ padding = "md", className, children }) {
  const padMap = {
    none: "",
    sm:   "p-3",
    md:   "p-5",
    lg:   "p-6",
  };
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        padMap[padding] ?? padMap.md,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader — optional header slot with title + optional action
 */
export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        {title && (
          <h3 className="text-sm font-semibold text-slate-800 leading-snug">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/**
 * CardDivider — thin horizontal rule inside a card
 */
export function CardDivider({ className }) {
  return <hr className={cn("border-slate-100 my-4", className)} />;
}

export default Card;
