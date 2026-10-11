/**
 * StatCard.jsx
 * KPI metric tile used in dashboards.
 */
import { cn, formatNumber } from "@/lib/utils";

/**
 * @param {{
 *   label: string,
 *   value: number | string,
 *   icon?: React.ReactNode,
 *   trend?: number,          // e.g. 12 = +12%, -5 = -5%
 *   trendLabel?: string,
 *   variant?: "default"|"success"|"warning"|"danger"|"info",
 *   className?: string,
 * }} props
 */
export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendLabel = "vs last month",
  variant = "default",
  className,
}) {
  const iconBg = {
    default: "bg-slate-100 text-slate-500",
    success: "bg-green-50  text-green-600",
    warning: "bg-amber-50  text-amber-600",
    danger:  "bg-red-50    text-red-600",
    info:    "bg-cyan-50   text-cyan-600",
    brand:   "bg-blue-50   text-blue-600",
  };

  const trendPositive = trend > 0;
  const trendNeutral  = trend === 0 || trend === undefined;

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 leading-none tracking-tight">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {trend !== undefined && (
            <p className={cn(
              "mt-2 text-xs font-medium flex items-center gap-1",
              trendNeutral  ? "text-slate-500"  :
              trendPositive ? "text-green-600"  :
                              "text-red-600"
            )}>
              <span aria-hidden="true">
                {trendNeutral ? "—" : trendPositive ? "↑" : "↓"}
              </span>
              {!trendNeutral && `${Math.abs(trend)}% `}
              <span className="text-slate-400 font-normal">{trendLabel}</span>
            </p>
          )}
        </div>
        {icon && (
          <span className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            iconBg[variant] ?? iconBg.default
          )}>
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
