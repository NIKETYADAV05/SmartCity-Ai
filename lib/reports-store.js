/**
 * Unified Reports Store for SmartCity OS.
 * Manages demo baseline complaints + dynamically submitted citizen reports.
 */
import { DEMO_REPORTS } from "./demo-data.js";
import { CATEGORY_DEPARTMENTS } from "./ai/classifier.js";

// Global in-memory storage persisted across hot-reloads and requests
const globalReportsKey = Symbol.for("smartcity.reports");

if (!global[globalReportsKey]) {
  global[globalReportsKey] = [...DEMO_REPORTS];
}

export function getAllReports() {
  return global[globalReportsKey];
}

export function getReportById(id) {
  if (!id) return null;
  return global[globalReportsKey].find((r) => r.id === id) || null;
}

export function addReport({
  title,
  category = "Road & Infrastructure",
  description = "",
  priority = "Medium",
  department = null,
  location = "Central Ward",
  landmark = "",
  ward = "",
  lat = 12.9716,
  lng = 77.5946,
  reportedBy = "Citizen (You)",
  imageUrl = "",
}) {
  const currentReports = global[globalReportsKey];
  
  // Generate incremental ID
  const count = currentReports.length + 1;
  const id = `RPT-${String(count).padStart(3, "0")}`;

  // Automatically infer department if not specified
  const assignedDept = department || CATEGORY_DEPARTMENTS[category] || "Public Works";

  const newReport = {
    id,
    title: title.trim(),
    category,
    status: "Open",
    priority,
    department: assignedDept,
    location: location || (ward ? `Ward ${ward}` : "Bengaluru Central"),
    landmark: landmark || "",
    ward: ward || "",
    lat: typeof lat === "number" ? lat : 12.9716,
    lng: typeof lng === "number" ? lng : 77.5946,
    reportedBy: reportedBy || "Citizen (You)",
    imageUrl: imageUrl || "",
    reportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    description: description.trim(),
  };

  // Prepend to list so newest reports appear first
  global[globalReportsKey] = [newReport, ...currentReports];

  return newReport;
}

export function updateReportStatus(id, newStatus) {
  return updateReportDetails(id, { status: newStatus });
}

export function updateReportDetails(id, updates = {}) {
  const currentReports = global[globalReportsKey];
  const index = currentReports.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const prev = currentReports[index];
  const updated = {
    ...prev,
    ...updates,
    faultHistory: [
      ...(prev.faultHistory || []),
      ...(updates.actionNote ? [{
        action: updates.status ? `Status changed to ${updates.status}` : "Inspection update",
        note: updates.actionNote,
        officer: updates.officer || "Admin In-Charge",
        timestamp: new Date().toISOString(),
      }] : []),
    ],
    updatedAt: new Date().toISOString(),
  };

  currentReports[index] = updated;
  return updated;
}
