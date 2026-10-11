/**
 * Table.jsx — Responsive data table with optional empty state.
 */
import { cn } from "@/lib/utils";
import EmptyState from "./EmptyState";

/**
 * @param {{
 *   columns: Array<{ key: string, label: string, className?: string }>,
 *   rows: Array<Record<string, any>>,
 *   renderCell?: (key: string, value: any, row: any) => React.ReactNode,
 *   emptyTitle?: string,
 *   emptyDescription?: string,
 *   className?: string,
 * }} props
 */
export default function Table({
  columns,
  rows,
  renderCell,
  emptyTitle = "No data",
  emptyDescription = "Nothing to display yet.",
  className,
}) {
  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-slate-200", className)}>
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500",
                  col.className
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3 text-slate-700 whitespace-nowrap", col.className)}>
                  {renderCell ? renderCell(col.key, row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
