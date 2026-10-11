"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { DEMO_REPORTS, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export default function MyReportsPage() {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        // Fetch server reports
        const res = await fetch("/api/reports");
        const data = await res.json();
        const serverList = data.success && Array.isArray(data.reports) ? data.reports : DEMO_REPORTS;

        // Merge with client localStorage custom reports
        let customList = [];
        try {
          customList = JSON.parse(localStorage.getItem("smartcity_custom_reports") || "[]");
        } catch {}

        // Combine and deduplicate by ID
        const map = new Map();
        customList.forEach((r) => map.set(r.id, { ...r, isUserCreated: true }));
        serverList.forEach((r) => {
          if (!map.has(r.id)) map.set(r.id, r);
        });

        setReports(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const statusCounts = {
    Total: reports.length,
    Open: reports.filter((r) => r.status === "Open").length,
    "In Progress": reports.filter((r) => r.status === "In Progress").length,
    Resolved: reports.filter((r) => r.status === "Resolved").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        subtitle="All issues submitted to the city, tracked in real-time."
        actions={
          <Link href="/citizen/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
              + New Report
            </Button>
          </Link>
        }
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(statusCounts).map(([label, val]) => {
          const cls =
            label === "Open"
              ? "text-amber-600"
              : label === "In Progress"
              ? "text-cyan-600"
              : label === "Resolved"
              ? "text-green-600"
              : "text-slate-700";
          return (
            <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
              <p className="text-xs text-slate-500">{label}</p>
              <p className={`text-2xl font-bold ${cls}`}>{val}</p>
            </div>
          );
        })}
      </div>

      {/* Reports table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["ID", "Issue", "Category", "Status", "Priority", "Date", "Action"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {reports.map((r) => {
                const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.Open;
                const p = PRIORITY_CONFIG[r.priority] ?? PRIORITY_CONFIG.Low;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">
                      {r.id}
                      {r.isUserCreated && (
                        <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                          Yours
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 truncate">{r.title}</p>
                      <p className="text-[11px] text-slate-500">{r.location}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{r.category}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.variant} size="sm" dot>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.variant} size="sm">
                        {r.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(r.reportedAt, "short")}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/citizen/my-reports/${r.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
