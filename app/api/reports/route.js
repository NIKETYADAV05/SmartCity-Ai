import { NextResponse } from "next/server";
import { getAllReports, addReport } from "@/lib/reports-store";

export async function GET() {
  try {
    const reports = getAllReports();
    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      category,
      description,
      priority,
      department,
      location,
      landmark,
      ward,
      lat,
      lng,
      reportedBy,
      imageUrl,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Report title is required." },
        { status: 400 }
      );
    }

    const newReport = addReport({
      title,
      category,
      description,
      priority,
      department,
      location,
      landmark,
      ward,
      lat,
      lng,
      reportedBy,
      imageUrl,
    });

    // Dual-write: persist to Supabase
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: fallbackProfiles } = await supabase
          .from("profiles")
          .select("id")
          .limit(1);

        const citizenId = fallbackProfiles?.[0]?.id || "fff5417e-61d1-4d3d-a348-c6f3138ef625";

        const { error: insertErr } = await supabase.from("complaints").insert({
          ticket_number: newReport.id,
          citizen_id: citizenId,
          title: newReport.title,
          description: newReport.description,
          category: newReport.category,
          priority: (newReport.priority || "medium").toLowerCase(),
          status: "pending",
          department_name: newReport.department,
          address: newReport.location,
          landmark: newReport.landmark,
          ward: newReport.ward,
          latitude: newReport.lat,
          longitude: newReport.lng,
          image_url: newReport.imageUrl || null,
          reported_by: newReport.reportedBy,
          ai_category: newReport.category,
          ai_priority: (newReport.priority || "medium").toLowerCase(),
          ai_department: newReport.department,
        });

        if (insertErr) {
          console.warn("Supabase complaint insert error:", insertErr);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase complaint persistence notice:", dbErr?.message || dbErr);
    }

    return NextResponse.json({
      success: true,
      report: newReport,
    });
  } catch (error) {
    console.error("Failed to create report:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create report." },
      { status: 500 }
    );
  }
}
