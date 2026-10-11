import { NextResponse } from "next/server";
import { batchClassifyReports } from "@/lib/ai/classifier";
import { DEMO_REPORTS } from "@/lib/demo-data";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { reports, apiKey } = body;
    const headerApiKey = request.headers.get("x-gemini-api-key");
    const activeKey = apiKey || headerApiKey || null;

    const targetReports = Array.isArray(reports) && reports.length > 0 ? reports : DEMO_REPORTS;
    const result = await batchClassifyReports(targetReports, activeKey);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI Batch Classification API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during batch classification." },
      { status: 500 }
    );
  }
}
