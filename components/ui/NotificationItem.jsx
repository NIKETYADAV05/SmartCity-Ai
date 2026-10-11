/**
 * NotificationItem.jsx — Single notification row.
 */
import { cn, formatDate } from "@/lib/utils";
import Badge from "./Badge";

const TYPE_CONFIG = {
  update:   { variant: "info",    label: "Update"   },
  resolved: { variant: "success", label: "Resolved" },
  alert:    { variant: "danger",  label: "Alert"    },
  info:     { variant: "default", label: "Info"     },
  warning:  { variant: "warning", label: "Warning"  },
};

export default function NotificationItem({ notification, onClick }) {
  const { type, title, body, read, createdAt } = notification;
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex gap-3 px-4 py-3 cursor-pointer transition-colors",
        read ? "hover:bg-slate-50" : "bg-blue-50/40 hover:bg-blue-50",
        onClick && "hover:bg-slate-50"
      )}
    >
      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", read ? "bg-transparent" : "bg-blue-500")} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
          <span className="text-[11px] text-slate-400">{formatDate(createdAt, "relative")}</span>
        </div>
        <p className="mt-0.5 text-sm font-medium text-slate-800 leading-snug">{title}</p>
        {body && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{body}</p>}
      </div>
    </div>
  );
}
