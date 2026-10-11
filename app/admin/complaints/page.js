"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { DEMO_REPORTS, STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";

export default function ComplaintsPage() {
  const [reports, setReports] = useState(DEMO_REPORTS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
        customList.forEach((r) => map.set(r.id, { ...r, isNew: true }));
        serverList.forEach((r) => {
          if (!map.has(r.id)) map.set(r.id, r);
        });

        setReports(Array.from(map.values()));
      } catch (err) {
        console.error("Failed to load complaints:", err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  const filteredReports = reports.filter((r) => {
    // Status filter
    if (activeFilter === "Critical" && r.priority !== "Critical") return false;
    if (activeFilter !== "All" && activeFilter !== "Critical" && r.status !== activeFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title?.toLowerCase().includes(q) ||
        r.id?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q) ||
        r.location?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Complaints Management"
        subtitle="Review, triage, assign, and resolve citizen municipal reports."
        actions={
          <div className="flex gap-2">
            <Link href="/citizen/report">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs">
                + File New Complaint
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter and Search bar */}
      <Card padding="sm">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs font-semibold text-slate-500 mr-1">Filter:</span>
            {["All", "Open", "In Progress", "Resolved", "Critical"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeFilter === f
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs font-semibold"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-64">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, title, ward…"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Complaints Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["ID", "Issue", "Category", "Status", "Priority", "Department", "Reported By", "Date", "Action"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredReports.map((r) => {
                const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.Open;
                const p = PRIORITY_CONFIG[r.priority] ?? PRIORITY_CONFIG.Low;
                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">
                      {r.id}
                      {r.isNew && (
                        <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <p className="font-semibold text-slate-900 truncate text-xs">{r.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{r.location}</p>
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
                    <td className="px-4 py-3 text-xs font-medium text-slate-700">{r.department}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.reportedBy}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{formatDate(r.reportedAt, "short")}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/complaints/${r.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {filteredReports.length} of {reports.length} total registered issues</span>
        </div>
      </Card>
    </div>
  );
}
