/**
 * Citizen section layout — wraps all /citizen/* pages with the dashboard shell.
 * Fetches the authenticated user's profile server-side and passes it to AppShell.
 */
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function CitizenLayout({ children }) {
  const supabase = await createClient();

  // getUser() is the secure call (validates JWT with Supabase servers).
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch the profile row for display name / notification count.
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const displayName = profile?.name
    ?? profile?.full_name
    ?? user?.user_metadata?.name
    ?? user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "User";

  return (
    <AppShell notificationCount={0} user={{ name: displayName, email: user?.email ?? "" }}>
      {children}
    </AppShell>
  );
}
