"use client";

import { useState, useTransition } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { STATUS_CONFIG, PRIORITY_CONFIG, DEMO_DEPARTMENTS } from "@/lib/demo-data";
import { useRouter } from "next/navigation";
import PhotoUploadEditor from "@/components/ui/PhotoUploadEditor";

export default function AdminComplaintInspector({ report }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStatus, setCurrentStatus] = useState(report.status || "Open");
  const [currentPriority, setCurrentPriority] = useState(report.priority || "Medium");
  const [currentDept, setCurrentDept] = useState(report.department || "Public Works");
  const [photoUrl, setPhotoUrl] = useState(report.imageUrl || report.image_url || "");

  // Fault diagnosis & inspection state
  const [faultCause, setFaultCause] = useState(report.faultCause || "Wear & Tear / Environmental");
  const [assignedCrew, setAssignedCrew] = useState(report.assignedCrew || "Zone Rapid Response Team #4");
  const [inspectionNote, setInspectionNote] = useState("");
  const [faultHistory, setFaultHistory] = useState(report.faultHistory || [
    {
      action: "Initial intake & geotag verification",
      note: "Incident logged via citizen report telemetry.",
      officer: "System Dispatcher",
      timestamp: report.reportedAt,
    },
  ]);

  const [saveMessage, setSaveMessage] = useState(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Status progression action
  async function handleQuickStatus(newStatus) {
    setCurrentStatus(newStatus);
    await submitUpdates({
      status: newStatus,
      actionNote: `Status adjusted to ${newStatus}`,
    });
  }

  // Trigger AI Inspection Analysis
  async function runAIFaultInspection() {
    setIsAnalyzingAI(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/ai/priority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${report.title}. ${report.description || ""}`,
          category: report.category,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiAnalysis(data.data);
        if (data.data.priority) {
          setCurrentPriority(data.data.priority);
        }
      }
    } catch (err) {
      console.error("AI fault inspection error:", err);
    } finally {
      setIsAnalyzingAI(false);
    }
  }

  // Submit complete inspection update
  async function submitUpdates(override = {}) {
    setSaveMessage(null);
    const payload = {
      status: override.status || currentStatus,
      priority: override.priority || currentPriority,
      department: override.department || currentDept,
      imageUrl: photoUrl,
      faultCause,
      assignedCrew,
      actionNote: override.actionNote || inspectionNote || "Routine inspection logged",
      officer: "Admin Inspector (You)",
    };

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.report) {
        setSaveMessage({ type: "success", text: "Inspection report successfully committed to municipal ledger!" });
        if (data.report.faultHistory) {
          setFaultHistory(data.report.faultHistory);
        }
        setInspectionNote("");
        startTransition(() => {
          router.refresh();
        });
      } else {
        setSaveMessage({ type: "error", text: data.error || "Failed to commit inspection update." });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Network error saving inspection." });
    }
  }

  const statusBadge = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.Open;
  const priorityBadge = PRIORITY_CONFIG[currentPriority] ?? PRIORITY_CONFIG.Low;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {saveMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            saveMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span>{saveMessage.text}</span>
          <button onClick={() => setSaveMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Primary Inspector Control Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🛠️</span> Municipal Issue Inspector & Triage Console
            </h3>
            <p className="text-xs text-slate-500">Live controls to change phase, dispatch crews, and record fault diagnostics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={runAIFaultInspection}
              disabled={isAnalyzingAI}
              className="text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
            >
              {isAnalyzingAI ? "⚡ Analyzing via Gemini AI…" : "✨ AI Fault Diagnosis"}
            </Button>
          </div>
        </div>

        {/* AI Analysis Result Banner */}
        {aiAnalysis && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <span>🤖</span> {aiAnalysis.engine || "Gemini SmartCity Engine"}
              </span>
              <span className="font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                SLA Target: {aiAnalysis.slaFormatted || "24 Hours"}
              </span>
            </div>
            <p className="text-indigo-800 leading-relaxed font-medium">
              {aiAnalysis.rationale || aiAnalysis.hazardLevel}
            </p>
            {aiAnalysis.suggestedActions?.length > 0 && (
              <div className="pt-2 border-t border-indigo-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Recommended Next Actions:</span>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-indigo-900">
                  {aiAnalysis.suggestedActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Phase Buttons */}
        <div>
          <label className="text-xs font-bold text-slate-700 mb-2 block uppercase tracking-wide">
            Fast Phase Progression
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: "Open", label: "Open (Pending)", color: "hover:bg-amber-50 border-amber-200" },
              { key: "In Progress", label: "Dispatched (In Progress)", color: "hover:bg-blue-50 border-blue-200" },
              { key: "Resolved", label: "Mark Resolved", color: "hover:bg-emerald-50 border-emerald-200" },
              { key: "Closed", label: "Close Ticket", color: "hover:bg-slate-50 border-slate-200" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleQuickStatus(key)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex flex-col ${color} ${
                  currentStatus === key
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-slate-700"
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] ${currentStatus === key ? "text-blue-100" : "text-slate-400"}`}>
                  {currentStatus === key ? "● Active Status" : "Click to transition"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Operational Attributes Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Severity & SLA */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Severity & Priority</label>
            <select
              value={currentPriority}
              onChange={(e) => setCurrentPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Critical">Critical (Immediate Hazard)</option>
              <option value="High">High (Major Disruption)</option>
              <option value="Medium">Medium (Standard Routine)</option>
              <option value="Low">Low (Minor Inconvenience)</option>
            </select>
          </div>

          {/* Department Reassignment */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Jurisdiction Department</label>
            <select
              value={currentDept}
              onChange={(e) => setCurrentDept(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DEMO_DEPARTMENTS.map((dept) => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Fault Category */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Identified Fault Root Cause</label>
            <select
              value={faultCause}
              onChange={(e) => setFaultCause(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Wear & Tear / Environmental">Wear & Tear / Environmental Degradation</option>
              <option value="Severe Weather / Storm Damage">Severe Weather / Storm Damage</option>
              <option value="Third-Party Contractor Damage">Third-Party Contractor Damage</option>
              <option value="Illegal Encroachment / Dumping">Illegal Encroachment / Dumping</option>
              <option value="Electrical Short / Surge">Electrical Short / Surge</option>
              <option value="Pipeline Hydraulic Overload">Pipeline Hydraulic Overload</option>
            </select>
          </div>
        </div>

        {/* Assigned Crew */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Dispatched Maintenance Field Unit</label>
          <input
            value={assignedCrew}
            onChange={(e) => setAssignedCrew(e.target.value)}
            placeholder="e.g. BBMP Ward 12 Heavy Equipment Squad"
            className="w-full rounded-xl border border-slate-300 p-2 text-xs font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Photographic Evidence & Official Repair Proof (with In-Browser Editor) */}
        <div className="pt-2">
          <PhotoUploadEditor
            value={photoUrl}
            onChange={(newImg) => setPhotoUrl(newImg)}
            label="Incident Photo & Official Municipal Repair Proof"
          />
        </div>

        {/* Official Log Note */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Inspector Log Entry & Resolution Notes</label>
          <textarea
            rows={2}
            value={inspectionNote}
            onChange={(e) => setInspectionNote(e.target.value)}
            placeholder="Detail repair actions performed, materials allocated, or follow-up timelines..."
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Save & Commit Button */}
        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            onClick={() => submitUpdates()}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 shadow-sm rounded-xl"
          >
            {isPending ? "Saving Update…" : "💾 Commit Inspection Changes"}
          </Button>
        </div>
      </div>

      {/* Fault Audit Trail & Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
          <span>📋</span> Incident Audit & Action Trail ({faultHistory.length} Entries)
        </h4>
        <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
          {faultHistory.map((item, idx) => (
            <div key={idx} className="relative pl-6">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-xs" />
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{item.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
                <p className="text-slate-600">{item.note}</p>
                <div className="mt-1 text-[10px] text-slate-400 font-medium">Logged by: {item.officer}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
