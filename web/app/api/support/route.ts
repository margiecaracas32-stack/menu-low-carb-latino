import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/privacy";

const CATEGORIES = new Set(["access", "billing", "product", "privacy"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function response(message: string, status: number) {
  return NextResponse.json({ ok: false, message }, { status });
}

async function currentUser() {
  const session = await createSupabaseServerClient();
  const { data: { user } } = await session.auth.getUser();
  return { session, user };
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return response("Solicitud rechazada por seguridad.", 403);
  if (Number(request.headers.get("content-length") ?? 0) > 4_000) return response("El mensaje es demasiado grande.", 413);
  const { user } = await currentUser();
  if (!user) return response("Vuelve a abrir tu enlace de acceso.", 401);

  let category = "";
  let message = "";
  try {
    const body = await request.json() as { category?: unknown; message?: unknown };
    category = String(body.category ?? "");
    message = String(body.message ?? "").trim();
  } catch {
    return response("No pudimos leer el mensaje.", 400);
  }
  if (!CATEGORIES.has(category)) return response("Selecciona el tipo de ayuda.", 400);
  if (message.length < 10 || message.length > 1000) return response("Explica lo ocurrido en 10 a 1000 caracteres.", 400);

  const admin = createSupabaseAdminClient();
  const { data: recent } = await admin.from("support_tickets").select("id").eq("subject_id", user.id).eq("status", "open").gte("created_at", new Date(Date.now() - 10 * 60_000).toISOString()).limit(1);
  if (recent?.length) return response("Ya recibimos una solicitud reciente. La revisaremos antes de 24 horas hábiles.", 429);
  const { error } = await admin.from("support_tickets").insert({ subject_id: user.id, category, message });
  if (error) return response("No pudimos enviar la solicitud. Inténtalo nuevamente.", 500);
  return NextResponse.json({ ok: true, message: "Solicitud recibida. La revisaremos antes de 24 horas hábiles." });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return response("Solicitud rechazada por seguridad.", 403);
  const { session, user } = await currentUser();
  if (!user) return response("No tienes permiso para realizar esta acción.", 403);
  const { data: profile } = await session.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return response("No tienes permiso para realizar esta acción.", 403);

  let ticketId = "";
  try {
    const body = await request.json() as { ticketId?: unknown };
    ticketId = String(body.ticketId ?? "");
  } catch {
    return response("No pudimos leer la solicitud.", 400);
  }
  if (!UUID.test(ticketId)) return response("La solicitud no es válida.", 400);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("support_tickets").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", ticketId).eq("status", "open").select("id").maybeSingle();
  if (error) return response("No pudimos cerrar la solicitud.", 500);
  if (!data) return response("La solicitud ya estaba cerrada.", 409);
  return NextResponse.json({ ok: true, message: "Solicitud marcada como resuelta." });
}
