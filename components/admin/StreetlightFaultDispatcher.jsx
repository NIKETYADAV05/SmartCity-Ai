"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function StreetlightFaultDispatcher({ initialZones }) {
  const [zones, setZones] = useState(initialZones);
  const [activeModal, setActiveModal] = useState(null); // { type: 'view' | 'dispatch', zone }
  const [crewName, setCrewName] = useState("BESCOM Flying Squad #12");
  const [toastMessage, setToastMessage] = useState(null);

  function handleDispatchCrew(e) {
    e.preventDefault();
    if (!activeModal?.zone) return;

    const zId = activeModal.zone.id;
    setZones((prev) =>
      prev.map((z) =>
        z.id === zId
          ? {
              ...z,
              dispatched: true,
              dispatchedCrew: crewName,
              dispatchedAt: new Date().toISOString(),
            }
          : z
      )
    );
    setToastMessage({
      type: "success",
      text: `Maintenance crew "${crewName}" successfully dispatched to ${activeModal.zone.zone}!`,
    });
    setActiveModal(null);
  }

  function handleQuickRepair(zId) {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zId
          ? {
              ...z,
              operational: z.total,
              faulty: 0,
              repairedAt: new Date().toISOString(),
              dispatched: false,
            }
          : z
      )
    );
    setToastMessage({
      type: "success",
      text: `All outages resolved in zone ${zId}. 100% illumination restored!`,
    });
  }

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal: View Fault Details or Dispatch */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>💡</span> {activeModal.type === "dispatch" ? "Dispatch Repair Crew" : "Streetlight Sector Fault Diagnosis"}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {activeModal.type === "view" ? (
              <div className="space-y-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1.5">
                  <p><strong>Sector:</strong> {activeModal.zone.zone}</p>
                  <p><strong>Total Luminaires:</strong> {activeModal.zone.total}</p>
                  <p><strong>Active Faults:</strong> <span className="text-red-600 font-bold">{activeModal.zone.faulty}</span></p>
                  <p><strong>LED Energy Conversion:</strong> {activeModal.zone.ledConverted || 85}%</p>
                  <p><strong>Coordinates:</strong> {activeModal.zone.lat}, {activeModal.zone.lng}</p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="font-bold text-amber-800 mb-1">Detected Root Causes:</p>
                  <ul className="list-disc list-inside text-amber-900 space-y-1">
                    <li>Underground feeder cable short-circuit near transformer pole</li>
                    <li>Blown fuse on phase B distribution box</li>
                    <li>Photocell sensor malfunction causing daylight burning</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveModal(null)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    onClick={() => setActiveModal({ type: "dispatch", zone: activeModal.zone })}
                  >
                    🚀 Dispatch Crew →
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDispatchCrew} className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Sector Target</label>
                  <input
                    disabled
                    value={activeModal.zone.zone}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-slate-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Designated Electrical Team</label>
                  <input
                    value={crewName}
                    onChange={(e) => setCrewName(e.target.value)}
                    placeholder="e.g. BESCOM Pole Maintenance Squad"
                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Confirm & Dispatch
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Grid of Interactive Zone Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {zones.map((zone) => {
          const opPct = Math.round((zone.operational / zone.total) * 100);
          return (
            <Card key={zone.id} className="transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">{zone.zone}</p>
                <Badge
                  variant={zone.faulty === 0 ? "success" : zone.faulty > 8 ? "danger" : "warning"}
                  size="sm"
                >
                  {zone.faulty === 0 ? "All Operational" : `${zone.faulty} Outages`}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div>
                  <p className="text-base font-bold text-slate-800">{zone.total}</p>
                  <p className="text-[10px] text-slate-500">Total</p>
                </div>
                <div>
                  <p className="text-base font-bold text-green-600">{zone.operational}</p>
                  <p className="text-[10px] text-slate-500">Active</p>
                </div>
                <div>
                  <p className="text-base font-bold text-red-600">{zone.faulty}</p>
                  <p className="text-[10px] text-slate-500">Fault</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${
                    opPct >= 95 ? "bg-green-500" : opPct >= 85 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${opPct}%` }}
                />
              </div>

              {zone.dispatched && (
                <div className="mb-2 p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[10px] text-blue-700 font-semibold flex items-center justify-between">
                  <span>⚡ Crew Dispatched: {zone.dispatchedCrew}</span>
                </div>
              )}

              <p className="text-[10px] text-slate-400">Last audit: {formatDate(zone.lastAudit, "short")}</p>
              
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setActiveModal({ type: "view", zone })}
                >
                  Inspect Faults
                </Button>
                {zone.faulty > 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold"
                    onClick={() => setActiveModal({ type: "dispatch", zone })}
                  >
                    Dispatch Crew
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs text-emerald-600"
                    disabled
                  >
                    ✓ Optimal
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
