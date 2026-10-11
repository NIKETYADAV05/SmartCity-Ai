export const dynamic = "force-dynamic";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import NotificationItem from "@/components/ui/NotificationItem";
import Button from "@/components/ui/Button";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  const unread = DEMO_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        actions={<Button variant="outline" size="sm">Mark all read</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-700">All Notifications</p>
            <span className="text-[11px] text-slate-400">Demo data only</span>
          </div>
          <div className="divide-y divide-slate-100">
            {DEMO_NOTIFICATIONS.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        </Card>

        {/* Settings panel */}
        <Card>
          <p className="text-sm font-semibold text-slate-800 mb-4">Notification Preferences</p>
          <div className="space-y-3">
            {[
              { label: "Status updates on my reports", checked: true },
              { label: "Emergency city alerts",         checked: true },
              { label: "New announcements",             checked: false },
              { label: "Weekly city digest",            checked: false },
              { label: "Department responses",          checked: true },
            ].map((pref) => (
              <label key={pref.label} className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-xs text-slate-700">{pref.label}</span>
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${pref.checked ? "bg-blue-600" : "bg-slate-200"}`}>
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${pref.checked ? "translate-x-4.5" : "translate-x-0.5"}`}/>
                </div>
              </label>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-slate-400">Preferences are UI-only in the demo.</p>
        </Card>
      </div>
    </div>
  );
}
