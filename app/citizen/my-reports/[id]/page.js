export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/demo-data";
import { getReportById, getAllReports } from "@/lib/reports-store";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import StaticMapPreview from "@/components/map/StaticMapPreview";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Report ${id}` };
}

export default async function ReportDetailPage({ params }) {
  const { id } = await params;
  const report = getReportById(id) || getAllReports().find((r) => r.id === id);
  if (!report) notFound();

  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.Open;
  const priority = PRIORITY_CONFIG[report.priority] ?? PRIORITY_CONFIG.Low;

  const timeline = [
    { label: "Submitted", date: report.reportedAt, note: "Report received and reference number issued.", done: true },
    { label: "Under Review", date: report.status !== "Open" ? report.updatedAt : null, note: "Being reviewed by municipal agency.", done: report.status !== "Open" },
    { label: "In Progress", date: ["In Progress", "Resolved"].includes(report.status) ? report.updatedAt : null, note: "Field team dispatched to location.", done: ["In Progress", "Resolved"].includes(report.status) },
    { label: "Resolved", date: report.status === "Resolved" ? report.updatedAt : null, note: "Issue resolved and validated.", done: report.status === "Resolved" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Report: ${report.id}`}
        subtitle={report.title}
        actions={
          <div className="flex gap-2">
            <Link href="/citizen/map">
              <Button variant="outline" size="sm">🗺️ City Map</Button>
            </Link>
            <Link href="/citizen/my-reports">
              <Button variant="outline" size="sm">← My Reports</Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Detail */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={status.variant} dot>{report.status}</Badge>
            <Badge variant={priority.variant}>{report.priority}</Badge>
            <span className="text-xs text-slate-400 font-mono">{report.id}</span>
          </div>
          <CardDivider />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 text-sm">
            {[
              { l: "Category", v: report.category },
              { l: "Department", v: report.department },
              { l: "Location", v: report.location },
              { l: "Reported", v: formatDate(report.reportedAt) },
              { l: "Last Updated", v: formatDate(report.updatedAt) },
              { l: "Submitted By", v: report.reportedBy },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-xs text-slate-400">{l}</p>
                <p className="font-semibold text-slate-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          <CardDivider />
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3 border border-slate-200">
              {report.description || "No description provided."}
            </p>
          </div>

          {/* Incident Photographic Evidence */}
          {(report.imageUrl || report.image_url) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Photographic Evidence Attached
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-950 p-2 overflow-hidden shadow-xs flex justify-center items-center max-h-80">
                <img
                  src={report.imageUrl || report.image_url}
                  alt={report.title}
                  className="max-h-76 w-auto rounded-xl object-contain"
                />
              </div>
            </div>
          )}

          {/* Interactive Geoapify Static Map Preview */}
          {report.lat && report.lng && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Geotagged Incident Location (Geoapify)
              </p>
              <StaticMapPreview
                lat={report.lat}
                lng={report.lng}
                zoom={15}
                title={report.title}
                category={report.category}
                height={200}
                className="w-full"
              />
            </div>
          )}
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader title="Tracking Timeline" subtitle="Live progress of your report" className="mb-4" />
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timeline.map((step, i) => (
              <div key={i} className="relative">
                <span
                  className={`absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    step.done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {step.done ? "✓" : i + 1}
                </span>
                <p className="text-xs font-semibold text-slate-800">{step.label}</p>
                {step.date && <p className="text-[11px] text-slate-400">{formatDate(step.date)}</p>}
                <p className="text-xs text-slate-500 mt-0.5">{step.note}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
