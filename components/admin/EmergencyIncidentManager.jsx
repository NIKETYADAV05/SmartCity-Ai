"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const EMR_STATUS = { Active: "danger", Resolved: "success", Dispatched: "warning" };
const EMR_TYPE = { Hazard: "danger", Obstacle: "warning", Structural: "danger", Flood: "info", Fire: "danger", Accident: "danger" };

export default function EmergencyIncidentManager({ initialEmergencies }) {
  const [emergencies, setEmergencies] = useState(initialEmergencies);
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("All City Wards");

  const activeCount = emergencies.filter((e) => e.status !== "Resolved").length;

  function handleDispatch(id) {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "Dispatched",
              dispatchTime: new Date().toISOString(),
              assignedCrew: "Field Rapid Tactical Team #2 Dispatched",
            }
          : e
      )
    );
    setBroadcastMessage({
      type: "info",
      text: `Tactical team officially dispatched to incident ${id}. Telemetry notified.`,
    });
  }

  function handleResolve(id) {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "Resolved", resolvedAt: new Date().toISOString() }
          : e
      )
    );
    setBroadcastMessage({
      type: "success",
      text: `Incident ${id} marked as fully resolved. Alert cleared from grid.`,
    });
  }

  function sendEmergencyBroadcast(e) {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setBroadcastMessage({
      type: "danger",
      text: `🚨 Emergency Alert Broadcast sent to ${broadcastTarget}: "${broadcastText.trim()}"`,
    });
    setBroadcastText("");
    setShowBroadcastModal(false);
  }

  return (
    <div className="space-y-5">
      {/* Broadcast Flash Message */}
      {broadcastMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            broadcastMessage.type === "danger"
              ? "bg-red-50 border-red-300 text-red-900 shadow-xs"
              : broadcastMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <span>{broadcastMessage.text}</span>
          <button
            onClick={() => setBroadcastMessage(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Broadcast Control Trigger */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <span>🚨</span> Citizen Emergency Public Broadcast System
          </h4>
          <p className="text-xs text-slate-300">
            Issue instantaneous SMS/App warning push notifications to citizen portals across active wards
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowBroadcastModal(true)}
          className="font-bold shadow-md cursor-pointer"
        >
          📢 Dispatch Broadcast Alert
        </Button>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                <span>⚠️</span> Dispatch Emergency Citizen Advisory
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={sendEmergencyBroadcast} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Target Geographic Ward / Corridor
                </label>
                <select
                  value={broadcastTarget}
                  onChange={(e) => setBroadcastTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="All City Wards">All City Wards (Citywide Broadcast)</option>
                  <option value="Central Ward / MG Road Corridor">Central Ward / MG Road Corridor</option>
                  <option value="Outer Ring Road Corridor">Outer Ring Road Corridor</option>
                  <option value="Electronic City Sector">Electronic City Sector</option>
                  <option value="Whitefield & Mahadevapura">Whitefield & Mahadevapura</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Alert Advisory Message
                </label>
                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="e.g. Heavy waterlogging reported at Silk Board underpass. Traffic diverted via Madiwala."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm" className="font-bold">
                  🚀 Send Live Notification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Emergency Cards Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {emergencies.map((e) => (
          <Card key={e.id} className="transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant={EMR_STATUS[e.status] ?? "default"} size="sm" dot>
                    {e.status}
                  </Badge>
                  <Badge variant={EMR_TYPE[e.type] ?? "default"} size="sm">
                    {e.type}
                  </Badge>
                  {e.severity && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Severity: {e.severity}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 font-mono">{e.id}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Responsible Agency: <strong className="text-slate-700">{e.assignedTo}</strong>
                </p>
                {e.assignedCrew && (
                  <p className="text-xs text-blue-600 mt-0.5 font-medium">
                    🛡️ {e.assignedCrew}
                  </p>
                )}
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Coordinates: {e.lat}, {e.lng} • {formatDate(e.reportedAt, "long")}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {e.status === "Active" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDispatch(e.id)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-semibold"
                  >
                    🚀 Dispatch Crew
                  </Button>
                )}
                {e.status !== "Resolved" ? (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleResolve(e.id)}
                    className="text-xs font-semibold"
                  >
                    ✓ Mark Resolved
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                    ✓ Cleared
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
