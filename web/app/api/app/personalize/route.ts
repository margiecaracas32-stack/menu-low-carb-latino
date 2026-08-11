import { NextRequest, NextResponse } from "next/server";
import { validateAnswers } from "../../../app/recipe-catalog";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { loadSavedAnswers, savePersonalizedAppData } from "../../../../lib/personalized-app";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Solicitud no permitida." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para guardar tu semana." }, { status: 401 });

  const { data: hasAccess, error: accessError } = await supabase.rpc("has_app_access");
  if (accessError || hasAccess !== true) return NextResponse.json({ error: "Tu acceso no está vigente." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Datos inválidos." }, { status: 400 }); }
  const submittedAnswers = validateAnswers((body as { answers?: unknown } | null)?.answers);
  const answers = submittedAnswers ?? await loadSavedAnswers(supabase, user.id);
  if (!answers) return NextResponse.json({ error: "Revisa tus tres respuestas." }, { status: 400 });

  const { data: planId, error } = await savePersonalizedAppData(supabase, answers);

  if (error || !planId) {
    console.error("personalize_week_failed", { code: error?.code, userId: user.id });
    return NextResponse.json({ error: "No pudimos guardar tu semana. Inténtalo de nuevo." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, planId });
}
