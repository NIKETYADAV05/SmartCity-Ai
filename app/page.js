import PublicLayout from "@/components/layout/PublicLayout";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import Link from "next/link";
import { DEMO_REPORTS } from "@/lib/demo-data";

export const metadata = { title: "SmartCity AI — Intelligent Urban Management & Citizen Service Platform" };

const FEATURES = [
  { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", title: "Report Issues", desc: "Citizens submit road, water, waste, and infrastructure problems with GPS precision in seconds." },
  { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: "Track Resolution", desc: "Real-time status updates keep citizens informed with live timeline tracking at every stage." },
  { icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z", title: "Admin Dashboard", desc: "City officials manage, assign, and resolve complaints efficiently with unified control tools." },
  { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "AI Engine", desc: "Auto-classify, prioritise urgency, and route incoming issues to the right municipal department." },
  { icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4", title: "Interactive Geoapify Map", desc: "Visualise city issues geographically with multi-layer overlays, place search, and GPS tracking." },
  { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", title: "Smart Alerts", desc: "Automated notifications for status changes, emergency broadcasts, and critical SLA breaches." },
];

const STATS = [
  { value: "1,847", label: "Issues Reported" },
  { value: "584",   label: "Resolved This Month" },
  { value: "78%",   label: "Citizen Satisfaction" },
  { value: "4.2d",  label: "Avg. Resolution Time" },
];

function SvgIcon({ d }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function PublicHomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Geoapify Maps API Integrated
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            Intelligent Urban<br />
            <span className="text-blue-400">Management Platform</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base text-slate-300 leading-relaxed">
            SmartCity AI bridges citizens and municipal administration. Report issues with GPS precision, explore interactive city maps, and track repairs in real time.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/map" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/40">
              <span>🗺️</span> Explore City Map
            </Link>
            <Link href="/citizen/report" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/40">
              <span>➕</span> Report an Issue
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
              Sign In →
            </Link>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
                <p className="mt-1 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Everything your city needs</h2>
            <p className="mt-2 text-sm text-slate-500">A unified digital platform for citizens, city administrators, and modern GIS services.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 mb-4">
                  <SvgIcon d={f.icon} />
                </span>
                <h3 className="text-sm font-semibold text-slate-800">{f.title}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Map Preview Teaser */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  GIS Geographic Information System
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mt-2">Live City Map Pulse</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Explore real-time geo-located issues, active municipal repair crews, streetlights, and traffic hotspots powered by Geoapify vector/raster tiles.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/map"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                Open Fullscreen Map ↗
              </Link>
            </div>
          </div>

          <InteractiveCityMap initialReports={DEMO_REPORTS} userRole="public" height="520px" />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-16 text-center text-white">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="text-2xl font-bold">Ready to make your city smarter?</h2>
          <p className="mt-2 text-sm text-blue-100">Join our community and report municipal issues directly from your phone or desktop.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
              Create Account
            </Link>
            <Link href="/about" className="inline-flex items-center justify-center rounded-lg border border-blue-400 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
