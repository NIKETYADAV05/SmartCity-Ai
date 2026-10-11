import { NextResponse } from "next/server";
import { generateCityInsightsReport } from "@/lib/ai/insights-generator";

export async function GET(request) {
  try {
    const headerApiKey = request.headers.get("x-gemini-api-key");
    const report = await generateCityInsightsReport(headerApiKey);
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("AI Insights GET API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate city insights." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { apiKey } = body;
    const headerApiKey = request.headers.get("x-gemini-api-key");
    const activeKey = apiKey || headerApiKey || null;

    const report = await generateCityInsightsReport(activeKey);
    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("AI Insights POST API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during insights generation." },
      { status: 500 }
    );
  }
}
