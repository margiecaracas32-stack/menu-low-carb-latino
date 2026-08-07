import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?access_error=1", requestUrl.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login?access_error=1", requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/login?verified=1", requestUrl.origin));
}

