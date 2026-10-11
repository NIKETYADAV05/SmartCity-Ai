/**
 * lib/supabase/client.js
 *
 * Supabase browser client — use this in Client Components ("use client").
 *
 * createBrowserClient() from @supabase/ssr automatically wires cookie
 * storage so that the session is readable server-side. The client is a
 * singleton per browser tab (isSingleton: true is the default).
 *
 * Environment variables are read from .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
