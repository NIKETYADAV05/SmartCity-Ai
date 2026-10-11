/**
 * Gemini AI Client integration for SmartCity OS.
 * Uses the official @google/genai SDK with automatic graceful fallback.
 */
import { GoogleGenAI } from "@google/genai";

export function getGeminiClient(customApiKey) {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

/**
 * Generate structured text/json using Gemini.
 * Returns { success: true, text, json, model } or { success: false, reason }
 */
export async function generateCivicAI({
  prompt,
  systemInstruction,
  responseSchema,
  customApiKey,
  model = "gemini-2.5-flash",
}) {
  const client = getGeminiClient(customApiKey);
  if (!client) {
    return {
      success: false,
      reason: "NO_API_KEY",
      message: "No Gemini API Key configured. Fallback to built-in SmartCity NLP Engine.",
    };
  }

  try {
    const config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (responseSchema) {
      config.responseMimeType = "application/json";
      config.responseSchema = responseSchema;
    }

    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });

    const outputText = response.text || "";
    let json = null;
    if (responseSchema || outputText.trim().startsWith("{") || outputText.trim().startsWith("[")) {
      try {
        // Strip markdown code fences if any
        const cleaned = outputText.replace(/^```(json)?\n/, "").replace(/```$/, "").trim();
        json = JSON.parse(cleaned);
      } catch {
        json = null;
      }
    }

    return {
      success: true,
      text: outputText,
      json,
      model,
    };
  } catch (error) {
    console.warn("Gemini generation failed, falling back to local NLP engine:", error?.message || error);
    return {
      success: false,
      reason: "API_ERROR",
      message: error?.message || "Failed to communicate with Gemini API.",
    };
  }
}
