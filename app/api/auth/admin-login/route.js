import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const normalizedEmail = (email || "").trim().toLowerCase();

    // Check credentials against admin seed
    const isValidAdmin =
      normalizedEmail === "admin@smartcity.gov" &&
      password === "AdminPassword123!";

    if (!isValidAdmin) {
      return NextResponse.json(
        { error: "Invalid municipal email or administrative password." },
        { status: 401 }
      );
    }

    // Set secure admin session cookie
    const response = NextResponse.json({
      success: true,
      message: "Admin authenticated successfully",
      user: {
        email: "admin@smartcity.gov",
        name: "System Administrator",
        role: "admin",
      },
    });

    response.cookies.set("smartcity_role", "admin", {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Admin login API error:", error);
    return NextResponse.json(
      { error: "Internal server error during admin login." },
      { status: 500 }
    );
  }
}
