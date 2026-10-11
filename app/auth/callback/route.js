/**
 * app/auth/callback/route.js
 *
 * Handles the redirect from Supabase after email confirmation.
 * Supabase appends `?code=...` to this URL; we exchange the code for a
 * session and then redirect the user to their appropriate dashboard.
 */
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // `next` lets the login page pass a post-auth destination.
  const next = searchParams.get("next") ?? "/citizen/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Successful confirmation — redirect to the intended destination.
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  // If something went wrong, send to login with an error hint.
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "confirmation_failed");
  return NextResponse.redirect(loginUrl);
}
