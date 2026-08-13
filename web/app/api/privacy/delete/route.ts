import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DELETE_CONFIRMATION, hashPrivacySubject, isSameOrigin } from "@/lib/privacy";

function result(message: string, status: number, code?: string) {
  return NextResponse.json({ ok: false, message, code }, { status });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return result("Solicitud rechazada por seguridad.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 2_000) return result("La solicitud es demasiado grande.", 413);

  const session = await createSupabaseServerClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return result("Vuelve a abrir tu enlace de acceso.", 401, "auth_required");

  let confirmation = "";
  try {
    const body = await request.json() as { confirmation?: unknown };
    confirmation = String(body.confirmation ?? "");
  } catch {
    return result("No pudimos leer la confirmación.", 400);
  }
  if (confirmation !== DELETE_CONFIRMATION) return result(`Escribe exactamente: ${DELETE_CONFIRMATION}`, 400);

  const lastSignIn = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
  if (!lastSignIn || Date.now() - lastSignIn > 15 * 60_000) {
    return result("Por seguridad, vuelve a entrar con un enlace nuevo antes de eliminar la cuenta.", 409, "recent_login_required");
  }

  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") return result("La cuenta propietaria no puede borrarse desde la app. Primero debe transferirse la administración.", 409, "admin_protected");

  const subjectHash = hashPrivacySubject(user.id);
  try {
    const scrubResults = await Promise.all([
      admin.from("event_log").delete().eq("user_id", user.id),
      admin.from("ai_calls").delete().eq("user_id", user.id),
      admin.from("error_log").delete().eq("user_id", user.id),
      admin.from("manual_access_grants").update({ email: `deleted+${subjectHash.slice(0, 12)}@invalid.local`, reason: "Cuenta eliminada por solicitud del titular." }).eq("user_id", user.id),
      admin.from("manual_access_events").update({ target_email: `deleted+${subjectHash.slice(0, 12)}@invalid.local`, detail: "Cuenta eliminada por solicitud del titular." }).eq("target_user_id", user.id),
    ]);
    if (scrubResults.some((entry) => entry.error)) throw new Error("privacy_scrub_failed");

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    await admin.from("privacy_audit").insert({ subject_hash: subjectHash, action: "deleted", status: "completed" });
    return NextResponse.json({ ok: true, message: "Tu cuenta y tus datos personales fueron eliminados." });
  } catch {
    await admin.from("privacy_audit").insert({ subject_hash: subjectHash, action: "deleted", status: "failed" });
    return result("No pudimos completar la eliminación. Tus datos no se darán por borrados; inténtalo otra vez.", 500);
  }
}
