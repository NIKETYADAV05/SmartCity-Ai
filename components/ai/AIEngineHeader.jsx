"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AI_TABS = [
  { href: "/ai/classification", label: "Classification", icon: "✨" },
  { href: "/ai/priority", label: "Priority Detection", icon: "⚡" },
  { href: "/ai/departments", label: "Dept. Recommendation", icon: "🏢" },
  { href: "/ai/insights", label: "City Insights", icon: "📊" },
];

export default function AIEngineHeader({ title, subtitle }) {
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [savedKey, setSavedKey] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const existing = localStorage.getItem("smartcity_gemini_key");
        if (existing) {
          setApiKey(existing);
          setSavedKey(true);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem("smartcity_gemini_key", apiKey.trim());
      setSavedKey(true);
    } else {
      localStorage.removeItem("smartcity_gemini_key");
      setSavedKey(false);
    }
    setShowKeyModal(false);
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner & Engine Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Engine 2.0 Active
            </span>
            <span className="text-xs text-slate-400">
              {savedKey ? "Engine: Google Gemini Flash" : "Engine: Hybrid NLP + Multi-Domain Matrix"}
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-slate-300 max-w-2xl">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-600/20 hover:bg-indigo-600/30 px-3 py-2 text-xs font-medium text-indigo-200 transition-colors"
          >
            <span>⚙️</span>
            <span>{savedKey ? "Gemini Key: Active" : "Configure Gemini Key"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2 no-scrollbar">
        {AI_TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Modal for Custom Gemini API Key */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>🤖</span> Google Gemini API Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              SmartCity OS operates with an on-premises municipal NLP engine by default. To unlock live cloud generative AI reasoning via Google Gemini, paste your API key below.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gemini API Key (optional)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                {savedKey && (
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("smartcity_gemini_key");
                      setApiKey("");
                      setSavedKey(false);
                      setShowKeyModal(false);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear Key
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white shadow-xs"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
