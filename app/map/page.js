import PublicLayout from "@/components/layout/PublicLayout";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import Link from "next/link";
import { DEMO_REPORTS } from "@/lib/demo-data";

export const metadata = { title: "City Map — Live Issue Tracking" };

export default function PublicMapPage() {
  const openCount = DEMO_REPORTS.filter((r) => r.status === "Open").length;
  const inProgressCount = DEMO_REPORTS.filter((r) => r.status === "In Progress").length;
  const resolvedCount = DEMO_REPORTS.filter((r) => r.status === "Resolved").length;

  return (
    <PublicLayout>
      {/* Header section */}
      <section className="bg-slate-50 border-b border-slate-200 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Geoapify Map
                </span>
                <span className="text-xs text-slate-400">• Real-time GIS data</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mt-2">Interactive City Map</h1>
              <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                Explore geo-tagged citizen reports, public works, streetlights, and city emergency alerts across all wards. Click any pin for details, or click on the map to report an issue.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/citizen/report"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span>➕</span> Report City Issue
              </Link>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <p className="text-[11px] font-medium text-slate-400">Total Plotted</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{DEMO_REPORTS.length}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 shadow-xs">
              <p className="text-[11px] font-medium text-amber-700">Open Issues</p>
              <p className="text-xl font-bold text-amber-900 mt-0.5">{openCount}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 shadow-xs">
              <p className="text-[11px] font-medium text-blue-700">In Progress</p>
              <p className="text-xl font-bold text-blue-900 mt-0.5">{inProgressCount}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-xs">
              <p className="text-[11px] font-medium text-emerald-700">Resolved</p>
              <p className="text-xl font-bold text-emerald-900 mt-0.5">{resolvedCount}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Map View */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <InteractiveCityMap userRole="public" height="680px" />
        </div>
      </section>
    </PublicLayout>
  );
}
