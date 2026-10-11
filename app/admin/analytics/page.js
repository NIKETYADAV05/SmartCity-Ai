import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { DEMO_ANALYTICS } from "@/lib/demo-data";

export const metadata = { title: "Analytics" };

function BarChart({ data, valueKey, labelKey, maxValue, color = "bg-blue-500" }) {
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = Math.round((d[valueKey] / maxValue) * 100);
        return (
          <div key={d[labelKey]} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-slate-600 text-right truncate">{d[labelKey]}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded overflow-hidden relative">
              <div className={`h-full rounded ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-10 shrink-0 text-xs text-slate-500 text-right">{d[valueKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const maxMonthly  = Math.max(...DEMO_ANALYTICS.monthlyReports.map(d => d.count));
  const maxCategory = Math.max(...DEMO_ANALYTICS.byCategory.map(d => d.count));
  const maxStatus   = Math.max(...DEMO_ANALYTICS.byStatus.map(d => d.count));

  const totalReports = DEMO_ANALYTICS.byStatus.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Data-driven city issue trends and performance insights." />

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
        ⚠️ Demo data only. Charts use SVG/CSS bars — chart library integration planned for next phase.
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Reports (All Time)", value: totalReports, color: "text-slate-800" },
          { label: "Resolved",     value: DEMO_ANALYTICS.byStatus.find(s=>s.status==="Resolved")?.count ?? 0, color: "text-green-600" },
          { label: "Open",         value: DEMO_ANALYTICS.byStatus.find(s=>s.status==="Open")?.count ?? 0, color: "text-amber-600" },
          { label: "In Progress",  value: DEMO_ANALYTICS.byStatus.find(s=>s.status==="In Progress")?.count ?? 0, color: "text-cyan-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly trend */}
        <Card>
          <CardHeader title="Monthly Report Volume" subtitle="Issues reported per month" className="mb-5"/>
          <BarChart
            data={DEMO_ANALYTICS.monthlyReports}
            valueKey="count" labelKey="month"
            maxValue={maxMonthly} color="bg-blue-500"
          />
        </Card>

        {/* By status */}
        <Card>
          <CardHeader title="Reports by Status" subtitle="Current distribution" className="mb-5"/>
          <BarChart
            data={DEMO_ANALYTICS.byStatus}
            valueKey="count" labelKey="status"
            maxValue={maxStatus} color="bg-violet-500"
          />
          {/* Donut-style summary */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            {DEMO_ANALYTICS.byStatus.map(d => {
              const pct = Math.round((d.count / totalReports) * 100);
              const colors = { Open: "bg-amber-500", "In Progress": "bg-cyan-500", Resolved: "bg-green-500", Closed: "bg-slate-400" };
              return (
                <div key={d.status} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${colors[d.status] ?? "bg-slate-400"}`}/>
                  <span className="text-xs text-slate-600">{d.status}: <strong>{pct}%</strong></span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* By category */}
        <Card className="lg:col-span-2">
          <CardHeader title="Reports by Category" subtitle="All-time breakdown by issue type" className="mb-5"/>
          <BarChart
            data={DEMO_ANALYTICS.byCategory}
            valueKey="count" labelKey="category"
            maxValue={maxCategory} color="bg-emerald-500"
          />
        </Card>

        {/* By priority */}
        <Card>
          <CardHeader title="Reports by Priority" subtitle="Urgency level distribution" className="mb-5"/>
          <BarChart
            data={DEMO_ANALYTICS.byPriority || []}
            valueKey="count" labelKey="priority"
            maxValue={Math.max(...(DEMO_ANALYTICS.byPriority || [{ count: 1 }]).map(d => d.count))}
            color="bg-rose-500"
          />
        </Card>

        {/* Top Wards */}
        <Card>
          <CardHeader title="Top Impacted Wards" subtitle="Complaints registered per city ward" className="mb-5"/>
          <BarChart
            data={DEMO_ANALYTICS.topWards || []}
            valueKey="reports" labelKey="ward"
            maxValue={Math.max(...(DEMO_ANALYTICS.topWards || [{ reports: 1 }]).map(d => d.reports))}
            color="bg-amber-500"
          />
        </Card>

        {/* Resolution Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader title="Average Turnaround Time (Hours)" subtitle="Average hours to resolve issues by day of week" className="mb-5"/>
          <BarChart
            data={DEMO_ANALYTICS.resolutionTimeline || []}
            valueKey="avgHours" labelKey="day"
            maxValue={Math.max(...(DEMO_ANALYTICS.resolutionTimeline || [{ avgHours: 1 }]).map(d => d.avgHours))}
            color="bg-indigo-500"
          />
        </Card>
      </div>
    </div>
  );
}
