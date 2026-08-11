"use client";

import type { AnalyticsEvent, AnalyticsProperties } from "./analytics-contract";

const SESSION_KEY = "menu-analytics-session-v1";
const ATTRIBUTION_KEY = "menu-analytics-attribution-v1";
const QA_KEY = "menu-analytics-qa-v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ATTRIBUTION_TIMEOUT_MS = 30 * 24 * 60 * 60 * 1000;

type CommercialSession = { id: string; lastSeenAt: number };
type Attribution = { first: string; last: string; capturedAt: number };

function safeStorage(storage: Storage, key: string) {
  try { return storage.getItem(key); } catch { return null; }
}

function writeStorage(storage: Storage, key: string, value: string) {
  try { storage.setItem(key, value); } catch { /* Metrics must never block the product. */ }
}

function normalizedSource(value: string | null) {
  if (!value) return null;
  const clean = value.trim().toLowerCase().replace(/[^a-z0-9:_-]/g, "-").slice(0, 80);
  return clean || null;
}

function sourceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const explicit = normalizedSource(params.get("src") ?? params.get("utm_source"));
  if (explicit) return explicit;
  if (params.has("fbclid")) return "meta";
  if (params.has("ttclid")) return "tiktok";
  if (params.has("gclid")) return "google";
  if (params.has("msclkid")) return "microsoft";
  try {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    return referrer && referrer.host !== window.location.host ? normalizedSource(referrer.host) : null;
  } catch { return null; }
}

function getAttribution() {
  const now = Date.now();
  const incoming = sourceFromUrl();
  let existing: Attribution | null = null;
  try { existing = JSON.parse(safeStorage(window.localStorage, ATTRIBUTION_KEY) ?? "null"); } catch { existing = null; }
  if (!existing || now - existing.capturedAt > ATTRIBUTION_TIMEOUT_MS) existing = null;
  const next: Attribution = existing
    ? { ...existing, last: incoming ?? existing.last }
    : { first: incoming ?? "directo", last: incoming ?? "directo", capturedAt: now };
  writeStorage(window.localStorage, ATTRIBUTION_KEY, JSON.stringify(next));
  return next;
}

function getSession() {
  const now = Date.now();
  let session: CommercialSession | null = null;
  try { session = JSON.parse(safeStorage(window.localStorage, SESSION_KEY) ?? "null"); } catch { session = null; }
  if (!session || typeof session.id !== "string" || now - Number(session.lastSeenAt) > SESSION_TIMEOUT_MS) {
    session = { id: crypto.randomUUID(), lastSeenAt: now };
  } else session.lastSeenAt = now;
  writeStorage(window.localStorage, SESSION_KEY, JSON.stringify(session));
  return session;
}

function isQaSession() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("qa") === "1") writeStorage(window.sessionStorage, QA_KEY, "1");
  if (params.get("qa") === "0") {
    try { window.sessionStorage.removeItem(QA_KEY); } catch { /* no-op */ }
  }
  return safeStorage(window.sessionStorage, QA_KEY) === "1";
}

export function currentAnalyticsSource() {
  if (typeof window === "undefined") return "directo";
  return getAttribution().last;
}

export function isAnalyticsQaSession() {
  return typeof window !== "undefined" && isQaSession();
}

export function track(event: AnalyticsEvent, properties: AnalyticsProperties = {}, eventKey?: string) {
  if (typeof window === "undefined" || process.env.NODE_ENV === "development") return;
  const session = getSession();
  const attribution = getAttribution();
  const payload = {
    event,
    eventId: crypto.randomUUID(),
    eventKey,
    sessionId: session.id,
    source: attribution.last,
    firstSource: attribution.first,
    isQa: isQaSession(),
    properties,
  };
  void fetch("/api/events", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => undefined);
}

export function trackOnce(event: AnalyticsEvent, key: string, properties: AnalyticsProperties = {}) {
  if (typeof window === "undefined") return;
  const storageKey = `menu-analytics-once:${key}`;
  if (safeStorage(window.localStorage, storageKey)) return;
  writeStorage(window.localStorage, storageKey, "1");
  track(event, properties, key);
}

export function trackDaily(userId: string, daysSinceSignup: number, plan: string) {
  const today = new Date().toISOString().slice(0, 10);
  trackOnce("sesion_iniciada", `daily:${userId}:${today}`, { plan, dias_desde_alta: daysSinceSignup });
}

export function reportProductError(error: Error, context: string, route: string) {
  if (typeof window === "undefined" || process.env.NODE_ENV === "development") return;
  void fetch("/api/errors", {
    method: "POST",
    credentials: "same-origin",
    keepalive: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: error.message.slice(0, 500), context, route }),
  }).catch(() => undefined);
}
