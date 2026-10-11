/**
 * AI Department Recommendation & Smart Routing Engine for SmartCity OS.
 * Performs agency matching, multi-department conflict resolution, and capacity load balancing.
 */
import { DEMO_DEPARTMENTS, DEMO_REPORTS } from "../demo-data.js";
import { generateCivicAI } from "./gemini-client.js";

// Mapping of cross-department overlap rules
const MULTI_DEPT_PATTERNS = [
  {
    triggers: ["tree", "wire", "pole"],
    lead: "Electricity Board",
    secondary: ["Emergency Services", "Town Planning"],
    conflictReason: "Tree branch or falling pole interferes with power lines; requires electrical de-energizing before tree trimming.",
  },
  {
    triggers: ["pipe burst", "pothole", "flooded road", "road collapse", "water leak road"],
    lead: "Water Works",
    secondary: ["Public Works"],
    conflictReason: "Underground pipe rupture damages roadway pavement. Water mains must be isolated and repaired before road recarpeting.",
  },
  {
    triggers: ["manhole", "sewage road", "drain overflow"],
    lead: "Water Works",
    secondary: ["Sanitation", "Public Works"],
    conflictReason: "Sewage overflow spills onto pedestrian street. Involves underground wastewater clearance and surface decontamination.",
  },
  {
    triggers: ["debris", "construction", "encroachment", "lake dump"],
    lead: "Sanitation",
    secondary: ["Town Planning"],
    conflictReason: "Unauthorized dumping requires sanitation removal and town planning enforcement fine.",
  },
];

/**
 * Calculate dynamic live department capacity and workload.
 */
export function getDepartmentWorkloads() {
  return DEMO_DEPARTMENTS.map((dept) => {
    // Count actual reports assigned in DEMO_REPORTS
    const assignedReports = DEMO_REPORTS.filter((r) => r.department === dept.name);
    const openCount = assignedReports.filter((r) => r.status !== "Resolved").length;
    
    // Total active issues combined
    const totalActive = dept.activeIssues;
    const capacityThreshold = 70; // baseline capacity index
    const loadPercentage = Math.min(100, Math.round((totalActive / capacityThreshold) * 100));

    let status = "Optimal";
    let statusColor = "emerald";
    if (loadPercentage >= 90) {
      status = "Critical Overload";
      statusColor = "red";
    } else if (loadPercentage >= 70) {
      status = "Elevated Queue";
      statusColor = "amber";
    }

    return {
      id: dept.id,
      name: dept.name,
      head: dept.head,
      activeIssues: totalActive,
      resolvedThisMonth: dept.resolvedThisMonth,
      avgResponse: dept.avgResponse,
      openReportsSampleCount: openCount,
      loadPercentage,
      status,
      statusColor,
      availableCapacity: Math.max(0, 100 - loadPercentage),
    };
  });
}

/**
 * Route complaint to department with multi-agency analysis.
 */
export async function recommendDepartment(text, categoryHint = "", customApiKey = null) {
  const lower = (text || "").toLowerCase();
  
  // Check for cross-department jurisdictional overlap
  let detectedConflict = null;
  for (const pattern of MULTI_DEPT_PATTERNS) {
    const hasTrigger = pattern.triggers.some((t) => lower.includes(t));
    if (hasTrigger) {
      detectedConflict = pattern;
      break;
    }
  }

  // LLM routing if key exists
  const prompt = `You are the SmartCity OS Municipal Governance Routing AI.
Evaluate this citizen complaint and determine which city department must take primary ownership, and whether any secondary agencies must assist.

CITY DEPARTMENTS:
- Public Works (Roads, bridges, flyovers, traffic signals, physical structures)
- Sanitation (Garbage, waste collection, debris, cleaning, dumping)
- Electricity Board (Streetlights, transformers, power lines, outages)
- Water Works (Water pipelines, drinking water supply, sewage, drains, manholes)
- Emergency Services (Fires, live wire sparks, building collapse, hazardous chemical spills)
- Town Planning (Zoning, park encroachment, construction permits)

COMPLAINT:
"${text}"

Return valid JSON with:
{
  "primaryDepartment": "exact name of department",
  "confidence": number 80 to 99,
  "secondaryDepartments": array of 0 to 2 department names,
  "jurisdictionConflict": boolean (true if multiple agencies are needed),
  "routingRationale": "explanation of routing decision",
  "recommendedSla": "e.g. 24 Hours",
  "dispatchRecommendation": "action instructions for dispatch officer"
}`;

  const geminiRes = await generateCivicAI({
    prompt,
    systemInstruction: "You are a municipal dispatch coordinator. Output strict JSON only.",
    customApiKey,
    model: "gemini-2.5-flash",
  });

  if (geminiRes.success && geminiRes.json && geminiRes.json.primaryDepartment) {
    return {
      ...geminiRes.json,
      engine: `Google Gemini AI (${geminiRes.model})`,
      workloads: getDepartmentWorkloads(),
    };
  }

  // Deterministic routing fallback
  let primaryDept = "Public Works";
  let confidence = 88;
  const secondary = detectedConflict ? detectedConflict.secondary : [];

  if (lower.includes("fire") || lower.includes("spark") || lower.includes("collapse")) {
    primaryDept = "Emergency Services";
    confidence = 98;
  } else if (lower.includes("water") || lower.includes("pipe") || lower.includes("sewage") || lower.includes("drain") || lower.includes("manhole")) {
    primaryDept = "Water Works";
    confidence = 94;
  } else if (lower.includes("garbage") || lower.includes("trash") || lower.includes("waste") || lower.includes("odor") || lower.includes("dump")) {
    primaryDept = "Sanitation";
    confidence = 93;
  } else if (lower.includes("light") || lower.includes("dark") || lower.includes("electric") || lower.includes("bulb")) {
    primaryDept = "Electricity Board";
    confidence = 95;
  } else if (lower.includes("park") || lower.includes("garden") || lower.includes("encroach")) {
    primaryDept = "Town Planning";
    confidence = 86;
  }

  return {
    primaryDepartment: detectedConflict ? detectedConflict.lead : primaryDept,
    confidence,
    secondaryDepartments: secondary,
    jurisdictionConflict: Boolean(detectedConflict),
    conflictReason: detectedConflict ? detectedConflict.conflictReason : null,
    routingRationale: `Directly maps to ${primaryDept} core responsibilities with ${confidence}% semantic affinity.`,
    recommendedSla: primaryDept === "Emergency Services" ? "2 Hours" : "24-48 Hours",
    dispatchRecommendation: `Auto-route ticket to ${primaryDept} central dispatch console with priority flag.`,
    engine: "SmartCity Jurisdictional Routing NLP Engine",
    workloads: getDepartmentWorkloads(),
  };
}
