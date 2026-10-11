import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DEMO_DEPARTMENTS } from "@/lib/demo-data";

export const metadata = { title: "Departments" };

export default function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="City department directory, contacts, and performance metrics."
        actions={<Button size="sm">+ Add Department</Button>}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {DEMO_DEPARTMENTS.map((dept) => {
          const resolveRate = Math.round((dept.resolvedThisMonth / (dept.resolvedThisMonth + dept.activeIssues)) * 100);
          return (
            <Card key={dept.id}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{dept.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Head: {dept.head}</p>
                  <p className="text-xs text-slate-400">{dept.phone}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 text-sm font-bold shrink-0">
                  {dept.name[0]}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="rounded-lg bg-amber-50 py-2">
                  <p className="text-lg font-bold text-amber-600">{dept.activeIssues}</p>
                  <p className="text-[10px] text-slate-500">Open</p>
                </div>
                <div className="rounded-lg bg-green-50 py-2">
                  <p className="text-lg font-bold text-green-600">{dept.resolvedThisMonth}</p>
                  <p className="text-[10px] text-slate-500">Resolved</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-lg font-bold text-slate-700">{dept.avgResponse}</p>
                  <p className="text-[10px] text-slate-500">Avg Resp.</p>
                </div>
              </div>

              {/* Resolution rate bar */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Resolution Rate</span>
                  <span>{resolveRate}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${resolveRate >= 70 ? "bg-green-500" : resolveRate >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${resolveRate}%` }} />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View Issues</Button>
                <Button variant="ghost" size="sm" className="flex-1">Edit</Button>
              </div>
            </Card>
          );
        })}
      </div>
      <p className="text-center text-xs text-slate-400">Demo data only.</p>
    </div>
  );
}
