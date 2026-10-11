/**
 * PlaceholderPage.jsx
 * Reusable stub used for pages that aren't implemented yet.
 * Shows a clear, professional "under construction" state.
 */
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

/**
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   icon?: string,       // SVG path d attribute
 *   features?: string[], // Bullet list of planned features
 *   backHref?: string,
 * }} props
 */
export default function PlaceholderPage({
  title,
  subtitle,
  icon,
  features = [],
  backHref = "/",
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <Link href={backHref}>
            <Button variant="outline" size="sm">← Back</Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          {/* Icon placeholder */}
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
            {icon ? (
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={icon} />
              </svg>
            ) : (
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round"/>
              </svg>
            )}
          </span>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              This page is part of the SmartCity AI platform foundation.
              Full functionality will be implemented in upcoming development cycles.
            </p>
          </div>

          {features.length > 0 && (
            <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-4 text-left w-full max-w-md">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                Planned Features
              </p>
              <ul className="space-y-1.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
