export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { DEMO_WASTE } from "@/lib/demo-data";
import { formatDate } from "@/lib/utils";
import InteractiveCityMap from "@/components/map/InteractiveCityMap";
import Link from "next/link";

export const metadata = { title: "Waste Management & Sanitation Routes" };

const STATUS_V = { "Overdue": "danger", "Due Today": "warning", "On Track": "success" };

function FillBar({ pct }) {
  const color = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium w-8 text-right text-slate-600">{pct}%</span>
    </div>
  );
}

export default function WastePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste Management & Sanitation"
        subtitle="Track collection routes, smart bin fill levels, and sanitation fleet distribution."
        actions={
          <div className="flex gap-2">
            <Link
              href="/map"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              🗺️ Full City Map
            </Link>
            <Button size="sm">+ Dispatch Garbage Vehicle</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Zones",  value: DEMO_WASTE.length,                                          color: "text-slate-800" },
          { label: "Overdue",      value: DEMO_WASTE.filter(w=>w.status==="Overdue").length,           color: "text-red-600" },
          { label: "Due Today",    value: DEMO_WASTE.filter(w=>w.status==="Due Today").length,         color: "text-amber-600" },
          { label: "On Track",     value: DEMO_WASTE.filter(w=>w.status==="On Track").length,          color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Waste Collection Geoapify Map */}
      <Card padding="sm">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Sanitation Zones &amp; Bin Fill Telemetry</h3>
            <p className="text-[10px] text-slate-400">Geo-tagged bin clusters powered by Geoapify</p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
            {DEMO_WASTE.length} Monitored Sectors
          </span>
        </div>
        <InteractiveCityMap
          height="450px"
          showSidebar={false}
          initialLayers={{ reports: false, emergency: false, traffic: false, waste: true, streetlights: false }}
        />
      </Card>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-slate-100">
          <CardHeader title="Collection Zones" subtitle="Fill levels & schedule (Demo data)"/>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50"><tr>
              {["Zone","Fill Level","Status","Last Collected","Vehicles","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {DEMO_WASTE.map(w => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-700">{w.zone}</td>
                  <td className="px-4 py-3 w-40"><FillBar pct={w.fillLevel}/></td>
                  <td className="px-4 py-3"><Badge variant={STATUS_V[w.status]??"default"} size="sm" dot>{w.status}</Badge></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(w.lastCollected, "relative")}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{w.vehicles}</td>
                  <td className="px-4 py-3"><Button variant="outline" size="sm">Schedule Pickup</Button></td>
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
