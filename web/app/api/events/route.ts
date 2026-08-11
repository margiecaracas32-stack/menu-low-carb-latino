import { NextRequest, NextResponse } from "next/server";
import { AUTHENTICATED_EVENTS, isAnalyticsEvent } from "../../../lib/analytics-contract";
import { recordProductEvent } from "../../../lib/server-observability";
import { createSupabaseAdminClient } from "../../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_SOURCE = /^[a-z0-9][a-z0-9:_-]{0,79}$/;
const SAFE_KEY = /^[a-zA-Z0-9:_-]{1,180}$/;

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8192) return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Datos inválidos." }, { status: 400 }); }
  if (!isAnalyticsEvent(body.event) || typeof body.sessionId !== "string" || !UUID.test(body.sessionId)) {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }
  const eventId = typeof body.eventId === "string" && UUID.test(body.eventId) ? body.eventId : null;
  const semanticKey = typeof body.eventKey === "string" && SAFE_KEY.test(body.eventKey) ? body.eventKey : null;
  if (!eventId && !semanticKey) return NextResponse.json({ error: "Evento incompleto." }, { status: 400 });
  const source = typeof body.source === "string" && SAFE_SOURCE.test(body.source) ? body.source : "directo";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (AUTHENTICATED_EVENTS.has(body.event) && !user) {
    return NextResponse.json({ error: "Inicia sesión para registrar esta acción." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  let rateQuery = admin.from("event_log").select("id", { count: "exact", head: true }).gte("occurred_at", hourAgo);
  rateQuery = user ? rateQuery.eq("user_id", user.id) : rateQuery.eq("anonymous_session_id", body.sessionId);
  const { count, error: rateError } = await rateQuery;
  if (rateError) return NextResponse.json({ error: "No pudimos registrar la medición." }, { status: 503 });
  if ((count ?? 0) >= 180) return NextResponse.json({ error: "Demasiados eventos." }, { status: 429 });

  const { error } = await recordProductEvent({
    event: body.event,
    userId: user?.id,
    sessionId: body.sessionId,
    source,
    isQa: body.isQa === true,
    properties: body.properties,
    idempotencyKey: semanticKey ?? eventId!,
  });
  if (error) return NextResponse.json({ error: "No pudimos registrar la medición." }, { status: 503 });
  return new NextResponse(null, { status: 204 });
}
