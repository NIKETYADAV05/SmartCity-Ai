import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "AI Engine | SmartCity OS",
  description: "Next-generation civic intelligence, automated triage, and predictive city insights.",
};

export default async function AIEngineLayout({ children }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

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
    ?? "City Officer";

  return (
    <AppShell notificationCount={0} user={{ name: displayName, email: user?.email ?? "ai-officer@smartcity.gov" }}>
      {children}
    </AppShell>
  );
}
