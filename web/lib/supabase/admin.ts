import { createClient } from "@supabase/supabase-js";

const SUPABASE_SECRET_KEY_PATTERN = /^sb_secret_[A-Za-z0-9_-]{20,}$/;

export function hasValidSupabaseAdminConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey || !SUPABASE_SECRET_KEY_PATTERN.test(secretKey)) return false;

  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey || !hasValidSupabaseAdminConfig()) {
    throw new Error("Supabase admin configuration is missing.");
  }

  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createSupabaseMailClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) throw new Error("Supabase public configuration is missing.");

  return createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
