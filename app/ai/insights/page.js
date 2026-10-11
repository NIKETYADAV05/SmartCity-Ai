"use client";

import { useState, useEffect } from "react";
import AIEngineHeader from "@/components/ai/AIEngineHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function AIInsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchInsights = async () => {
    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("smartcity_gemini_key") : null;
      const res = await fetch("/api/ai/insights", {
        headers: apiKey ? { "x-gemini-api-key": apiKey } : {},
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInsights();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const apiKey = localStorage.getItem("smartcity_gemini_key");
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ apiKey }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Regenerate failed:", err);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <AIEngineHeader
        title="City Health &amp; Strategic AI Insights"
        subtitle="Automated real-time telemetry analysis, municipal anomaly detection, and predictive maintenance alerts."
      />

      {loading ? (
        <Card className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-3" />
          <p className="text-sm font-semibold text-slate-700">Synthesizing Urban Telemetry…</p>
          <p className="text-xs text-slate-400">Aggregating sensor streams, complaints, and utility grids.</p>
        </Card>
      ) : data ? (
        <div className="space-y-6">
          {/* Top KPI Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-indigo-200 bg-linear-to-br from-indigo-50 to-white lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Composite City Index</p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900">{data.telemetry?.healthIndex}</span>
                <span className="text-xs text-slate-500 font-bold">/ 100</span>
              </div>
              <span className="inline-block mt-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Grade: Stable
              </span>
            </Card>

            <Card className="lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streetlight Grid Uptime</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{data.telemetry?.metrics?.lightUptime}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Smart sensors operational</p>
            </Card>

            <Card className="lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Solid Waste Health</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{data.telemetry?.metrics?.wasteHealth}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Commercial bin clearance</p>
            </Card>

            <Card className="lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Traffic Fluidity</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{data.telemetry?.metrics?.trafficHealth}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Corridor flow rating</p>
            </Card>

            <Card className="lg:col-span-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Readiness</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{data.telemetry?.metrics?.emergencyScore}%</p>
              <p className="text-[11px] text-slate-500 mt-1">Rapid crew availability</p>
            </Card>
          </div>

          {/* AI Executive Intelligence Briefing */}
          <Card className="border-indigo-300 bg-linear-to-b from-indigo-50/20 to-white shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-xs">
                  ⚡
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    AI Executive Operational Briefing
                  </h2>
                  <p className="text-xs text-slate-500">
                    Generated via {data.engine} • {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleRegenerate}
                disabled={regenerating}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
              >
                {regenerating ? "Synthesizing AI…" : "✨ Regenerate Strategic Briefing"}
              </Button>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-4 text-xs text-slate-700 leading-relaxed space-y-3">
              <div>
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-1">
                  Executive Summary
                </p>
                <p className="text-slate-700">{data.briefing?.executiveSummary}</p>
              </div>

              {data.briefing?.topRisks && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                    Priority Strategic Interventions
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {data.briefing.topRisks.map((risk, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-3 border ${
                          risk.severity === "Critical"
                            ? "bg-red-50/60 border-red-200"
                            : risk.severity === "High"
                            ? "bg-amber-50/60 border-amber-200"
                            : "bg-blue-50/60 border-blue-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-slate-900 text-[11px]">{risk.title}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                              risk.severity === "Critical"
                                ? "bg-red-200 text-red-800"
                                : "bg-amber-200 text-amber-800"
                            }`}
                          >
                            {risk.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-normal">{risk.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.briefing?.predictiveMaintenance && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
                    Predictive Infrastructure Maintenance Alerts
                  </p>
                  <div className="space-y-2">
                    {data.briefing.predictiveMaintenance.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{item.asset}</p>
                          <p className="text-[11px] text-slate-600">{item.prediction}</p>
                        </div>
                        <span className="shrink-0 rounded-lg bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {item.urgency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.briefing?.resourceRebalancing && (
                <div className="rounded-xl bg-indigo-50/60 border border-indigo-200 p-3 mt-2 text-indigo-950">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-indigo-800 mb-0.5">
                    Recommended Resource Rebalancing:
                  </p>
                  <p className="text-[11px]">{data.briefing.resourceRebalancing}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Anomaly Detection and Ward Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real Anomalies */}
            <Card>
              <CardHeader
                title="Live Municipal Telemetry Anomalies"
                subtitle="Identified through real-time multi-sensor threshold deviation algorithms."
                className="mb-3"
              />
              <div className="space-y-3">
                {data.telemetry?.anomalies?.map((anom) => (
                  <div
                    key={anom.id}
                    className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {anom.domain}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          anom.severity === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {anom.severity}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs">{anom.title}</p>
                    <p className="text-xs text-slate-600">{anom.detail}</p>
                    <p className="text-[11px] text-red-600 font-medium">↳ Impact: {anom.impact}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Ward-by-Ward Health Index */}
            <Card>
              <CardHeader
                title="Ward Performance &amp; Infrastructure Matrix"
                subtitle="Zone-by-zone health scores and localized civic bottleneck analysis."
                className="mb-3"
              />
              <div className="space-y-3">
                {data.telemetry?.wards?.map((ward, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 text-xs">{ward.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {ward.healthScore}/100
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.2 text-[9px] font-bold ${
                            ward.risk === "Low"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ward.risk} Risk
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ward.healthScore >= 80 ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${ward.healthScore}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Open Tickets: <strong>{ward.openIssues}</strong></span>
                      <span className="truncate max-w-[200px]">Bottleneck: {ward.bottleneck}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
