import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import { safeAuthDestination } from "../../../lib/auth-destination";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const destination = safeAuthDestination(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL(`/login?access_error=1&next=${encodeURIComponent(destination)}`, requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL(`/login?access_error=1&next=${encodeURIComponent(destination)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
