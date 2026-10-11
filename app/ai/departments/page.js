"use client";

import { useState, useEffect } from "react";
import AIEngineHeader from "@/components/ai/AIEngineHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const ROUTING_SAMPLES = [
  "Water pipeline leak washed away road foundation causing deep sinkhole.",
  "Fallen banyan tree branch tore down high-tension power cable and blocked lane.",
  "Overflowing sewage puddle creating foul stench and contaminating pedestrian street.",
  "Unauthorized construction debris dumped near stormwater lake inlet.",
];

export default function AIDepartmentsPage() {
  const [workloads, setWorkloads] = useState([]);
  const [loadingWorkloads, setLoadingWorkloads] = useState(true);

  // Routing tester state
  const [testText, setTestText] = useState(ROUTING_SAMPLES[0]);
  const [routingResult, setRoutingResult] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  const fetchWorkloads = async () => {
    try {
      const res = await fetch("/api/ai/departments");
      const data = await res.json();
      if (data.success && data.workloads) {
        setWorkloads(data.workloads);
      }
    } catch (err) {
      console.error("Failed to fetch workloads:", err);
    } finally {
      setLoadingWorkloads(false);
    }
  };

  const handleRouteTest = async (textToTest = testText) => {
    if (!textToTest.trim()) return;
    setRoutingLoading(true);
    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("smartcity_gemini_key") : null;
      const res = await fetch("/api/ai/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ text: textToTest, apiKey }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRoutingResult(data.data);
        if (data.data.workloads) {
          setWorkloads(data.data.workloads);
        }
      }
    } catch (err) {
      console.error("Routing failed:", err);
    } finally {
      setRoutingLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkloads();
      handleRouteTest(ROUTING_SAMPLES[0]);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <AIEngineHeader
        title="Department Recommendation &amp; Workload Balancing"
        subtitle="AI-driven multi-agency routing, jurisdictional conflict resolution, and real-time municipal load balancing."
      />

      {/* Live Department Capacity Balancer */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Municipal Department Capacity Index</h2>
            <p className="text-xs text-slate-500">Live operational load and queue depth across all 6 city agencies.</p>
          </div>
          <button
            type="button"
            onClick={fetchWorkloads}
            disabled={loadingWorkloads}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            ↻ Refresh Workloads
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workloads.map((dept) => (
            <Card key={dept.id} className="relative overflow-hidden">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
                  <p className="text-[11px] text-slate-500">Head: {dept.head}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    dept.statusColor === "red"
                      ? "bg-red-100 text-red-700"
                      : dept.statusColor === "amber"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {dept.status}
                </span>
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1 my-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Workload Capacity</span>
                  <span className="font-bold text-slate-900">{dept.loadPercentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dept.loadPercentage >= 90
                        ? "bg-red-500"
                        : dept.loadPercentage >= 70
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${dept.loadPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Active Issues</span>
                  <span className="font-bold text-slate-900">{dept.activeIssues}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Avg Turnaround</span>
                  <span className="font-bold text-slate-900">{dept.avgResponse}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Smart Routing & Conflict Simulator */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title="Test Cross-Agency Routing &amp; Conflict Resolution"
              subtitle="Simulate multi-department complaints to test AI dispatch recommendations and lead agency election."
              className="mb-3"
            />

            <div className="space-y-3">
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                rows={3}
                placeholder="Enter a complaint involving multiple departments..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-medium">Presets:</span>
                  {ROUTING_SAMPLES.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTestText(s);
                        handleRouteTest(s);
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      Case {i + 1}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleRouteTest()}
                  disabled={routingLoading || !testText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {routingLoading ? "Evaluating Routing…" : "🏢 Recommend Agency"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Routing Decision Output */}
          {routingResult && (
            <Card className="border-indigo-200 bg-linear-to-b from-indigo-50/30 to-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  {routingResult.engine || "AI Dispatch Recommendation"}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {routingResult.confidence}% Affinity
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
                <div className="rounded-xl border border-indigo-200 bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">
                    Elected Lead Agency (Primary)
                  </p>
                  <p className="text-base font-black text-slate-900 mt-1">{routingResult.primaryDepartment}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Responsible for initial response and onsite command</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    Supporting Agencies (Secondary)
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {routingResult.secondaryDepartments && routingResult.secondaryDepartments.length > 0 ? (
                      routingResult.secondaryDepartments.map((sec, i) => (
                        <span key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {sec}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">None required (Single agency jurisdiction)</span>
                    )}
                  </div>
                </div>
              </div>

              {routingResult.jurisdictionConflict && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 my-3 text-xs text-amber-900">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <span>⚠️</span> Cross-Jurisdiction Dependency Detected
                  </p>
                  <p className="mt-1 leading-relaxed">{routingResult.conflictReason || "Multiple departments share operational accountability."}</p>
                </div>
              )}

              <div className="rounded-xl bg-white border border-slate-200 p-3 mt-2 text-xs space-y-1.5">
                <p className="font-semibold text-slate-800">Routing Rationale:</p>
                <p className="text-slate-600 leading-relaxed">{routingResult.routingRationale}</p>
                {routingResult.dispatchRecommendation && (
                  <p className="text-indigo-700 font-medium pt-1">
                    ↳ Protocol: {routingResult.dispatchRecommendation}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Routing Policies &amp; SLA" className="mb-3" />
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1" />
                <span>
                  <strong>Public Works:</strong> Road cavities, bridge repairs, signal controllers.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1" />
                <span>
                  <strong>Water Works:</strong> Underground mains, sewage lines, manholes, drainage.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1" />
                <span>
                  <strong>Sanitation:</strong> Solid waste bins, bio-hazard, illegal rubble dumps.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1" />
                <span>
                  <strong>Electricity Board:</strong> Live wires, transformer burnouts, streetlights.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1" />
                <span>
                  <strong>Emergency Services:</strong> Gas leaks, fires, structural collapses.
                </span>
              </li>
            </ul>
            <CardDivider className="my-3" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              When departments exceed 85% capacity, the AI Router dynamically suggests load-shedding to contractor fleets or secondary depots.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
