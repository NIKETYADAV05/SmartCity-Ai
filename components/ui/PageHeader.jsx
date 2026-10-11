/**
 * PageHeader.jsx
 * Consistent top section for every page: title, subtitle, optional actions.
 */
import { cn } from "@/lib/utils";

/**
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   actions?: React.ReactNode,
 *   className?: string,
 * }} props
 */
export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-xl font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
