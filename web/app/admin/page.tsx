import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasValidSupabaseAdminConfig } from "@/lib/supabase/admin";
import AdminDashboard from "./admin-dashboard";
import { ADMIN_SECTIONS, loadAdminDashboard, type AdminSection } from "./admin-data";
import "./admin.css";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ section?: string }> };

export default async function AdminPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const initialSection: AdminSection = ADMIN_SECTIONS.includes(query.section as AdminSection)
    ? query.section as AdminSection
    : "profit";
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (process.env.NODE_ENV === "production") redirect("/login?next=%2Fadmin");
    return <AdminDashboard data={await loadAdminDashboard(supabase)} initialSection={initialSection} previewMode manualAccessConfigured={false}/>;
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") notFound();

  return <AdminDashboard data={await loadAdminDashboard(supabase)} initialSection={initialSection} manualAccessConfigured={hasValidSupabaseAdminConfig()}/>;
}
