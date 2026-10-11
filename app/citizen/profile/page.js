import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { DEMO_REPORTS } from "@/lib/demo-data";

export const metadata = { title: "Profile" };

const USER = { name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", ward: "Ward 42", city: "Bangalore", joined: "March 2024", role: "Citizen" };

export default function ProfilePage() {
  const myReports = DEMO_REPORTS.filter(r => r.reportedBy === "Rahul Sharma");

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" subtitle="Manage your account and preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <Card className="lg:col-span-1 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold mx-auto">RS</span>
          <h2 className="mt-3 text-base font-bold text-slate-800">{USER.name}</h2>
          <p className="text-xs text-slate-500">{USER.email}</p>
          <Badge variant="brand" size="sm" className="mt-2">{USER.role}</Badge>
          <p className="mt-2 text-[11px] text-slate-400">Member since {USER.joined}</p>
          <CardDivider />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div><p className="text-xl font-bold text-slate-800">{myReports.length}</p><p className="text-[10px] text-slate-500">Reports</p></div>
            <div><p className="text-xl font-bold text-green-600">{myReports.filter(r=>r.status==="Resolved").length}</p><p className="text-[10px] text-slate-500">Resolved</p></div>
            <div><p className="text-xl font-bold text-amber-600">{myReports.filter(r=>r.status==="Open").length}</p><p className="text-[10px] text-slate-500">Open</p></div>
          </div>
          <div className="mt-4"><Button variant="outline" size="sm" fullWidth>Edit Photo</Button></div>
        </Card>

        {/* Details + settings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal info */}
          <Card>
            <CardHeader title="Personal Information" action={<Button variant="outline" size="sm">Edit</Button>} className="mb-4"/>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              {[
                { l: "Full Name",   v: USER.name },
                { l: "Email",       v: USER.email },
                { l: "Phone",       v: USER.phone },
                { l: "Ward",        v: USER.ward },
                { l: "City",        v: USER.city },
                { l: "Role",        v: USER.role },
              ].map(f => (
                <div key={f.l}>
                  <p className="text-[11px] text-slate-400 font-medium">{f.l}</p>
                  <p className="text-sm text-slate-700 mt-0.5">{f.v}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader title="Change Password" className="mb-4"/>
            <div className="space-y-3 max-w-sm">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Confirm New Password</label>
                <input type="password" placeholder="••••••••" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <Button size="sm">Update Password</Button>
            </div>
            <p className="mt-3 text-[10px] text-slate-400">Password change is UI-only in demo.</p>
          </Card>

          {/* My recent reports */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <CardHeader title="My Recent Reports"/>
              <Link href="/citizen/my-reports"><Button variant="ghost" size="sm">View all →</Button></Link>
            </div>
            <div className="divide-y divide-slate-100">
              {myReports.slice(0,3).map((r) => (
                <Link key={r.id} href={`/citizen/my-reports/${r.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                    <p className="text-xs text-slate-500">{r.category}</p>
                  </div>
                  <Badge variant={r.status==="Resolved"?"success":r.status==="In Progress"?"info":"warning"} size="sm" dot>{r.status}</Badge>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
