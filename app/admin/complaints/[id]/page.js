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
import AdminComplaintInspector from "@/components/admin/AdminComplaintInspector";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Complaint ${id}` };
}

export default async function AdminComplaintDetailPage({ params }) {
  const { id } = await params;
  const report = getReportById(id) || getAllReports().find((r) => r.id === id);
  if (!report) notFound();

  const status = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.Open;
  const priority = PRIORITY_CONFIG[report.priority] ?? PRIORITY_CONFIG.Low;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Complaint: ${report.id}`}
        subtitle={report.title}
        actions={
          <div className="flex gap-2">
            <Link href="/map" target="_blank">
              <Button variant="outline" size="sm">🗺️ City Map</Button>
            </Link>
            <Link href="/admin/complaints">
              <Button variant="outline" size="sm">← All Complaints</Button>
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
              { l: "Reported By", v: report.reportedBy },
              { l: "Submitted", v: formatDate(report.reportedAt) },
              { l: "Last Updated", v: formatDate(report.updatedAt) },
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
                Citizen Incident Photographic Evidence
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

          {/* Interactive Administrative Inspector Console */}
          <AdminComplaintInspector report={report} />
        </Card>

        {/* Sidebar Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Incident Summary" subtitle="Current registered attributes" className="mb-3" />
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Current Phase:</span>
                <Badge variant={status.variant} size="sm">{report.status}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">SLA Severity:</span>
                <Badge variant={priority.variant} size="sm">{report.priority}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Dispatched Agency:</span>
                <span className="font-bold text-slate-800">{report.department}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
