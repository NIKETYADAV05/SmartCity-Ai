/**
 * lib/supabase/server.js
 *
 * Supabase server client — use this in:
 *   - React Server Components
 *   - Route Handlers (app/api/*)
 *   - Server Actions
 *
 * IMPORTANT: Always call createClient() inside the function/component body
 * so a fresh client is created per request. Never share a client across
 * requests.
 *
 * The `setAll` handler is intentionally omitted here because pages and
 * components cannot reliably set response cookies in Next.js App Router.
 * Session cookie writes are handled by middleware.js instead.
 *
 * Environment variables are read from .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        // setAll is omitted — middleware handles session refreshes.
        // Adding it here would throw in RSC because response headers
        // cannot be mutated after the component starts streaming.
      },
    }
  );
}
