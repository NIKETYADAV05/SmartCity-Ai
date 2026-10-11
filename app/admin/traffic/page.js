export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { DEMO_TRAFFIC } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import Link from "next/link";

export const metadata = { title: "Traffic Management & Junction Telemetry" };

const TRAFFIC_STATUS = {
  Congested: "danger", Heavy: "warning", Moderate: "info", Clear: "success"
};
const SIGNAL_STATUS = {
  Operational: "success", Fault: "danger", "Under Repair": "warning"
};

export default function TrafficPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Traffic Management"
        subtitle="Monitor traffic flow, signal conditions, and junction cameras across the city."
        actions={
          <div className="flex gap-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              🗺️ Full City Map
            </Link>
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Monitored Zones", value: DEMO_TRAFFIC.length, color: "text-slate-800" },
          { label: "Congested",  value: DEMO_TRAFFIC.filter(t=>t.status==="Congested").length,  color: "text-red-600" },
          { label: "Heavy/Moderate", value: DEMO_TRAFFIC.filter(t=>["Heavy","Moderate"].includes(t.status)).length, color: "text-amber-600" },
          { label: "Signal Faults", value: DEMO_TRAFFIC.filter(t=>t.signalStatus==="Fault").length, color: "text-red-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Geoapify Traffic Map */}
      <Card padding="sm">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Traffic Junctions GIS Map</h3>
            <p className="text-[10px] text-slate-400">Real-time junction markers powered by Geoapify</p>
          </div>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            {DEMO_TRAFFIC.length} Junctions Live
          </span>
        </div>
        <InteractiveCityMap
          height="450px"
          showSidebar={false}
          initialLayers={{ reports: false, traffic: true, emergency: true, waste: false, streetlights: false }}
        />
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <CardHeader title="Traffic Zones" subtitle="Real-time status (Demo data only)"/>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50"><tr>
              {["Zone ID","Location","Traffic Status","Signal Status","Cameras","Last Updated"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {DEMO_TRAFFIC.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{t.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 font-medium">{t.location}</td>
                  <td className="px-4 py-3"><Badge variant={TRAFFIC_STATUS[t.status]??"default"} size="sm" dot>{t.status}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={SIGNAL_STATUS[t.signalStatus]??"default"} size="sm">{t.signalStatus}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-600">{t.cameras}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{formatDate(t.lastUpdated, "relative")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-center text-xs text-slate-400">Demo data only.</p>
    </div>
  );
}
