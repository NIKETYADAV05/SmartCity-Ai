import Navbar from "./Navbar";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="text-base font-bold text-slate-900">SmartCity <span className="text-blue-600">AI</span></span>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-xs">
              Intelligent Urban Management &amp; Citizen Service Platform. Built for modern cities.
            </p>
          </div>
          {[
            { heading: "Platform", links: [{ l: "Home", h: "/" }, { l: "About", h: "/about" }, { l: "Services", h: "/services" }, { l: "City Map", h: "/map" }] },
            { heading: "Citizens", links: [{ l: "Report Issue", h: "/citizen/report" }, { l: "My Reports", h: "/citizen/my-reports" }, { l: "Notifications", h: "/citizen/notifications" }] },
            { heading: "Account", links: [{ l: "Sign In", h: "/login" }, { l: "Register", h: "/register" }] },
          ].map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{col.heading}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((lk) => (
                  <li key={lk.h}><Link href={lk.h} className="text-sm text-slate-600 hover:text-blue-600 transition-colors">{lk.l}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SmartCity AI — Demo project. All data shown is fictional.
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
