import { NextResponse } from "next/server";
import { classifyComplaint } from "@/lib/ai/classifier";

export async function POST(request) {
  try {
    const body = await request.json();
    const { text, apiKey } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "A valid 'text' string is required for classification." },
        { status: 400 }
      );
    }

    const headerApiKey = request.headers.get("x-gemini-api-key");
    const activeKey = apiKey || headerApiKey || null;

    const result = await classifyComplaint(text, activeKey);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("AI Classification API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during classification." },
      { status: 500 }
    );
  }
}
