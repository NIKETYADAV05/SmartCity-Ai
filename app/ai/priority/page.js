"use client";

import { useState, useEffect } from "react";
import AIEngineHeader from "@/components/ai/AIEngineHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { DEMO_REPORTS } from "@/lib/demo-data";

const SCENARIOS = [
  { text: "Live electric wire sparking and lying on wet road near bus stop", category: "Streetlights & Electricity" },
  { text: "Streetlight not working on quiet residential cul-de-sac", category: "Streetlights & Electricity" },
  { text: "Major water pipe burst flooding the arterial road junction", category: "Water Supply" },
  { text: "Broken pavement slab causing tripping hazard near market", category: "Road & Infrastructure" },
  { text: "Open manhole cover on pedestrian sidewalk right opposite primary school", category: "Drainage & Sewerage" },
];

export default function AIPriorityPage() {
  const [activeTab, setActiveTab] = useState("playground"); // "playground" | "queue"
  const [customText, setCustomText] = useState(SCENARIOS[0].text);
  const [scoring, setScoring] = useState(false);
  const [result, setResult] = useState(null);

  // Live Queue Triage State
  const [queue, setQueue] = useState([]);
  const [filterPriority, setFilterPriority] = useState("All");
  const [triagingQueue, setTriagingQueue] = useState(false);

  const handleScore = async (textToScore = customText, category = "") => {
    if (!textToScore.trim()) return;
    setScoring(true);
    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("smartcity_gemini_key") : null;
      const res = await fetch("/api/ai/priority", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ text: textToScore, category, apiKey }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error("Scoring failed:", err);
    } finally {
      setScoring(false);
    }
  };

  const runQueueTriage = () => {
    setTriagingQueue(true);
    try {
      // Score each report in DEMO_REPORTS
      const triaged = DEMO_REPORTS.map((report) => {
        const lower = `${report.title} ${report.description || ""}`.toLowerCase();
        let urgencyScore = 55;
        let priority = report.priority || "Medium";
        let slaFormatted = "48 Hours";
        let hazard = "Moderate Inconvenience";

        if (lower.includes("spark") || lower.includes("wire") || lower.includes("burst") || lower.includes("stuck") || lower.includes("flood")) {
          urgencyScore = 94;
          priority = "Critical";
          slaFormatted = "2-4 Hours";
          hazard = "Life Threatening";
        } else if (lower.includes("pothole") || lower.includes("garbage") || lower.includes("dumping") || lower.includes("manhole")) {
          urgencyScore = 78;
          priority = "High";
          slaFormatted = "24 Hours";
          hazard = "Public Disruption";
        } else if (lower.includes("flickering") || lower.includes("bench")) {
          urgencyScore = 32;
          priority = "Low";
          slaFormatted = "7 Days";
          hazard = "Low Impact";
        }

        return {
          ...report,
          urgencyScore,
          aiPriority: priority,
          slaFormatted,
          hazard,
        };
      });

      // Sort descending by urgency score
      triaged.sort((a, b) => b.urgencyScore - a.urgencyScore);
      setQueue(triaged);
    } finally {
      setTriagingQueue(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScore(SCENARIOS[0].text, SCENARIOS[0].category);
      runQueueTriage();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredQueue = queue.filter((item) => {
    if (filterPriority === "All") return true;
    return item.aiPriority.toLowerCase() === filterPriority.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <AIEngineHeader
        title="AI Priority &amp; Urgency Detection"
        subtitle="Automated severity scoring, public safety risk assessment, and dynamic SLA assignment."
      />

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("playground")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "playground"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          ⚡ Priority Scorer &amp; Risk Vectors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "queue"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🚨 Live Emergency Triage Queue ({queue.length} Reports)
        </button>
      </div>

      {activeTab === "playground" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader
                title="Priority Risk Scorer"
                subtitle="Evaluate safety hazards, critical infrastructure disruption, and calculate resolution SLA."
                className="mb-3"
              />
              <div className="space-y-3">
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                  placeholder="Describe an incident scenario..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-medium">Presets:</span>
                    {SCENARIOS.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCustomText(s.text);
                          handleScore(s.text, s.category);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        Preset {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleScore()}
                    disabled={scoring || !customText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {scoring ? "Computing Risk…" : "⚡ Calculate Urgency"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Results card */}
            {result && (
              <Card className="border-indigo-200 bg-linear-to-b from-indigo-50/30 to-white">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    {result.engine || "AI Severity Assessment"}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      result.priority === "Critical"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : result.priority === "High"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }`}
                  >
                    Priority: {result.priority}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Urgency Index</p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{result.urgencyScore}/100</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Resolution SLA</p>
                    <p className="text-base font-bold text-indigo-700 mt-1">{result.slaFormatted}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Hazard Assessment</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{result.hazardLevel}</p>
                  </div>
                </div>

                {/* Risk Vectors */}
                {result.riskFactors && (
                  <div className="rounded-xl bg-white border border-slate-200 p-4 mt-3 space-y-3">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Multi-Vector Safety Breakdown
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                          <span>Life Safety Risk</span>
                          <span className="font-bold">{result.riskFactors.lifeSafety}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{ width: `${result.riskFactors.lifeSafety}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                          <span>Traffic & Mobility Disruption</span>
                          <span className="font-bold">{result.riskFactors.trafficImpact}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${result.riskFactors.trafficImpact}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                          <span>Public Health Hazard</span>
                          <span className="font-bold">{result.riskFactors.healthHazard}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${result.riskFactors.healthHazard}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-medium text-slate-700 mb-1">
                          <span>Infrastructure Damage</span>
                          <span className="font-bold">{result.riskFactors.infrastructureDamage}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${result.riskFactors.infrastructureDamage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.suggestedActions && (
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Recommended Dispatch Protocols
                    </p>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {result.suggestedActions.map((action, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="SLA Benchmark Targets" className="mb-3" />
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-lg bg-red-50 p-2 text-red-800">
                  <span className="font-bold">Critical (Score &gt; 85)</span>
                  <span className="font-mono font-bold">2 - 4 Hours</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-amber-50 p-2 text-amber-800">
                  <span className="font-bold">High (Score 70 - 85)</span>
                  <span className="font-mono font-bold">24 Hours</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-blue-50 p-2 text-blue-800">
                  <span className="font-bold">Medium (Score 40 - 70)</span>
                  <span className="font-mono font-bold">48 Hours</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-slate-700">
                  <span className="font-bold">Low (Score &lt; 40)</span>
                  <span className="font-mono font-bold">7 Days</span>
                </div>
              </div>
              <CardDivider className="my-3" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Dynamic prioritization ensures high-risk municipal hazards are resolved before routine aesthetic complaints.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Live Emergency Triage Queue */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live AI Emergency Triage Queue</h3>
                <p className="text-xs text-slate-500">
                  All active citizen reports dynamically ordered by AI Urgency Score and SLA target.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["All", "Critical", "High", "Medium", "Low"].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setFilterPriority(tier)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      filterPriority === tier
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Triage Rank</th>
                    <th className="py-2.5 px-3">Report</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Urgency Score</th>
                    <th className="py-2.5 px-3">Priority Tier</th>
                    <th className="py-2.5 px-3">Target SLA</th>
                    <th className="py-2.5 px-3">Hazard Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQueue.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">#{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.id}</p>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{item.location}</td>
                      <td className="py-2.5 px-3 text-slate-700">{item.department}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{item.urgencyScore}</span>
                          <div className="h-1.5 w-12 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.urgencyScore >= 85
                                  ? "bg-red-500"
                                  : item.urgencyScore >= 70
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                              style={{ width: `${item.urgencyScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.aiPriority === "Critical"
                              ? "bg-red-100 text-red-700"
                              : item.aiPriority === "High"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.aiPriority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.slaFormatted}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.hazard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
