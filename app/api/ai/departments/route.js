import { NextResponse } from "next/server";
import { recommendDepartment, getDepartmentWorkloads } from "@/lib/ai/department-router";

export async function GET() {
  try {
    const workloads = getDepartmentWorkloads();
    return NextResponse.json({
      success: true,
      workloads,
    });
  } catch (error) {
    console.error("AI Departments GET API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch department workloads." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, categoryHint, apiKey } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "A valid 'text' string is required for department recommendation." },
        { status: 400 }
      );
    }

    const headerApiKey = request.headers.get("x-gemini-api-key");
    const activeKey = apiKey || headerApiKey || null;

    const result = await recommendDepartment(text, categoryHint || "", activeKey);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI Departments API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during department routing." },
      { status: 500 }
    );
  }
}
