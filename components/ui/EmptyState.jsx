/**
 * EmptyState.jsx
 * Friendly placeholder shown when a list or section has no content.
 */
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   icon?: React.ReactNode,
 *   title: string,
 *   description?: string,
 *   action?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function EmptyState({ icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed",
        "border-slate-200 bg-slate-50 py-14 px-6 text-center",
        className
      )}
    >
      {icon && (
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          {icon}
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
