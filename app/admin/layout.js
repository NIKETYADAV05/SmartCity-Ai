/**
 * Admin section layout — wraps all /admin/* pages with the dashboard shell.
 * Fetches the authenticated admin user's profile server-side.
 * Route protection (role check) is handled in proxy.js; this layout
 * only fetches for display purposes.
 */
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const demoRole = cookieStore.get("smartcity_role")?.value;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userRole = demoRole;
  let profile = null;

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
    userRole = profile?.role ?? user.app_metadata?.role ?? user.user_metadata?.role ?? demoRole;
  }

  // Citizens are strictly blocked from rendering the administration portal
  if (userRole !== "admin") {
    if (userRole === "citizen") {
      redirect("/citizen/dashboard");
    }
    redirect("/admin-login");
  }

  const displayName = profile?.name
    ?? profile?.full_name
    ?? user?.user_metadata?.name
    ?? user?.user_metadata?.full_name
    ?? user?.email?.split("@")[0]
    ?? "Admin";

  return (
    <AppShell notificationCount={0} user={{ name: displayName, email: user?.email ?? "" }}>
      {children}
    </AppShell>
  );
}
