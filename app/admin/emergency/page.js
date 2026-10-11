export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DEMO_EMERGENCY } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import EmergencyIncidentManager from "@/components/admin/EmergencyIncidentManager";
import Link from "next/link";

export const metadata = { title: "Emergency Reports & Rapid Incident Response" };

const EMR_STATUS  = { Active: "danger", Resolved: "success" };
const EMR_TYPE    = { Hazard: "danger", Obstacle: "warning", Structural: "danger", Flood: "info" };

export default function EmergencyPage() {
  const active   = DEMO_EMERGENCY.filter(e => e.status === "Active");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Operations Command"
        subtitle="High-priority incidents and disaster response management across city sectors."
        actions={
          <div className="flex gap-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              🗺️ Full City Map
            </Link>
            <Button variant="danger" size="sm">🚨 Declare Emergency Broadcast</Button>
          </div>
        }
      />

      {active.length > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-red-700">⚠️ {active.length} Active Emergency{active.length > 1 ? " Incidents" : ""}</p>
            <span className="text-[11px] font-semibold text-red-600 bg-white px-2 py-0.5 rounded border border-red-200">
              High Priority Priority Response
            </span>
          </div>
          <div className="divide-y divide-red-200/60">
            {active.map(e => (
              <div key={e.id} className="flex items-center justify-between text-xs text-red-800 py-2">
                <div>
                  <span className="font-bold">{e.title}</span>
                  <span className="text-red-500 ml-2">({e.assignedTo})</span>
                </div>
                <span className="text-red-600 font-mono text-[11px]">{formatDate(e.reportedAt, "relative")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Incidents Geoapify Map */}
      <Card padding="sm">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">Incident Spatial Dispatch Map</h3>
            <p className="text-[10px] text-slate-400">Live Geoapify coordinates with pulsing emergency beacons</p>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            {active.length} Active Alerts
          </span>
        </div>
        <InteractiveCityMap
          height="450px"
          showSidebar={false}
          initialLayers={{ reports: true, emergency: true, traffic: true, waste: false, streetlights: false }}
        />
      </Card>

      {/* Incident Cards with Live Dispatch & Response */}
      <EmergencyIncidentManager initialEmergencies={DEMO_EMERGENCY} />

      <Card>
        <CardHeader title="Emergency Control Numbers" className="mb-3"/>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs text-center">
          {[
            { dept: "Fire Brigade",   phone: "101" },
            { dept: "Police Control", phone: "100" },
            { dept: "Ambulance",      phone: "108" },
            { dept: "City Helpline",  phone: "1916" },
          ].map(c => (
            <div key={c.dept} className="rounded-xl border border-red-100 bg-red-50/70 py-3.5 px-3">
              <p className="text-xl font-black text-red-600 font-mono">{c.phone}</p>
              <p className="text-slate-700 font-medium mt-1">{c.dept}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-center text-xs text-slate-400">Demo data only.</p>
    </div>
  );
}
