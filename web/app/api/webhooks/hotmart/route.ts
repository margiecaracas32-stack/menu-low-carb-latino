import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient, createSupabaseMailClient } from "@/lib/supabase/admin";
import {
  isFreshHotmartEvent,
  parseHotmartEvent,
  payloadHash,
  verifyHotmartToken,
  type HotmartCatalog,
  type NormalizedHotmartEvent,
} from "@/lib/hotmart-webhook";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 256_000;
const HOTMART_REDELIVERY_WINDOW_MS = 60 * 24 * 60 * 60_000;
const ACCESS_STATES = new Set(["trialing", "active"]);

function json(message: Record<string, unknown>, status = 200) {
  return NextResponse.json(message, { status });
}

function config() {
  const catalog: HotmartCatalog = {
    productId: process.env.HOTMART_PRODUCT_ID?.trim() ?? "",
    monthlyPlanId: process.env.HOTMART_MONTHLY_PLAN_ID?.trim() ?? "",
    annualPlanId: process.env.HOTMART_ANNUAL_PLAN_ID?.trim() ?? "",
  };
  const hottok = process.env.HOTMART_HOTTOK?.trim();
  const configured = Boolean(hottok && catalog.productId && catalog.monthlyPlanId && catalog.annualPlanId);
  return { catalog, hottok, configured, mode: process.env.HOTMART_WEBHOOK_MODE === "live" ? "live" : "observe" as "live" | "observe" };
}

async function findUser(event: NormalizedHotmartEvent): Promise<User | null> {
  const admin = createSupabaseAdminClient();
  if (event.subscriberCode || event.hotmartSubscriptionId) {
    let query = admin.from("subscriptions").select("user_id");
    query = event.subscriberCode
      ? query.eq("subscriber_code", event.subscriberCode)
      : query.eq("hotmart_subscription_id", event.hotmartSubscriptionId!);
    const { data } = await query.maybeSingle();
    if (data?.user_id) {
      const { data: result } = await admin.auth.admin.getUserById(data.user_id);
      if (result.user) return result.user;
    }
  }

  if (event.anonymousId) {
    const { data: anonymousProfile } = await admin.from("profiles").select("id").eq("anon_id", event.anonymousId).maybeSingle();
    if (anonymousProfile?.id) {
      const { data } = await admin.auth.admin.getUserById(anonymousProfile.id);
      if (data.user) return data.user;
    }
  }

  const { data: profile } = await admin.from("profiles").select("id").eq("email", event.email).maybeSingle();
  if (profile?.id) {
    const { data } = await admin.auth.admin.getUserById(profile.id);
    return data.user ?? null;
  }
  return null;
}

async function ensureUser(event: NormalizedHotmartEvent) {
  const existing = await findUser(event);
  if (existing) return { user: existing, created: false };
  if (!ACCESS_STATES.has(event.membershipStatus)) return { user: null, created: false };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: event.email,
    email_confirm: false,
    user_metadata: { full_name: event.name, source: "hotmart" },
  });
  if (error || !data.user) throw error ?? new Error("auth_user_creation_failed");
  return { user: data.user, created: true };
}

async function setWebhookStatus(eventId: string, values: Record<string, unknown>) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("webhook_events").update(values).eq("provider_event_id", eventId);
  if (error) throw error;
}

async function beginWebhook(event: NormalizedHotmartEvent, hash: string) {
  const admin = createSupabaseAdminClient();
  const { data: current } = await admin.from("webhook_events")
    .select("status,attempts,last_error_code,updated_at")
    .eq("provider_event_id", event.eventId)
    .maybeSingle();
  if (current?.status === "processed" || current?.status === "ignored" || current?.status === "illegal") return current;
  if (current?.status === "received"
    && Date.now() - new Date(String(current.updated_at)).getTime() < 5 * 60_000) {
    return { ...current, status: "duplicate" };
  }
  if (current) {
    await setWebhookStatus(event.eventId, {
      status: "received",
      attempts: Math.min(Number(current.attempts ?? 1) + 1, 50),
      last_error_code: null,
      payload_hash: hash,
    });
    return current;
  }
  const { error } = await admin.from("webhook_events").insert({
    provider_event_id: event.eventId,
    event_type: event.eventType,
    status: "received",
    payload_hash: hash,
    product_id: event.productId,
    transaction_id: event.transactionId,
  });
  if (error?.code === "23505") return { status: "duplicate", attempts: 1, last_error_code: null, updated_at: new Date().toISOString() };
  if (error) throw error;
  return null;
}

async function sendAccessEmail(email: string, request: Request) {
  const redirectTo = process.env.HOTMART_ACCESS_REDIRECT_URL || `${new URL(request.url).origin}/auth/callback`;
  const mail = createSupabaseMailClient();
  const { error } = await mail.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function GET() {
  const state = config();
  return json({
    service: "hotmart-webhook",
    ready: state.configured,
    mode: state.mode,
  }, state.configured ? 200 : 503);
}

export async function POST(request: Request) {
  const state = config();
  if (!state.configured) return json({ error: "service_unavailable" }, 503);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return json({ error: "payload_too_large" }, 413);

  const receivedToken = request.headers.get("x-hotmart-hottok");
  if (!verifyHotmartToken(receivedToken, state.hottok)) {
    console.warn("Hotmart webhook rejected", { code: "unauthorized" });
    return json({ error: "unauthorized" }, 401);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) return json({ error: "payload_too_large" }, 413);

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  let event: NormalizedHotmartEvent;
  try {
    event = parseHotmartEvent(payload, state.catalog);
  } catch (error) {
    const code = error instanceof Error ? error.message : "invalid_payload";
    if (state.mode === "observe") {
      console.info("Hotmart observation rejected by live catalog", { code });
      return json({ received: true, mode: "observe", result: "not_applied", code });
    }
    return json({ error: "invalid_event", code }, 422);
  }

  const hash = payloadHash(rawBody);
  try {
    const previousWebhook = await beginWebhook(event, hash);
    if (["processed", "ignored", "illegal", "duplicate"].includes(String(previousWebhook?.status ?? ""))) {
      return json({ received: true, result: "duplicate" });
    }

    const root = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
    // Hotmart keeps webhook history for 60 days and lets the owner reprocess a
    // failed delivery. Event-id and transaction constraints remain the replay
    // protection, while this window permits legitimate recovery.
    if (!isFreshHotmartEvent(root.creation_date, Date.now(), HOTMART_REDELIVERY_WINDOW_MS)
      && previousWebhook?.status !== "failed") {
      await setWebhookStatus(event.eventId, { status: "ignored", processed_at: new Date().toISOString(), last_error_code: "stale_event" });
      return json({ received: true, result: "stale_event" });
    }

    if (state.mode === "observe") {
      await setWebhookStatus(event.eventId, { status: "ignored", processed_at: new Date().toISOString(), last_error_code: "observe_only" });
      return json({ received: true, mode: "observe", result: "not_applied" });
    }

    const { user, created } = await ensureUser(event);
    if (!user) {
      await setWebhookStatus(event.eventId, { status: "ignored", processed_at: new Date().toISOString(), last_error_code: "user_not_found" });
      return json({ received: true, result: "ignored" });
    }

    const admin = createSupabaseAdminClient();
    const { data: existingSubscription } = await admin.from("subscriptions").select("status,current_period_end,access_until")
      .eq("user_id", user.id).maybeSingle();
    const accessUntil = event.membershipStatus === "cancelled" && !event.accessUntil
      ? existingSubscription?.access_until ?? existingSubscription?.current_period_end ?? event.occurredAt
      : event.accessUntil;

    const { data, error } = await admin.rpc("apply_hotmart_event", {
      p_event_id: event.eventId,
      p_event_type: event.eventType,
      p_payload_hash: hash,
      p_user_id: user.id,
      p_email: event.email,
      p_display_name: event.name,
      p_product_id: event.productId,
      p_offer_id: event.offerId,
      p_plan_id: event.planId,
      p_billing_cycle: event.billingCycle,
      p_transaction_id: event.transactionId,
      p_economic_kind: event.economicKind,
      p_amount_minor: event.economicKind === "refund" || event.economicKind === "chargeback" ? event.expectedAmountMinor : event.amountMinor,
      p_currency: event.currency,
      p_payment_status: event.paymentStatus,
      p_membership_status: event.membershipStatus,
      p_occurred_at: event.occurredAt,
      p_subscriber_code: event.subscriberCode,
      p_hotmart_subscription_id: event.hotmartSubscriptionId,
      p_trial_ends_at: event.trialEndsAt,
      p_current_period_end: event.currentPeriodEnd,
      p_access_until: accessUntil,
      p_grace_ends_at: event.graceEndsAt,
      p_cancel_at_period_end: event.cancelAtPeriodEnd,
      p_source: event.source,
      p_anon_id: event.anonymousId,
    });
    if (error) throw error;

    const decision = String((data as { status?: string } | null)?.status ?? "applied");
    if (decision === "illegal_transition" || decision === "stale_transition") {
      await setWebhookStatus(event.eventId, { status: "illegal", processed_at: new Date().toISOString(), last_error_code: decision });
      return json({ received: true, result: decision });
    }

    const retryingWelcome = previousWebhook?.last_error_code === "welcome_email_failed";
    const shouldSendWelcome = ACCESS_STATES.has(event.membershipStatus)
      && (created || !existingSubscription || retryingWelcome);
    if (shouldSendWelcome) {
      try {
        await sendAccessEmail(event.email, request);
      } catch {
        await setWebhookStatus(event.eventId, { status: "failed", last_error_code: "welcome_email_failed" });
        return json({ error: "processing_failed" }, 500);
      }
    }

    await setWebhookStatus(event.eventId, { status: "processed", processed_at: new Date().toISOString(), last_error_code: null });
    return json({ received: true, result: "applied" });
  } catch (error) {
    console.error("Hotmart webhook processing failed", { code: error instanceof Error ? error.name : "unknown" });
    try {
      await setWebhookStatus(event.eventId, { status: "failed", last_error_code: "processing_failed" });
    } catch {
      // The original failure remains authoritative; Hotmart receives 500 and retries.
    }
    return json({ error: "processing_failed" }, 500);
  }
}
