import PublicLayout from "@/components/layout/PublicLayout";
import Link from "next/link";

export const metadata = { title: "About" };

const TEAM = [
  { name: "Rajesh Gupta",    role: "Platform Director",      initials: "RG" },
  { name: "Kavitha Reddy",   role: "Engineering Lead",       initials: "KR" },
  { name: "Anita Joshi",     role: "Citizen Experience",     initials: "AJ" },
  { name: "Suresh Kumar",    role: "Data & AI",              initials: "SK" },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-slate-50 border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold text-slate-900">About SmartCity AI</h1>
          <p className="mt-3 text-base text-slate-500 leading-relaxed">
            SmartCity AI is a college capstone project demonstrating how technology can transform urban governance. Built with modern web technologies, it showcases a full-stack citizen service platform.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                We believe every citizen deserves a responsive, transparent city administration. SmartCity AI makes it simple to report issues, track progress, and hold the city accountable — all in one place.
              </p>
              <ul className="mt-6 space-y-3">
                {["Transparent complaint tracking", "AI-powered issue routing", "Data-driven city management", "Real-time citizen notifications"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
                    <svg className="h-4 w-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: "1,847", label: "Reports Filed",      color: "bg-blue-50 text-blue-600" },
                { val: "78%",   label: "Satisfaction Rate",  color: "bg-green-50 text-green-600" },
                { val: "4.2d",  label: "Avg. Resolution",    color: "bg-amber-50 text-amber-600" },
                { val: "6",     label: "Departments",        color: "bg-violet-50 text-violet-600" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-6 text-center ${s.color}`}>
                  <p className="text-3xl font-extrabold">{s.val}</p>
                  <p className="mt-1 text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Demo Team</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {TEAM.map((m) => (
              <div key={m.name} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white text-lg font-bold mx-auto">{m.initials}</span>
                <p className="mt-3 text-sm font-semibold text-slate-800">{m.name}</p>
                <p className="text-xs text-slate-500">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-t border-amber-100">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-xs text-amber-700">⚠️ This is a demo/college project. All team names, statistics, and data shown are fictional and for demonstration purposes only.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
