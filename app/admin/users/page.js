export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DEMO_USERS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users" };

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        subtitle="Manage citizen accounts, staff roles, and access permissions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm">+ Invite User</Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Users",  value: DEMO_USERS.length,                                          color: "text-slate-800" },
          { label: "Citizens",     value: DEMO_USERS.filter(u=>u.role==="Citizen").length,             color: "text-blue-600" },
          { label: "Admins",       value: DEMO_USERS.filter(u=>u.role==="Admin").length,               color: "text-violet-600" },
          { label: "Active",       value: DEMO_USERS.filter(u=>u.status==="Active").length,            color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-slate-500">Filter:</span>
          {["All","Citizens","Admins","Active","Inactive"].map(f => (
            <button key={f} className={`px-3 py-1 rounded-full text-xs font-medium border ${f==="All"?"border-blue-500 bg-blue-50 text-blue-700":"border-slate-200 text-slate-600 hover:border-slate-300"}`}>{f}</button>
          ))}
          <div className="ml-auto">
            <input placeholder="Search users…" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"/>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50"><tr>
              {["User","Email","Role","Reports","Status","Joined","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {DEMO_USERS.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                        {u.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role==="Admin"?"brand":"default"} size="sm">{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{u.reports}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status==="Active"?"success":"default"} size="sm" dot>{u.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(u.joinedAt, "short")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button className="text-xs text-red-500 hover:underline">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-center text-xs text-slate-400">Demo data only.</p>
    </div>
  );
}
