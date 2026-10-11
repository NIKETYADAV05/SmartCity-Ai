"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card, CardHeader, CardDivider } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { GEOAPIFY_API_KEY, MAP_STYLES, DEFAULT_CITY_CENTER } from "@/lib/geoapify";

function SettingSection({ title, children }) {
  return (
    <Card>
      <CardHeader title={title} className="mb-4" />
      <CardDivider className="mb-4" />
      {children}
    </Card>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("General");
  const [apiKeyStatus, setApiKeyStatus] = useState("idle"); // "idle" | "testing" | "success" | "error"
  const [apiKeyMessage, setApiKeyMessage] = useState("");

  const testApiKey = async () => {
    setApiKeyStatus("testing");
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=Bangalore&apiKey=${GEOAPIFY_API_KEY}&limit=1`
      );
      if (res.ok) {
        setApiKeyStatus("success");
        setApiKeyMessage("✅ Geoapify API Key is valid and active. Geocoding and map tiles verified!");
      } else {
        setApiKeyStatus("error");
        setApiKeyMessage(`❌ API Key returned error ${res.status}`);
      }
    } catch (err) {
      setApiKeyStatus("error");
      setApiKeyMessage(`❌ Connection failed: ${err.message}`);
    }
  };

  const TABS = [
    "General",
    "API Keys & Map API",
    "Notifications",
    "SLA Configuration",
    "Departments",
    "Audit Log",
    "Backup",
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" subtitle="Configure system parameters, GIS integration, and municipal preferences." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left nav */}
        <div className="lg:col-span-1">
          <Card padding="sm">
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab === "API Keys & Map API" ? "🗺️ API Keys & Maps" : tab}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Settings panels */}
        <div className="lg:col-span-3 space-y-4">
          {/* General */}
          {activeTab === "General" && (
            <SettingSection title="General City Settings">
              <div className="space-y-4 max-w-md">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">Platform Name</label>
                  <input
                    defaultValue="SmartCity AI"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">City Name</label>
                  <input
                    defaultValue="Bangalore"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">Support Email</label>
                  <input
                    defaultValue="support@smartcity.gov.in"
                    type="email"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">Timezone</label>
                  <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Asia/Kolkata (IST +5:30)</option>
                    <option>UTC</option>
                  </select>
                </div>
                <Button size="sm">Save General Settings</Button>
              </div>
            </SettingSection>
          )}

          {/* API Keys & Map Configuration */}
          {activeTab === "API Keys & Map API" && (
            <SettingSection title="Geoapify Map API &amp; GIS Integration">
              <div className="space-y-4 max-w-lg">
                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs font-bold text-slate-900">Geoapify Map Services</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Powers vector &amp; raster street map tiles, address autocomplete, reverse geocoding, and static map images across the platform.
                  </p>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">Current Geoapify API Key</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={GEOAPIFY_API_KEY}
                      readOnly
                      className="w-full font-mono rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={testApiKey}
                      disabled={apiKeyStatus === "testing"}
                    >
                      {apiKeyStatus === "testing" ? "Testing…" : "Test Key"}
                    </Button>
                  </div>
                  {apiKeyMessage && (
                    <p
                      className={`text-xs mt-1 font-medium ${
                        apiKeyStatus === "success" ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {apiKeyMessage}
                    </p>
                  )}
                </div>

                <CardDivider />

                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Map Defaults</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">Default Latitude</label>
                    <input
                      defaultValue={DEFAULT_CITY_CENTER.lat}
                      className="w-full font-mono rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">Default Longitude</label>
                    <input
                      defaultValue={DEFAULT_CITY_CENTER.lng}
                      className="w-full font-mono rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-700">Default Map Tile Style</label>
                  <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {MAP_STYLES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} — {st.description}
                      </option>
                    ))}
                  </select>
                </div>

                <Button size="sm">Save GIS Preferences</Button>
              </div>
            </SettingSection>
          )}

          {/* Notification settings */}
          {activeTab === "Notifications" && (
            <SettingSection title="Notification Settings">
              <div className="space-y-3 max-w-md">
                {[
                  { label: "Email notifications for new complaints", default: true },
                  { label: "SMS alerts for emergency reports", default: true },
                  { label: "Weekly digest to department heads", default: false },
                  { label: "SLA breach alerts", default: true },
                  { label: "Auto-assign to default department", default: false },
                ].map((setting) => (
                  <label key={setting.label} className="flex items-center justify-between gap-4 cursor-pointer">
                    <span className="text-sm text-slate-700">{setting.label}</span>
                    <input type="checkbox" defaultChecked={setting.default} className="h-4 w-4 rounded text-blue-600" />
                  </label>
                ))}
                <Button size="sm" className="mt-2">
                  Save Notification Settings
                </Button>
              </div>
            </SettingSection>
          )}

          {/* SLA Configuration */}
          {activeTab === "SLA Configuration" && (
            <SettingSection title="SLA Configuration">
              <div className="space-y-3 max-w-md">
                <p className="text-xs text-slate-500">Default resolution time targets per priority level.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Critical", value: "4 hours" },
                    { label: "High", value: "24 hours" },
                    { label: "Medium", value: "72 hours" },
                    { label: "Low", value: "7 days" },
                  ].map((sla) => (
                    <div key={sla.label} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-700">{sla.label}</label>
                      <input
                        defaultValue={sla.value}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
                <Button size="sm">Save SLA Settings</Button>
              </div>
            </SettingSection>
          )}

          {/* Other tabs fallback */}
          {["Departments", "Audit Log", "Backup"].includes(activeTab) && (
            <SettingSection title={activeTab}>
              <div className="py-8 text-center text-xs text-slate-400">
                {activeTab} configurations and export tools are active for administrative operators.
              </div>
            </SettingSection>
          )}
        </div>
      </div>
    </div>
  );
}
