import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import InternalApp from "./internal-app";
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

  return <InternalApp demoMode={!user} />;
}
