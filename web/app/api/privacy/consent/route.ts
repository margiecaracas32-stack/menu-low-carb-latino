import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSameOrigin, PRIVACY_POLICY_VERSION, SERVICE_CONSENT_PURPOSE } from "@/lib/privacy";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ ok: false, message: "Solicitud rechazada por seguridad." }, { status: 403 });
  if (Number(request.headers.get("content-length") ?? 0) > 2_000) return NextResponse.json({ ok: false, message: "La solicitud es demasiado grande." }, { status: 413 });

  const session = await createSupabaseServerClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, message: "Vuelve a abrir tu enlace de acceso." }, { status: 401 });

  let accepted = false;
  try {
    const body = await request.json() as { accepted?: unknown };
    accepted = body.accepted === true;
  } catch {
    return NextResponse.json({ ok: false, message: "No pudimos leer tu decisión." }, { status: 400 });
  }
  if (!accepted) return NextResponse.json({ ok: false, message: "Debes autorizar el uso necesario de tus datos para continuar." }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("data_consents").upsert({
    subject_id: user.id,
    purpose: SERVICE_CONSENT_PURPOSE,
    policy_version: PRIVACY_POLICY_VERSION,
    locale: "es",
    origin: "app_access_gate",
  }, { onConflict: "subject_id,purpose,policy_version", ignoreDuplicates: true });

  if (error) return NextResponse.json({ ok: false, message: "No pudimos guardar tu autorización. Inténtalo otra vez." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
