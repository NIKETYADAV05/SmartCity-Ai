import { NextResponse } from "next/server";
import { getReportById, updateReportDetails } from "@/lib/reports-store";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const report = getReportById(id);

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Failed to get report:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = updateReportDetails(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    // Dual-write: update Supabase complaint and log to complaint_updates
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);

        const patchData = {};
        if (body.status) patchData.status = body.status.toLowerCase().replace(" ", "_");
        if (body.priority) patchData.priority = body.priority.toLowerCase();
        if (body.department) patchData.department_name = body.department;
        if (body.imageUrl !== undefined) patchData.image_url = body.imageUrl;

        let complaintUuid = null;
        if (Object.keys(patchData).length > 0) {
          const { data: updatedRows } = await supabase
            .from("complaints")
            .update(patchData)
            .eq("ticket_number", id)
            .select("id");
          complaintUuid = updatedRows?.[0]?.id;
        }

        if (!complaintUuid) {
          const { data: existingRows } = await supabase
            .from("complaints")
            .select("id")
            .eq("ticket_number", id)
            .limit(1);
          complaintUuid = existingRows?.[0]?.id;
        }

        // Record to complaint_updates table
        if (complaintUuid && (body.actionNote || body.status)) {
          await supabase.from("complaint_updates").insert({
            complaint_id: complaintUuid,
            status: body.status || updated.status,
            comment: body.actionNote || `Status changed to ${body.status}`,
            action: body.status ? `Status changed to ${body.status}` : "Inspection update",
            officer: body.officer || "Admin In-Charge",
          });
        }
      }
    } catch (dbErr) {
      console.warn("Supabase complaint update notice:", dbErr?.message || dbErr);
    }

    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    console.error("Failed to update report:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
