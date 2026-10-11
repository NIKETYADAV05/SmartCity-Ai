"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import NotificationItem from "@/components/ui/NotificationItem";
import { DEMO_REPORTS, DEMO_NOTIFICATIONS, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/demo-data";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";

const QUICK_ACTIONS = [
  { label: "Report Issue", href: "/citizen/report", bg: "bg-blue-50", text: "text-blue-600", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
  { label: "My Reports", href: "/citizen/my-reports", bg: "bg-violet-50", text: "text-violet-600", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { label: "City Map", href: "/citizen/map", bg: "bg-emerald-50", text: "text-emerald-600", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
  { label: "Notifications", href: "/citizen/notifications", bg: "bg-amber-50", text: "text-amber-600", icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" },
];

function Icon({ d }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function CitizenDashboardPage() {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const recentNotifs = DEMO_NOTIFICATIONS.slice(0, 3);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        const serverList = data.success && Array.isArray(data.reports) ? data.reports : DEMO_REPORTS;

        let customList = [];
        try {
          customList = JSON.parse(localStorage.getItem("smartcity_custom_reports") || "[]");
        } catch {}

        const map = new Map();
        customList.forEach((r) => map.set(r.id, { ...r, isUserCreated: true }));
        serverList.forEach((r) => {
          if (!map.has(r.id)) map.set(r.id, r);
        });

        setReports(Array.from(map.values()));
      } catch (err) {
        console.error("Dashboard reports load failed:", err);
      }
    }

    loadReports();
  }, []);

  const myReports = reports.filter(
    (r) => r.reportedBy === "Rahul Sharma" || r.isUserCreated || r.reportedBy?.includes("You")
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome back, Citizen 👋"
        subtitle="Here's a live summary of your reported issues and municipal services."
        actions={
          <div className="flex gap-2">
            <Link href="/admin?demo=admin">
              <Button variant="outline" size="sm" className="border-indigo-300 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100">
                🛡️ View Admin Portal
              </Button>
            </Link>
            <Link href="/citizen/report">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                + Report New Issue
              </Button>
            </Link>
          </div>
        }
      />

      {/* My stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="My Reports"
          value={myReports.length}
          variant="brand"
          icon={<Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />}
        />
        <StatCard
          label="Open"
          value={myReports.filter((r) => r.status === "Open").length}
          variant="warning"
          icon={<Icon d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />}
        />
        <StatCard
          label="In Progress"
          value={myReports.filter((r) => r.status === "In Progress").length}
          variant="info"
          icon={<Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <StatCard
          label="Resolved"
          value={myReports.filter((r) => r.status === "Resolved").length}
          variant="success"
          icon={<Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" className="mb-4" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 hover:border-slate-300 hover:shadow-xs transition-all text-center"
            >
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${a.bg} ${a.text}`}>
                <Icon d={a.icon} />
              </span>
              <span className="text-xs font-semibold text-slate-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Map Card */}
      <Card padding="sm">
        <div className="flex items-center justify-between mb-3 px-2 pt-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Neighborhood City Issues Map</h3>
            <p className="text-[10px] text-slate-400">Live Geoapify map of reports around your ward</p>
          </div>
          <Link href="/citizen/map" className="text-xs font-semibold text-blue-600 hover:underline">
            Open Interactive Map →
          </Link>
        </div>
        <InteractiveCityMap initialReports={reports} userRole="citizen" height="380px" showSidebar={false} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Reports */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <CardHeader title="My Recent Reports" subtitle="Issues you submitted" />
            <Link href="/citizen/my-reports">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {myReports.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">No reports yet.</p>
            ) : (
              myReports.slice(0, 5).map((r) => {
                const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.Open;
                const p = PRIORITY_CONFIG[r.priority] ?? PRIORITY_CONFIG.Low;
                return (
                  <Link
                    key={r.id}
                    href={`/citizen/my-reports/${r.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">{r.title}</p>
                        {r.isUserCreated && (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{r.category} • {r.location}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={s.variant} size="sm" dot>
                        {r.status}
                      </Badge>
                      <Badge variant={p.variant} size="sm">
                        {r.priority}
                      </Badge>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent Notifications */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <CardHeader title="City Notifications" subtitle="Recent broadcasts and updates" />
            <Link href="/citizen/notifications">
              <Button variant="ghost" size="sm">View all →</Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentNotifs.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
