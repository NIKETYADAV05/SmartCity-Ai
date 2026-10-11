import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";

export const metadata = { title: "Services" };

const SERVICES = [
  {
    icon: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    title: "Issue Reporting",
    color: "bg-blue-50 text-blue-600",
    desc: "Citizens can report road, water, waste, electrical, and other city issues with location and photo attachments.",
    features: ["Multi-category reporting", "Photo & GPS attachment", "Reference number issued", "Email/SMS confirmation"],
  },
  {
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586l5.414 5.414V19a2 2 0 01-2 2z",
    title: "Admin Control Centre",
    color: "bg-violet-50 text-violet-600",
    desc: "Department heads manage complaints, assign staff, set priorities, and track resolution metrics.",
    features: ["Complaints dashboard", "Department routing", "SLA tracking", "Bulk status updates"],
  },
  {
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4",
    title: "Interactive City Map",
    color: "bg-emerald-50 text-emerald-600",
    desc: "Visual map overlay showing all active issues, emergency alerts, and department zones.",
    features: ["Heat-map by category", "Cluster view", "Filter by status/date", "Click-to-report"],
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "AI Engine (Coming Soon)",
    color: "bg-amber-50 text-amber-600",
    desc: "Machine learning pipeline automatically classifies, prioritises, and routes complaints to the right department.",
    features: ["NLP classification", "Priority scoring", "Smart routing", "City health reports"],
    comingSoon: true,
  },
  {
    icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
    title: "Notification System",
    color: "bg-cyan-50 text-cyan-600",
    desc: "Real-time alerts keep citizens and administrators informed at every stage of a complaint's lifecycle.",
    features: ["Status change alerts", "Emergency broadcasts", "Unread badge counts", "Notification centre"],
  },
  {
    icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    title: "Analytics & Reporting",
    color: "bg-rose-50 text-rose-600",
    desc: "Data-driven insights show trends, department performance, citizen satisfaction, and issue hotspots.",
    features: ["Monthly trend charts", "Category breakdown", "Resolution rate tracking", "Exportable reports"],
  },
];

function SvgIcon({ d, className = "h-6 w-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function ServicesPage() {
  return (
    <PublicLayout>
      <section className="bg-slate-50 border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-bold text-slate-900">Platform Services</h1>
          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            SmartCity AI provides end-to-end tools for citizens and city administrators to manage urban issues intelligently.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <div key={s.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
                    <SvgIcon d={s.icon} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{s.title}</h3>
                    {s.comingSoon && <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">Coming Soon</span>}
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{s.desc}</p>
                <ul className="mt-auto space-y-1.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Get Started →
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
