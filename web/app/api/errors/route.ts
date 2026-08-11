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
