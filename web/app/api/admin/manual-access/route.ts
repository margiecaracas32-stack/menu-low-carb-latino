import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient, createSupabaseMailClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DURATIONS = new Set(["7", "30", "permanent"]);

function response(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

async function requireAdmin() {
  const sessionClient = await createSupabaseServerClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sessionClient.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

async function findUserByEmail(email: string): Promise<User | null> {
  const admin = createSupabaseAdminClient();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match) return match;
    if (data.users.length < 100) return null;
  }
  throw new Error("User lookup limit reached.");
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return response("Solicitud rechazada por seguridad.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return response("La solicitud es demasiado grande.", 413);
  const owner = await requireAdmin();
  if (!owner) return response("No tienes permiso para realizar esta acción.", 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return response("Los datos enviados no son válidos.", 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const reason = String(body.reason ?? "").trim();
  const duration = String(body.duration ?? "30");
  const confirmPermanent = body.confirmPermanent === true;
  if (!EMAIL.test(email) || email.length > 320) return response("Escribe un correo electrónico válido.", 400);
  if (reason.length < 5 || reason.length > 240) return response("Explica el motivo en una frase breve.", 400);
  if (!DURATIONS.has(duration)) return response("Selecciona una duración válida.", 400);
  if (duration === "permanent" && !confirmPermanent) return response("Confirma expresamente el acceso permanente.", 400);

  try {
    const admin = createSupabaseAdminClient();
    let target = await findUserByEmail(email);
    if (!target) {
      const created = await admin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: { created_by_admin: true },
      });
      if (created.error || !created.data.user) throw created.error ?? new Error("User creation failed.");
      target = created.data.user;
    }

    const now = new Date();
    const durationDays = duration === "permanent" ? null : Number(duration);
    const expiresAt = durationDays == null ? null : new Date(now.getTime() + durationDays * 86_400_000).toISOString();
    const { data: active } = await admin.from("manual_access_grants").select("id").eq("user_id", target.id).is("revoked_at", null).or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`).limit(1);
    if (active?.length) return response("Esta persona ya tiene un acceso manual vigente.", 409);

    const { data: grant, error: grantError } = await admin.from("manual_access_grants").insert({
      user_id: target.id,
      email,
      reason,
      duration_days: durationDays,
      expires_at: expiresAt,
      granted_by: owner.id,
    }).select("id").single();
    if (grantError || !grant) throw grantError ?? new Error("Grant creation failed.");

    const { error: eventError } = await admin.from("manual_access_events").insert({
      grant_id: grant.id,
      action: "granted",
      actor_user_id: owner.id,
      target_user_id: target.id,
      target_email: email,
      detail: reason,
      expires_at: expiresAt,
    });
    if (eventError) {
      await admin.from("manual_access_grants").update({
        revoked_at: new Date().toISOString(),
        revoked_by: owner.id,
        revoke_reason: "Registro de auditoría incompleto.",
      }).eq("id", grant.id);
      throw eventError;
    }

    const redirectTo = process.env.MANUAL_ACCESS_REDIRECT_URL || `${new URL(request.url).origin}/auth/callback`;
    const mail = createSupabaseMailClient();
    const { error: mailError } = await mail.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
    });

    if (mailError) {
      const revokedAt = new Date().toISOString();
      await admin.from("manual_access_grants").update({
        revoked_at: revokedAt,
        revoked_by: owner.id,
        revoke_reason: "No se pudo enviar el enlace de acceso.",
      }).eq("id", grant.id);
      await admin.from("manual_access_events").insert({
        grant_id: grant.id,
        action: "revoked",
        actor_user_id: owner.id,
        target_user_id: target.id,
        target_email: email,
        detail: "No se pudo enviar el enlace de acceso.",
        expires_at: expiresAt,
      });
      return response("No pudimos enviar el enlace. No se concedió acceso; inténtalo nuevamente.", 502);
    }

    return NextResponse.json({ ok: true, message: "Acceso concedido y enlace enviado." });
  } catch {
    return response("No pudimos conceder el acceso. Revisa la conexión de Supabase e inténtalo nuevamente.", 500);
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return response("Solicitud rechazada por seguridad.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return response("La solicitud es demasiado grande.", 413);
  const owner = await requireAdmin();
  if (!owner) return response("No tienes permiso para realizar esta acción.", 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return response("Los datos enviados no son válidos.", 400);
  }
  const grantId = String(body.grantId ?? "");
  if (!UUID.test(grantId)) return response("El acceso seleccionado no es válido.", 400);

  try {
    const admin = createSupabaseAdminClient();
    const { data: grant, error } = await admin.from("manual_access_grants").select("id,user_id,email,reason,expires_at,revoked_at").eq("id", grantId).single();
    if (error || !grant) return response("No encontramos ese acceso.", 404);
    if (grant.revoked_at) return response("Ese acceso ya estaba retirado.", 409);

    const revokedAt = new Date().toISOString();
    const detail = "Retirado manualmente por el propietario.";
    const { data: revoked, error: revokeError } = await admin.from("manual_access_grants").update({
      revoked_at: revokedAt,
      revoked_by: owner.id,
      revoke_reason: detail,
    }).eq("id", grantId).is("revoked_at", null).select("id").maybeSingle();
    if (revokeError) throw revokeError;
    if (!revoked) return response("Ese acceso ya fue retirado.", 409);

    const { error: eventError } = await admin.from("manual_access_events").insert({
      grant_id: grant.id,
      action: "revoked",
      actor_user_id: owner.id,
      target_user_id: grant.user_id,
      target_email: grant.email,
      detail,
      expires_at: grant.expires_at,
    });
    if (eventError) throw eventError;

    return NextResponse.json({ ok: true, message: "Acceso retirado." });
  } catch {
    return response("No pudimos retirar el acceso. Inténtalo nuevamente.", 500);
  }
}
