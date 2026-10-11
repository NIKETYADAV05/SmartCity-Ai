/**
 * AI Priority & Urgency Detection Engine for SmartCity OS.
 * Assesses public safety risk, hazard vectors, and computes dynamic SLA windows.
 */
import { generateCivicAI } from "./gemini-client.js";

// Risk keywords and their severity contribution
const SEVERITY_TRIGGERS = [
  { words: ["fire", "sparking", "live wire", "gas leak", "explosion", "electrocution", "collapsed", "drowning"], score: 95, tier: "Critical", sla: "2 Hours", hazard: "Life Threatening" },
  { words: ["open manhole", "deep ditch", "cave-in", "flooding", "pipe burst", "toxic", "contaminated"], score: 88, tier: "Critical", sla: "4 Hours", hazard: "Severe Infrastructure Hazard" },
  { words: ["signal stuck", "gridlock", "traffic jam", "accident prone", "major pothole", "overflowing garbage", "dead animal"], score: 76, tier: "High", sla: "24 Hours", hazard: "Public Disruption" },
  { words: ["broken streetlight", "pavement crack", "flickering", "drainage slow", "dust", "debris"], score: 54, tier: "Medium", sla: "48 Hours", hazard: "Moderate Inconvenience" },
  { words: ["park bench", "painting", "signboard faded", "cosmetic", "garden grass"], score: 28, tier: "Low", sla: "7 Days", hazard: "Low Impact" },
];

/**
 * Local heuristic priority calculation.
 */
export function calculatePriorityNLP(text, category = "") {
  const combined = `${text} ${category}`.toLowerCase();
  let maxScore = 45;
  let priorityTier = "Medium";
  let slaFormatted = "48 Hours";
  let slaHours = 48;
  let hazardLevel = "Moderate Disruption";
  const factors = {
    lifeSafety: 20,
    trafficImpact: 30,
    healthHazard: 25,
    infrastructureDamage: 35,
  };

  for (const trigger of SEVERITY_TRIGGERS) {
    for (const w of trigger.words) {
      if (combined.includes(w)) {
        if (trigger.score > maxScore) {
          maxScore = trigger.score;
          priorityTier = trigger.tier;
          slaFormatted = trigger.sla;
          hazardLevel = trigger.hazard;
        }
      }
    }
  }

  // Adjust vectors based on triggers
  if (priorityTier === "Critical") {
    factors.lifeSafety = Math.min(98, maxScore + 2);
    factors.trafficImpact = Math.min(95, maxScore - 8);
    factors.healthHazard = combined.includes("manhole") || combined.includes("sewage") ? 92 : 65;
    factors.infrastructureDamage = 90;
    slaHours = slaFormatted.includes("2") ? 2 : 4;
  } else if (priorityTier === "High") {
    factors.lifeSafety = 60;
    factors.trafficImpact = 82;
    factors.healthHazard = combined.includes("garbage") ? 88 : 50;
    factors.infrastructureDamage = 75;
    slaHours = 24;
  } else if (priorityTier === "Low") {
    factors.lifeSafety = 12;
    factors.trafficImpact = 15;
    factors.healthHazard = 10;
    factors.infrastructureDamage = 22;
    slaHours = 168;
  }

  const suggestedActions = [];
  if (priorityTier === "Critical") {
    suggestedActions.push("Dispatch immediate field rapid-response team");
    suggestedActions.push("Issue citizen hazard geotagged advisory");
    suggestedActions.push("Escalate to Department Head on-call");
  } else if (priorityTier === "High") {
    suggestedActions.push("Assign to next morning maintenance roster");
    suggestedActions.push("Queue equipment & materials dispatch");
  } else {
    suggestedActions.push("Batch into routine weekly ward inspection");
  }

  return {
    priority: priorityTier,
    urgencyScore: maxScore,
    hazardLevel,
    slaFormatted,
    slaHours,
    riskFactors: factors,
    suggestedActions,
    engine: "SmartCity Priority Safety Matrix (NLP)",
    rationale: `Classified as ${priorityTier} based on detected public safety indicators, requiring resolution within ${slaFormatted}.`,
  };
}

/**
 * Full AI Priority Detector.
 */
export async function detectPriority(text, category = "", customApiKey = null) {
  if (!text || !text.trim()) {
    return { error: "No text provided for priority scoring." };
  }

  const prompt = `You are the SmartCity OS Municipal Safety & Priority Triage AI.
Analyze this civic issue report and calculate its emergency severity, public risk, and SLA.

REPORT:
"${text}"
CATEGORY CONTEXT: "${category}"

Return valid JSON with:
{
  "priority": "one of: Critical, High, Medium, Low",
  "urgencyScore": number 0 to 100,
  "hazardLevel": "one of: Life Threatening, Severe Infrastructure Hazard, Public Disruption, Low Impact",
  "slaFormatted": "e.g. 2 Hours, 4 Hours, 24 Hours, 48 Hours, 7 Days",
  "slaHours": number representing hours,
  "riskFactors": {
    "lifeSafety": number 0 to 100,
    "trafficImpact": number 0 to 100,
    "healthHazard": number 0 to 100,
    "infrastructureDamage": number 0 to 100
  },
  "suggestedActions": array of 2 to 3 operational actions,
  "rationale": "1-2 sentence justification for this priority score"
}`;

  const geminiRes = await generateCivicAI({
    prompt,
    systemInstruction: "You are an emergency urban disaster and city operations triaging AI. Output strict JSON only.",
    customApiKey,
    model: "gemini-2.5-flash",
  });

  if (geminiRes.success && geminiRes.json && geminiRes.json.priority) {
    return {
      ...geminiRes.json,
      engine: `Google Gemini AI (${geminiRes.model})`,
      source: "gemini",
    };
  }

  const localRes = calculatePriorityNLP(text, category);
  return {
    ...localRes,
    source: "local-nlp",
  };
}

/**
 * Triage and re-rank an entire batch of reports by urgency score.
 */
export async function triageReportsQueue(reports, customApiKey = null) {
  const triaged = [];

  for (const report of reports) {
    const text = `${report.title}. ${report.description || ""}`;
    const assessment = await detectPriority(text, report.category, customApiKey);

    triaged.push({
      ...report,
      aiPriority: assessment.priority,
      urgencyScore: assessment.urgencyScore,
      hazardLevel: assessment.hazardLevel,
      slaFormatted: assessment.slaFormatted,
      slaHours: assessment.slaHours,
      riskFactors: assessment.riskFactors,
      engine: assessment.engine,
    });
  }

  // Sort descending by urgency score
  triaged.sort((a, b) => b.urgencyScore - a.urgencyScore);

  return triaged;
}
