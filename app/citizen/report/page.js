"use client";

import { useState, Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ISSUE_CATEGORIES } from "@/lib/demo-data";
import LocationPickerMap from "@/components/map/LocationPickerMap";
import PhotoUploadEditor from "@/components/ui/PhotoUploadEditor";

const STEPS = ["Category", "Details", "Location", "Review"];

function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors ${
              i < current
                ? "bg-green-500 border-green-500 text-white"
                : i === current
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-slate-300 text-slate-400"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <span
            className={`text-xs font-medium hidden sm:block ${
              i === current ? "text-blue-600" : "text-slate-500"
            }`}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <div className={`h-px w-6 sm:w-10 ${i < current ? "bg-green-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ReportIssueForm() {
  const searchParams = useSearchParams();

  const initialLoc = searchParams.get("loc") ? decodeURIComponent(searchParams.get("loc")) : "";
  const initialLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")) : null;
  const initialLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")) : null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    priority: "Medium",
    location: initialLoc,
    landmark: "",
    ward: "",
    lat: initialLat,
    lng: initialLng,
    imageUrl: "",
  });
  const [referenceNumber, setReferenceNumber] = useState("RPT-0042");
  const [submitted, setSubmitted] = useState(false);
  const [aiTriaging, setAiTriaging] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleAiAutoTriage = async () => {
    const text = `${form.title}. ${form.description}`.trim();
    if (!text) return;
    setAiTriaging(true);
    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("smartcity_gemini_key") : null;
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-gemini-api-key": apiKey } : {}),
        },
        body: JSON.stringify({ text, apiKey }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const { category, priority, confidence, department } = data.data;
        setForm((prev) => ({
          ...prev,
          category: category || prev.category,
          priority: priority || prev.priority,
        }));
        setAiSuggestion({ category, priority, confidence, department });
      }
    } catch (err) {
      console.error("AI auto-triage failed:", err);
    } finally {
      setAiTriaging(false);
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      const created = data.report || {
        id: `RPT-${String(Math.floor(100 + Math.random() * 900))}`,
        ...form,
        status: "Open",
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const stored = JSON.parse(localStorage.getItem("smartcity_custom_reports") || "[]");
        localStorage.setItem("smartcity_custom_reports", JSON.stringify([created, ...stored]));
      } catch (err) {
        console.warn("Storage sync failed:", err);
      }

      setReferenceNumber(created.id);
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
      const fallbackId = `RPT-${String(Math.floor(100 + Math.random() * 900))}`;
      const fallback = {
        id: fallbackId,
        ...form,
        status: "Open",
        reportedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        const stored = JSON.parse(localStorage.getItem("smartcity_custom_reports") || "[]");
        localStorage.setItem("smartcity_custom_reports", JSON.stringify([fallback, ...stored]));
      } catch {}
      setReferenceNumber(fallbackId);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLocationPicked = (locData) => {
    setForm((prev) => ({
      ...prev,
      lat: locData.lat,
      lng: locData.lng,
      location: locData.location || prev.location,
      landmark: locData.landmark || prev.landmark,
      ward: locData.ward || prev.ward,
    }));
  };

  if (submitted) {
    return (
      <div className="space-y-4">
        <Card className="max-w-lg mx-auto text-center py-12">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-500 mx-auto mb-4">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <h2 className="text-lg font-bold text-slate-800">Report Submitted!</h2>
          <p className="mt-1 text-sm text-slate-500">
            Your reference number is{" "}
            <span className="font-mono font-semibold text-blue-600">{referenceNumber}</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            The issue has been geo-tagged on the city map and dispatched to the concerned department.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/citizen/my-reports">
              <Button variant="outline" size="sm">View My Reports</Button>
            </Link>
            <Link href="/citizen/map">
              <Button variant="outline" size="sm">View on Map</Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                setSubmitted(false);
                setStep(0);
                setForm({
                  category: "",
                  title: "",
                  description: "",
                  priority: "Medium",
                  location: "",
                  landmark: "",
                  ward: "",
                  lat: null,
                  lng: null,
                });
              }}
            >
              Report Another
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report an Issue"
        subtitle="Help improve your city by reporting problems you see with GPS accuracy."
        actions={
          <Link href="/citizen/dashboard">
            <Button variant="outline" size="sm">← Dashboard</Button>
          </Link>
        }
      />

      <Card className="max-w-2xl">
        <StepIndicator current={step} steps={STEPS} />

        {step === 0 && (
          <div>
            <CardHeader title="Select Category" subtitle="What type of issue are you reporting?" className="mb-4" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => set("category", cat)}
                  className={`rounded-lg border p-3 text-left text-xs font-medium transition-all ${
                    form.category === cat
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button disabled={!form.category} onClick={() => setStep(1)}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <CardHeader title="Issue Details" subtitle="Describe the problem clearly." className="mb-2" />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Title *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Brief description of the issue"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">Description *</label>
                <button
                  type="button"
                  onClick={handleAiAutoTriage}
                  disabled={aiTriaging || (!form.title.trim() && !form.description.trim())}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 transition-colors"
                >
                  <span>✨</span>
                  <span>{aiTriaging ? "Analyzing with AI…" : "AI Auto-Triage"}</span>
                </button>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Explain the issue in detail..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {aiSuggestion && (
              <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-2.5 text-xs text-indigo-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">✨ AI Triage: </span>
                  <span>{aiSuggestion.category}</span>
                  <span className="text-indigo-500 mx-1.5">•</span>
                  <span className="font-semibold text-indigo-700">{aiSuggestion.priority} Priority</span>
                  <span className="text-indigo-400 text-[10px] ml-1.5">({aiSuggestion.confidence}% match)</span>
                </div>
                <span className="text-[10px] bg-indigo-200/60 font-bold px-2 py-0.5 rounded text-indigo-800">
                  {aiSuggestion.department}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <PhotoUploadEditor
                value={form.imageUrl}
                onChange={(img) => set("imageUrl", img)}
                label="Incident Photographic Evidence (with Live In-Browser Editor)"
              />
            </div>
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                ← Back
              </Button>
              <Button disabled={!form.title || !form.description} onClick={() => setStep(2)}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <CardHeader
              title="Interactive Location Picker"
              subtitle="Point directly on the Geoapify map, search an address, or use your GPS."
              className="mb-2"
            />

            {/* Geoapify Interactive Location Picker Map */}
            <LocationPickerMap
              initialLat={form.lat || 12.9716}
              initialLng={form.lng || 77.5946}
              onLocationSelect={handleLocationPicked}
            />

            <div className="flex flex-col gap-1 mt-3">
              <label className="text-xs font-medium text-slate-700">Address / Street *</label>
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. MG Road, near Signal 4"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Landmark</label>
                <input
                  value={form.landmark}
                  onChange={(e) => set("landmark", e.target.value)}
                  placeholder="Nearby landmark"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700">Ward</label>
                <input
                  value={form.ward}
                  onChange={(e) => set("ward", e.target.value)}
                  placeholder="e.g. Ward 42"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button disabled={!form.location} onClick={() => setStep(3)}>
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <CardHeader title="Review & Submit" subtitle="Confirm your report before submitting." className="mb-2" />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
              {[
                { label: "Category", value: form.category },
                { label: "Title", value: form.title },
                { label: "Priority", value: form.priority },
                { label: "Location", value: form.location },
                {
                  label: "Coordinates",
                  value: form.lat && form.lng ? `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}` : "Not pinned",
                },
                { label: "Landmark", value: form.landmark || "None" },
                { label: "Ward", value: form.ward || "Not specified" },
                { label: "Description", value: form.description },
              ].map((row) => (
                <div key={row.label} className="flex gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-slate-500">{row.label}</span>
                  <span className="text-slate-700 text-xs leading-relaxed">{row.value}</span>
                </div>
              ))}
              {form.imageUrl && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs font-medium text-slate-500">Photo Proof</span>
                  <div className="relative h-16 w-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-900">
                    <img src={form.imageUrl} alt="Proof" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-400">
              By submitting, your issue will be tagged on the city map using Geoapify coordinates.
            </p>
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                ← Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting Issue…" : "Submit Report"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ReportIssuePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading form…</div>}>
      <ReportIssueForm />
    </Suspense>
  );
}
