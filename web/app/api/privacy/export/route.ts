import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hashPrivacySubject } from "@/lib/privacy";

type ExportTable = { name: string; filter: "id" | "user_id" | "subject_id" };

const TABLES: ExportTable[] = [
  { name: "profiles", filter: "id" },
  { name: "households", filter: "user_id" },
  { name: "dietary_preferences", filter: "user_id" },
  { name: "subscriptions", filter: "user_id" },
  { name: "weekly_plans", filter: "user_id" },
  { name: "plan_meals", filter: "user_id" },
  { name: "shopping_lists", filter: "user_id" },
  { name: "shopping_items", filter: "user_id" },
  { name: "recipe_feedback", filter: "user_id" },
  { name: "user_progress", filter: "user_id" },
  { name: "event_log", filter: "user_id" },
  { name: "payment_transactions", filter: "user_id" },
  { name: "ai_calls", filter: "user_id" },
  { name: "error_log", filter: "user_id" },
  { name: "data_consents", filter: "subject_id" },
  { name: "support_tickets", filter: "subject_id" },
];

export async function GET() {
  const session = await createSupabaseServerClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, message: "Vuelve a abrir tu enlace de acceso." }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const subjectHash = hashPrivacySubject(user.id);
  try {
    const entries = await Promise.all(TABLES.map(async ({ name, filter }) => {
      const { data, error } = await admin.from(name).select("*").eq(filter, user.id);
      if (error) throw new Error(`privacy_export_${name}`);
      return [name, data ?? []] as const;
    }));

    await admin.from("privacy_audit").insert({ subject_hash: subjectHash, action: "exported", status: "completed" });
    return NextResponse.json({
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email ?? null, created_at: user.created_at },
      data: Object.fromEntries(entries),
      note: "Hotmart conserva por separado los datos de compra que exige su servicio y la normativa aplicable.",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    await admin.from("privacy_audit").insert({ subject_hash: subjectHash, action: "exported", status: "failed" });
    return NextResponse.json({ ok: false, message: "No pudimos preparar la descarga. Inténtalo nuevamente." }, { status: 500 });
  }
}
