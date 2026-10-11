export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { DEMO_STATS, DEMO_REPORTS, DEMO_DEPARTMENTS, DEMO_EMERGENCY, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/demo-data";
import { getAllReports } from "@/lib/reports-store";
import { formatDate } from "@/lib/utils";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";

export const metadata = { title: "Admin Dashboard | SmartCity OS" };

function Icon({ d }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const allReports = getAllReports();
  const activeEmergencies = DEMO_EMERGENCY.filter((e) => e.status === "Active");
  const openCount = allReports.filter((r) => r.status === "Open").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Centre"
        subtitle="Real-time municipal operations, GIS spatial telemetry, and complaint tracking."
        actions={
          <div className="flex gap-2">
            <Link
              href="/citizen/dashboard?demo=citizen"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <span>👤</span> Citizen View
            </Link>
            <Link
              href="/admin/complaints"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
            >
              Manage Complaints ({allReports.length})
            </Link>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Reports"
          value={DEMO_STATS.totalReports + Math.max(0, allReports.length - DEMO_REPORTS.length)}
          trend={8}
          variant="brand"
          icon={<Icon d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z" />}
        />
        <StatCard
          label="Active Open"
          value={openCount}
          trend={-5}
          variant="warning"
          icon={<Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />}
        />
        <StatCard
          label="Resolved (Month)"
          value={DEMO_STATS.resolvedThisMonth}
          trend={12}
          variant="success"
          icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="Avg. Resolution"
          value={`${DEMO_STATS.avgResolutionDays}d`}
          trend={-3}
          variant="info"
          icon={<Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="Satisfaction"
          value={`${DEMO_STATS.citizenSatisfaction}%`}
          trend={2}
          variant="success"
          icon={<Icon d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="Active Emergencies"
          value={activeEmergencies.length}
          variant="danger"
          icon={<Icon d="M12 2l9 4v6c0 5-3.5 9.7-9 11C6.5 21.7 3 17 3 12V6l9-4z" />}
        />
      </div>

      {/* Active emergencies alert */}
      {activeEmergencies.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold text-red-700 mb-2">🚨 Active Emergencies ({activeEmergencies.length})</p>
          {activeEmergencies.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs text-red-700">
              <span>{e.title}</span>
              <Link href="/admin/emergency" className="underline font-bold">
                View →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* City Operations GIS Map Widget */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800">City Operations Live GIS Map</h3>
            <p className="text-[11px] text-slate-400">Live Geoapify map tracking incidents, repair crews, and municipal zones</p>
          </div>
          <Link href="/map" className="text-xs text-blue-600 font-semibold hover:underline">
            Fullscreen GIS Mode →
          </Link>
        </div>
        <InteractiveCityMap initialReports={allReports} userRole="admin" height="460px" showSidebar={false} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Recent complaints */}
        <Card className="lg:col-span-3" padding="none">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <CardHeader title="Recent Complaints" subtitle="Latest reported issues" />
            <Link href="/admin/complaints" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {["Issue", "Category", "Status", "Priority", "Dept", "Date"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase text-slate-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {allReports.slice(0, 6).map((r) => {
                  const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.Open;
                  const p = PRIORITY_CONFIG[r.priority] ?? PRIORITY_CONFIG.Low;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 max-w-[180px]">
                        <p className="truncate font-semibold text-slate-800 text-xs">{r.title}</p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{r.category}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={s.variant} size="sm" dot>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={p.variant} size="sm">
                          {r.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">{r.department}</td>
                      <td className="px-4 py-2.5 text-xs text-slate-400">{formatDate(r.reportedAt, "short")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Department load */}
        <Card className="lg:col-span-2">
          <CardHeader title="Department Load" subtitle="Active issues per department" className="mb-4" />
          <div className="space-y-3">
            {DEMO_DEPARTMENTS.map((dept) => {
              const max = Math.max(...DEMO_DEPARTMENTS.map((d) => d.activeIssues));
              const pct = Math.round((dept.activeIssues / max) * 100);
              return (
                <div key={dept.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium truncate">{dept.name}</span>
                    <span className="text-slate-500 shrink-0 ml-2">{dept.activeIssues}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/admin/departments" className="mt-4 block text-xs text-blue-600 hover:underline text-center">
            View departments →
          </Link>
        </Card>
      </div>
    </div>
  );
}
