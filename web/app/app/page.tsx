import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { loadPersonalizedAppData } from "../../lib/personalized-app";
import { PRIVACY_POLICY_VERSION, SERVICE_CONSENT_PURPOSE } from "../../lib/privacy";
import InternalApp from "./internal-app";
import ConsentGate from "./consent-gate";
import "./internal.css";

export const dynamic = "force-dynamic";

export default async function AppPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && process.env.NODE_ENV === "production") redirect("/login");

  if (user && process.env.NODE_ENV === "production") {
    const { data: hasAccess, error } = await supabase.rpc("has_app_access");
    if (error || hasAccess !== true) redirect("/paywall?access=required");
  }

  if (user) {
    const { data: consent } = await supabase.from("data_consents").select("id").eq("subject_id", user.id).eq("purpose", SERVICE_CONSENT_PURPOSE).eq("policy_version", PRIVACY_POLICY_VERSION).is("withdrawn_at", null).maybeSingle();
    if (!consent) return <ConsentGate/>;
  }

  const initialData = user ? await loadPersonalizedAppData(supabase, user.id) : null;
  return <InternalApp demoMode={!user} userId={user?.id} userCreatedAt={user?.created_at} initialData={initialData} />;
}
