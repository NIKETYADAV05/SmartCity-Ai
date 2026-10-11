/**
 * proxy.js  (Next.js 16+ successor to middleware.js)
 *
 * Responsibilities:
 *  1. Refresh Supabase session cookies on every request (required by @supabase/ssr).
 *  2. Protect /citizen/* — redirect unauthenticated users to /login.
 *  3. Protect /admin/*   — redirect unauthenticated OR non-admin users away.
 *  4. Redirect already-authenticated users away from /login and /register.
 *
 * Role data is read from a custom JWT claim `user_role` that the Supabase
 * database trigger populates via the profiles table.  If that claim is not
 * yet present (e.g. right after sign-up before the token is refreshed) we
 * fall back to fetching the role from public.profiles using the anon key —
 * which is safe because Supabase RLS on that table restricts reads to the
 * owner's own row.
 *
 * IMPORTANT: Never use the service-role key here. Only the publishable
 * (anon) key is used.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/** Routes that require an authenticated session. */
const CITIZEN_PREFIX = "/citizen";
const ADMIN_PREFIX   = "/admin";

/** Routes that authenticated users should skip. */
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // ── 1. Build a response clone we can attach cookies to ──────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── 2. Refresh session + get authenticated user ──────────────────────────
  const { data: { user } } = await supabase.auth.getUser();

  // ── Demo role detection ──────────────────────────────────────────────────
  const demoCookie = request.cookies.get("smartcity_role")?.value;
  const demoQuery  = request.nextUrl.searchParams.get("demo");

  // If ?demo= param provided in URL, save cookie and redirect to clean path
  if (demoQuery) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("demo");
    const redirectRes = NextResponse.redirect(cleanUrl);
    redirectRes.cookies.set("smartcity_role", demoQuery, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    return redirectRes;
  }

  const effectiveRole = demoCookie || (user ? await getUserRole(supabase, user.id) : null);

  // ── 3. Redirect authenticated users away from /login and /register ───────
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const role = await getUserRole(supabase, user.id);
    const dest = role === "admin" ? "/admin" : "/citizen/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── 4. Handle /citizen/* ────────────────────────────────────────────────
  if (pathname.startsWith(CITIZEN_PREFIX)) {
    if (!user && effectiveRole !== "citizen") {
      return NextResponse.redirect(new URL("/login?next=" + encodeURIComponent(pathname), request.url));
    }
  }

  // ── 5. STRICT SECURITY: Handle /admin/* ──────────────────────────────────
  // Allow public access to the dedicated admin login portal
  if (pathname === "/admin-login") {
    if (effectiveRole === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return supabaseResponse;
  }

  // All /admin/* routes require verified administrator credentials
  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (effectiveRole !== "admin") {
      if (user && effectiveRole === "citizen") {
        // Authenticated citizen attempting to enter admin — redirect to citizen dashboard
        return NextResponse.redirect(new URL("/citizen/dashboard", request.url));
      }
      // Unauthenticated or not admin — redirect to admin login
      return NextResponse.redirect(new URL("/admin-login?next=" + encodeURIComponent(pathname), request.url));
    }
  }

  return supabaseResponse;
}

/**
 * Resolve the user's role from JWT app_metadata first (fast path),
 * then fall back to a public.profiles DB query.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 * @returns {Promise<"citizen"|"admin"|null>}
 */
async function getUserRole(supabase, userId) {
  // Fast path: role stored in JWT app_metadata by a Supabase hook/trigger.
  const { data: { user } } = await supabase.auth.getUser();
  const jwtRole = user?.app_metadata?.role ?? user?.user_metadata?.role;
  if (jwtRole) return jwtRole;

  // Slow path: query public.profiles (RLS ensures only own row is readable).
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role ?? "citizen";
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
