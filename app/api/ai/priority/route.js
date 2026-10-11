import { NextResponse } from "next/server";
import { detectPriority } from "@/lib/ai/priority-detector";

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, category, apiKey } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "A valid 'text' string is required for priority analysis." },
        { status: 400 }
      );
    }

    const headerApiKey = request.headers.get("x-gemini-api-key");
    const activeKey = apiKey || headerApiKey || null;

    const result = await detectPriority(text, category || "", activeKey);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI Priority API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during priority analysis." },
      { status: 500 }
    );
  }
}
