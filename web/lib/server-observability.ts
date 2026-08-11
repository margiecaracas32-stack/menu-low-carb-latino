import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "./supabase/admin";
import {
  isAnalyticsEvent,
  sanitizeAnalyticsProperties,
  type AnalyticsEvent,
  type ServerAnalyticsEvent,
} from "./analytics-contract";

type EventInput = {
  event: AnalyticsEvent | ServerAnalyticsEvent;
  userId?: string | null;
  sessionId?: string | null;
  source?: string | null;
  isQa?: boolean;
  properties?: unknown;
  idempotencyKey: string;
};

function eventKey(identity: string, event: string, key: string) {
  return createHash("sha256").update(`${identity}:${event}:${key}`).digest("hex");
}

export async function recordProductEvent(input: EventInput) {
  const identity = input.userId ?? input.sessionId;
  if (!identity) return { error: new Error("event_identity_missing") };
  const admin = createSupabaseAdminClient();
  return admin.from("event_log").upsert({
    user_id: input.userId ?? null,
    anonymous_session_id: input.sessionId ?? null,
    type: input.event,
    metadata: isAnalyticsEvent(input.event) ? sanitizeAnalyticsProperties(input.event, input.properties) : {},
    source: input.source ?? "directo",
    is_qa: input.isQa ?? false,
    event_key: eventKey(identity, input.event, input.idempotencyKey),
  }, { onConflict: "event_key", ignoreDuplicates: true });
}

export async function recordProductError(input: {
  userId: string;
  message: string;
  context: string;
  route: string;
  severity?: "warning" | "error" | "fatal";
}) {
  const fingerprint = createHash("sha256")
    .update(`${input.context}:${input.route}:${input.message}`)
    .digest("hex");
  const admin = createSupabaseAdminClient();
  return admin.from("error_log").insert({
    user_id: input.userId,
    fingerprint,
    message: input.message.slice(0, 1000),
    context: input.context.slice(0, 160),
    route: input.route.slice(0, 200),
    severity: input.severity ?? "error",
  });
}
