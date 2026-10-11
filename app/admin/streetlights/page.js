export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DEMO_STREETLIGHTS } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import StreetlightFaultDispatcher from "@/components/admin/StreetlightFaultDispatcher";
import Link from "next/link";

export const metadata = { title: "Streetlights — Outage & Grid Monitoring" };

export default function StreetlightsPage() {
  const totalLights    = DEMO_STREETLIGHTS.reduce((s, z) => s + z.total, 0);
  const totalFaulty    = DEMO_STREETLIGHTS.reduce((s, z) => s + z.faulty, 0);
  const totalOperational = totalLights - totalFaulty;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Smart Streetlight Grid"
        subtitle="Monitor operational status, electrical outages, and maintenance audits across all city zones."
        actions={
          <div className="flex gap-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              🗺️ Full City Map
            </Link>
            <Button size="sm">Schedule City Audit</Button>
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Lights",  value: totalLights,      color: "text-slate-800" },
          { label: "Operational",   value: totalOperational,  color: "text-green-600" },
          { label: "Faulty Outages",value: totalFaulty,       color: "text-red-600" },
          { label: "Fault Rate",    value: `${Math.round((totalFaulty/totalLights)*100)}%`, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Streetlight Grid Geoapify Map */}
      <Card padding="sm">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Streetlight Grid Telemetry</h3>
            <p className="text-[10px] text-slate-400">Geo-tagged lighting sectors and outage locations</p>
          </div>
          <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
            {DEMO_STREETLIGHTS.length} Lighting Grids
          </span>
        </div>
        <InteractiveCityMap
          height="450px"
          showSidebar={false}
          initialLayers={{ reports: false, emergency: false, traffic: false, waste: false, streetlights: true }}
        />
      </Card>

      {/* Interactive Zone Fault Inspection & Dispatcher */}
      <StreetlightFaultDispatcher initialZones={DEMO_STREETLIGHTS} />
      <p className="text-center text-xs text-slate-400">Demo data only.</p>
    </div>
  );
}
