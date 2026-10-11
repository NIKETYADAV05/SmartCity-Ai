/**
 * navigation.js
 * Single source of truth for all sidebar/nav routes.
 * Each entry drives the sidebar, breadcrumbs, and route guards.
 */

export const NAV_GROUPS = [
  {
    id: "citizen",
    label: "Citizen Portal",
    items: [
      {
        id: "citizen-dashboard",
        label: "Dashboard",
        href: "/citizen/dashboard",
        icon: "HomeIcon",
        description: "Your personal city dashboard",
      },
      {
        id: "report-issue",
        label: "Report an Issue",
        href: "/citizen/report",
        icon: "ExclamationCircleIcon",
        description: "Submit a new city issue or complaint",
      },
      {
        id: "my-reports",
        label: "My Reports",
        href: "/citizen/my-reports",
        icon: "ClipboardDocumentListIcon",
        description: "Track your submitted reports",
      },
      {
        id: "city-map",
        label: "City Map",
        href: "/citizen/map",
        icon: "MapIcon",
        description: "Interactive map of reported issues",
      },
      {
        id: "notifications",
        label: "Notifications",
        href: "/citizen/notifications",
        icon: "BellIcon",
        description: "Alerts and status updates",
        badge: "3",
      },
      {
        id: "profile",
        label: "Profile",
        href: "/citizen/profile",
        icon: "UserCircleIcon",
        description: "Your account and preferences",
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      {
        id: "admin-dashboard",
        label: "Dashboard",
        href: "/admin",
        icon: "ChartBarIcon",
        description: "City-wide KPIs and overview",
      },
      {
        id: "complaints",
        label: "Complaints",
        href: "/admin/complaints",
        icon: "InboxStackIcon",
        description: "Manage all citizen complaints",
      },
      {
        id: "departments",
        label: "Departments",
        href: "/admin/departments",
        icon: "BuildingOffice2Icon",
        description: "City department management",
      },
      {
        id: "traffic",
        label: "Traffic",
        href: "/admin/traffic",
        icon: "TruckIcon",
        description: "Traffic monitoring and signals",
      },
      {
        id: "waste",
        label: "Waste Management",
        href: "/admin/waste",
        icon: "TrashIcon",
        description: "Waste collection and disposal",
      },
      {
        id: "streetlights",
        label: "Streetlights",
        href: "/admin/streetlights",
        icon: "LightBulbIcon",
        description: "Streetlight status and outages",
      },
      {
        id: "emergency",
        label: "Emergency Reports",
        href: "/admin/emergency",
        icon: "ShieldExclamationIcon",
        description: "High-priority emergency incidents",
        badge: "2",
        badgeVariant: "danger",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/admin/analytics",
        icon: "PresentationChartLineIcon",
        description: "Trends, charts, and city insights",
      },
      {
        id: "users",
        label: "Users",
        href: "/admin/users",
        icon: "UsersIcon",
        description: "Citizen and staff accounts",
      },
      {
        id: "settings",
        label: "Settings",
        href: "/admin/settings",
        icon: "Cog6ToothIcon",
        description: "Platform configuration",
      },
    ],
  },
  {
    id: "ai",
    label: "AI Engine",
    items: [
      {
        id: "ai-classification",
        label: "Classification",
        href: "/ai/classification",
        icon: "SparklesIcon",
        description: "Complaint category auto-tagging",
        badge: "AI",
        badgeVariant: "brand",
      },
      {
        id: "ai-priority",
        label: "Priority Detection",
        href: "/ai/priority",
        icon: "BoltIcon",
        description: "Urgency scoring for reports",
        badge: "Live",
        badgeVariant: "brand",
      },
      {
        id: "ai-departments",
        label: "Dept. Recommendation",
        href: "/ai/departments",
        icon: "ArrowsPointingOutIcon",
        description: "Smart routing to correct department",
        badge: "Smart",
        badgeVariant: "brand",
      },
      {
        id: "ai-insights",
        label: "City Insights",
        href: "/ai/insights",
        icon: "MagnifyingGlassCircleIcon",
        description: "AI-generated city health reports",
        badge: "New",
        badgeVariant: "brand",
      },
    ],
  },
];

/** Flat list of all nav items — useful for breadcrumbs, active detection, etc. */
export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

/** Resolve a nav item by href */
export function getNavItem(href) {
  return ALL_NAV_ITEMS.find((item) => item.href === href) ?? null;
}
