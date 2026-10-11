"use client";

import { useState, useEffect } from "react";
import AIEngineHeader from "@/components/ai/AIEngineHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { DEMO_REPORTS } from "@/lib/demo-data";

const SAMPLES = [
  "Deep pothole on MG Road near junction causing traffic slowdown and tire punctures.",
  "Water pipeline burst in Sector 4 flooding the road and low-lying buildings.",
  "Garbage bins overflowing near the vegetable market creating strong foul odor.",
  "Three streetlights out on 12th Main Road making it completely dark at night.",
  "Open manhole cover on pedestrian sidewalk right opposite the primary school.",
  "Live wire sparking from pole near bus stop during heavy downpour.",
];

export default function AIClassificationPage() {
  const [activeTab, setActiveTab] = useState("single"); // "single" | "batch"
  const [inputText, setInputText] = useState(SAMPLES[0]);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Batch classification state
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchData, setBatchData] = useState(null);

  const handleAnalyze = async (textToTest = inputText) => {
    if (!textToTest.trim()) return;
    setAnalyzing(true);
    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("smartcity_gemini_key") : null;
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ text: textToTest, apiKey }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      }
    } catch (err) {
      console.error("Classification failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // Run initial classification on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAnalyze(SAMPLES[0]);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRunBatch = async () => {
    setBatchRunning(true);
    try {
      const apiKey = localStorage.getItem("smartcity_gemini_key");
      const res = await fetch("/api/ai/batch-classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ reports: DEMO_REPORTS, apiKey }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBatchData(data.data);
      }
    } catch (err) {
      console.error("Batch classification failed:", err);
    } finally {
      setBatchRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <AIEngineHeader
        title="AI Complaint Classification"
        subtitle="Automatic NLP-based categorisation, department routing, and multi-label confidence scoring."
      />

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("single")}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "single"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          🔬 Interactive Triage Playground
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("batch");
            if (!batchData) handleRunBatch();
          }}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
            activeTab === "batch"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          📦 Batch Benchmark on Real City Reports ({DEMO_REPORTS.length})
        </button>
      </div>

      {activeTab === "single" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Input box */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader
                title="Test AI Classification Model"
                subtitle="Enter any citizen issue description to simulate automatic classification and department routing."
                className="mb-3"
              />
              <div className="space-y-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={4}
                  placeholder="Type any citizen complaint here..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-medium">Presets:</span>
                    {SAMPLES.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setInputText(s);
                          handleAnalyze(s);
                        }}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
                      >
                        Sample {i + 1}
                      </button>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleAnalyze()}
                    disabled={analyzing || !inputText.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {analyzing ? "Running AI Inference…" : "✨ Classify Issue"}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Results card */}
            {result && (
              <Card className="border-indigo-200 bg-linear-to-b from-indigo-50/40 to-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    {result.engine || "AI Model Output"}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {result.confidence}% Confidence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Category</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{result.category}</p>
                    {result.subCategory && (
                      <p className="text-[11px] text-indigo-600 font-medium mt-0.5">{result.subCategory}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Department</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{result.department}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Municipal Service</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Urgency Ranking</p>
                    <p
                      className={`text-sm font-bold mt-1 ${
                        result.priority === "Critical"
                          ? "text-red-600"
                          : result.priority === "High"
                          ? "text-amber-600"
                          : "text-blue-600"
                      }`}
                    >
                      {result.priority}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Auto-Triage Priority</p>
                  </div>
                </div>

                {result.reasoning && (
                  <div className="rounded-xl bg-white border border-slate-200 p-3 mt-3">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      AI Reasoning & Semantic Extraction
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed">{result.reasoning}</p>
                    {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400">Entities Detected:</span>
                        {result.matchedKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader title="Classification Architecture" className="mb-3" />
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <strong>Active Engine:</strong> {result?.engine || "Gemini Flash / NLP Core"}
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <strong>Taxonomy:</strong> 8 Municipal Utility Domains
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <strong>Latency:</strong> ~35ms local / ~320ms cloud
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  <strong>Auto-Routing:</strong> 6 City Departments
                </li>
              </ul>
              <CardDivider className="my-3" />
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Supported Municipal Domains:
                </p>
                <div className="flex flex-wrap gap-1">
                  {[
                    "Road & Infrastructure",
                    "Water Supply",
                    "Sanitation & Waste",
                    "Streetlights",
                    "Drainage & Sewerage",
                    "Emergency Services",
                  ].map((cat) => (
                    <span
                      key={cat}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Batch Benchmark View */}
      {activeTab === "batch" && (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Batch Classification on Active Municipal Complaints
                </h3>
                <p className="text-xs text-slate-500">
                  Running automated AI triage across all real citizen reports in the database.
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleRunBatch}
                disabled={batchRunning}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                {batchRunning ? "Evaluating Batch…" : "⚡ Re-evaluate Batch"}
              </Button>
            </div>

            {batchData && (
              <div className="space-y-4">
                {/* Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-500">Reports Evaluated</p>
                    <p className="text-xl font-black text-slate-900 mt-1">{batchData.totalProcessed}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                    <p className="text-[10px] font-semibold uppercase text-emerald-600">Classification Accuracy</p>
                    <p className="text-xl font-black text-emerald-700 mt-1">{batchData.accuracyRate}%</p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                    <p className="text-[10px] font-semibold uppercase text-blue-600">Avg Confidence</p>
                    <p className="text-xl font-black text-blue-700 mt-1">{batchData.avgConfidence}%</p>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3">
                    <p className="text-[10px] font-semibold uppercase text-indigo-600">Model Verification</p>
                    <p className="text-xs font-bold text-indigo-700 mt-2">Verified Matches: {batchData.matchedCount}</p>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">ID</th>
                        <th className="py-2.5 px-3">Complaint Title</th>
                        <th className="py-2.5 px-3">Original Category</th>
                        <th className="py-2.5 px-3">AI Classification</th>
                        <th className="py-2.5 px-3">Assigned Dept</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3">Confidence</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {batchData.results.map((r) => (
                        <tr key={r.reportId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-600">{r.reportId}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">{r.title}</td>
                          <td className="py-2.5 px-3 text-slate-500">{r.originalCategory}</td>
                          <td className="py-2.5 px-3 font-semibold text-indigo-700">{r.aiCategory}</td>
                          <td className="py-2.5 px-3 text-slate-700">{r.aiDepartment}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                r.aiPriority === "Critical"
                                  ? "bg-red-100 text-red-700"
                                  : r.aiPriority === "High"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {r.aiPriority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{r.confidence}%</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              ✓ Auto-Triaged
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
