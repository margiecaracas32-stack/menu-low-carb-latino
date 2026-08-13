import { NextRequest, NextResponse } from "next/server";
import { recordProductError } from "../../../lib/server-observability";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const SAFE_CONTEXT = /^[a-z][a-z0-9_:-]{2,79}$/;
const SAFE_ROUTE = /^\/[a-z0-9/_?=&.-]{0,199}$/i;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 4096) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Acceso requerido." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Datos inválidos." }, { status: 400 }); }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const context = typeof body.context === "string" ? body.context : "";
  const route = typeof body.route === "string" ? body.route : "";
  if (!message || message.length > 500 || !SAFE_CONTEXT.test(context) || !SAFE_ROUTE.test(route)) {
    return NextResponse.json({ error: "Error inválido." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: rateError } = await admin.from("error_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", hourAgo);
  if (rateError) return NextResponse.json({ error: "No pudimos registrar el error." }, { status: 503 });
  if ((count ?? 0) >= 20) return NextResponse.json({ error: "Demasiados reportes." }, { status: 429 });

  const { error } = await recordProductError({ userId: user.id, message, context, route });
  if (error) return NextResponse.json({ error: "No pudimos registrar el error." }, { status: 503 });
  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "Solicitud no permitida." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2048) {
    return NextResponse.json({ message: "Solicitud demasiado grande." }, { status: 413 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Acceso administrativo requerido." }, { status: 403 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ message: "Acceso administrativo requerido." }, { status: 403 });

  let fingerprint: string | null = null;
  let message = "";
  try {
    const body = await request.json() as { fingerprint?: unknown; message?: unknown };
    fingerprint = typeof body.fingerprint === "string" && body.fingerprint.length <= 240 ? body.fingerprint : null;
    message = typeof body.message === "string" && body.message.length <= 1000 ? body.message : "";
  } catch {
    return NextResponse.json({ message: "No pudimos leer el aviso." }, { status: 400 });
  }
  if (!fingerprint && !message) return NextResponse.json({ message: "El aviso no es válido." }, { status: 400 });

  const admin = createSupabaseAdminClient();
  let query = admin.from("error_log")
    .update({ status: "resolved", resolved_at: new Date().toISOString() })
    .in("status", ["open", "investigating"]);
  query = fingerprint ? query.eq("fingerprint", fingerprint) : query.is("fingerprint", null).eq("message", message);
  const { data, error } = await query.select("id");
  if (error) return NextResponse.json({ message: "No pudimos cerrar el aviso." }, { status: 500 });
  if (!data?.length) return NextResponse.json({ message: "El aviso ya estaba cerrado." }, { status: 409 });
  return NextResponse.json({ message: data.length === 1 ? "1 registro marcado como resuelto." : `${data.length} registros marcados como resueltos.` });
}
