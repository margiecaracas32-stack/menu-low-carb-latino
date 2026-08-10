import crypto from "node:crypto";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENCY = /^[A-Z]{3}$/;

export const HOTMART_EVENTS = new Set([
  "PURCHASE_APPROVED",
  "PURCHASE_COMPLETE",
  "PURCHASE_REFUNDED",
  "PURCHASE_CHARGEBACK",
  "PURCHASE_DELAYED",
  "PURCHASE_EXPIRED",
  "PURCHASE_CANCELED",
  "SUBSCRIPTION_CANCELLATION",
]);

export type BillingCycle = "monthly" | "annual";
export type MembershipStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired"
  | "refunded"
  | "chargeback";

export type HotmartCatalog = {
  productId: string;
  monthlyPlanId: string;
  annualPlanId: string;
};

export type NormalizedHotmartEvent = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  productId: string;
  planId: string;
  offerId: string | null;
  billingCycle: BillingCycle;
  expectedAmountMinor: number;
  amountMinor: number;
  currency: string;
  transactionId: string;
  economicKind: "sale" | "refund" | "chargeback" | null;
  paymentStatus: "trialing" | "paid" | "cancelled" | "refunded" | "chargeback" | "past_due" | "failed";
  membershipStatus: MembershipStatus;
  email: string;
  name: string;
  subscriberCode: string | null;
  hotmartSubscriptionId: string | null;
  source: string | null;
  anonymousId: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  accessUntil: string | null;
  graceEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
};

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : "";
}

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function minorUnits(value: unknown): number | null {
  const parsed = finiteNumber(value);
  if (parsed == null || parsed < 0) return null;
  return Math.round((parsed + Number.EPSILON) * 100);
}

function isoFromMs(value: unknown): string | null {
  const parsed = finiteNumber(value);
  if (parsed == null || parsed <= 0) return null;
  const date = new Date(parsed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function addPeriod(iso: string, cycle: BillingCycle) {
  const date = new Date(iso);
  if (cycle === "annual") date.setUTCFullYear(date.getUTCFullYear() + 1);
  else date.setUTCMonth(date.getUTCMonth() + 1);
  return date.toISOString();
}

function addDays(iso: string, days: number) {
  return new Date(new Date(iso).getTime() + days * 86_400_000).toISOString();
}

export function verifyHotmartToken(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedDigest = crypto.createHash("sha256").update(received, "utf8").digest();
  const expectedDigest = crypto.createHash("sha256").update(expected, "utf8").digest();
  return crypto.timingSafeEqual(receivedDigest, expectedDigest);
}

export function payloadHash(rawBody: string) {
  return crypto.createHash("sha256").update(rawBody, "utf8").digest("hex");
}

export function isFreshHotmartEvent(creationDate: unknown, now = Date.now(), maxAgeMs = 15 * 60_000) {
  const timestamp = finiteNumber(creationDate);
  if (timestamp == null) return false;
  const age = now - timestamp;
  return age >= -60_000 && age <= maxAgeMs;
}

export function parseHotmartEvent(payload: unknown, catalog: HotmartCatalog): NormalizedHotmartEvent {
  const root = record(payload);
  const data = record(root.data);
  const purchase = record(data.purchase);
  const subscription = record(data.subscription);
  const buyer = record(data.buyer);
  const subscriber = Object.keys(record(data.subscriber)).length ? record(data.subscriber) : record(subscription.subscriber);
  const product = Object.keys(record(data.product)).length ? record(data.product) : record(subscription.product);
  const plan = record(subscription.plan);
  const offer = record(purchase.offer);
  const originalPrice = record(purchase.original_offer_price);
  const chargedPrice = record(purchase.price);

  const eventType = text(root.event).toUpperCase();
  const eventId = text(root.id) || text(root.event_id);
  const creationDate = finiteNumber(root.creation_date);
  const occurredAt = creationDate == null ? "" : new Date(creationDate).toISOString();
  const productId = text(product.id);
  const planId = text(plan.id);
  const email = (text(buyer.email) || text(subscriber.email)).toLowerCase();
  const name = text(buyer.name) || text(subscriber.name);
  const transaction = text(purchase.transaction);
  const hotmartSubscriptionId = text(subscription.id) || null;
  const subscriberCode = text(subscriber.code) || null;

  if (!eventId || !eventType || !HOTMART_EVENTS.has(eventType)) throw new Error("unsupported_event");
  if (text(root.version) !== "2.0.0") throw new Error("unsupported_version");
  if (!occurredAt || !productId || !planId) throw new Error("missing_identity");
  if (!EMAIL.test(email) || email.length > 320) throw new Error("invalid_buyer");
  if (productId !== catalog.productId) throw new Error("product_not_allowed");

  let billingCycle: BillingCycle;
  let expectedAmountMinor: number;
  if (planId === catalog.monthlyPlanId) {
    billingCycle = "monthly";
    expectedAmountMinor = 699;
  } else if (planId === catalog.annualPlanId) {
    billingCycle = "annual";
    expectedAmountMinor = 6990;
  } else {
    throw new Error("plan_not_allowed");
  }

  const originalAmount = minorUnits(originalPrice.value);
  const directChargedAmount = minorUnits(chargedPrice.value) ?? minorUnits(data.actual_recurrence_value);
  const chargedAmount = directChargedAmount ?? originalAmount ?? 0;
  const originalCurrency = text(originalPrice.currency_value).toUpperCase();
  const currency = (text(chargedPrice.currency_value) || originalCurrency).toUpperCase();
  const purchaseStatus = text(purchase.status).toUpperCase();
  const subscriptionStatus = text(subscription.status).toUpperCase();
  const trial = eventType === "PURCHASE_APPROVED"
    && (directChargedAmount === 0 || purchaseStatus === "STARTED" || subscriptionStatus === "STARTED");
  const economicEvent = ["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK"].includes(eventType);
  if (economicEvent && trial) {
    if (originalAmount != null && originalAmount !== 0 && originalAmount !== expectedAmountMinor) {
      throw new Error("amount_not_allowed");
    }
    if (currency && currency !== "USD") throw new Error("currency_not_allowed");
  } else if (economicEvent) {
    if (originalAmount !== expectedAmountMinor) throw new Error("amount_not_allowed");
    if (originalCurrency !== "USD") throw new Error("currency_not_allowed");
  }
  if (!CURRENCY.test(currency || "USD")) throw new Error("invalid_currency");

  let membershipStatus: MembershipStatus;
  if (trial) membershipStatus = "trialing";
  else if (eventType === "PURCHASE_APPROVED" || eventType === "PURCHASE_COMPLETE") membershipStatus = "active";
  else if (eventType === "PURCHASE_DELAYED" || eventType === "PURCHASE_CANCELED") membershipStatus = "past_due";
  else if (eventType === "SUBSCRIPTION_CANCELLATION") membershipStatus = "cancelled";
  else if (eventType === "PURCHASE_EXPIRED") membershipStatus = "expired";
  else if (eventType === "PURCHASE_REFUNDED") membershipStatus = "refunded";
  else membershipStatus = "chargeback";

  const nextCharge = isoFromMs(purchase.date_next_charge) || isoFromMs(data.date_next_charge);
  const defaultPeriodEnd = addPeriod(occurredAt, billingCycle);
  const immediateEnd = occurredAt;
  const accessPeriodEnd = nextCharge || defaultPeriodEnd;
  const trialEndsAt = membershipStatus === "trialing" ? nextCharge || addDays(occurredAt, 7) : null;
  const currentPeriodEnd = ["active", "cancelled"].includes(membershipStatus) ? accessPeriodEnd : null;
  const accessUntil = membershipStatus === "cancelled"
    ? accessPeriodEnd
    : ["expired", "refunded", "chargeback"].includes(membershipStatus) ? immediateEnd : null;
  const graceEndsAt = membershipStatus === "past_due" ? addDays(occurredAt, 5) : null;

  const economicKind = trial ? null
    : eventType === "PURCHASE_APPROVED" || eventType === "PURCHASE_COMPLETE" ? "sale"
    : eventType === "PURCHASE_REFUNDED" ? "refund"
    : eventType === "PURCHASE_CHARGEBACK" ? "chargeback" : null;
  const paymentStatus = membershipStatus === "active" ? "paid"
    : membershipStatus === "expired" ? "failed" : membershipStatus;
  const transactionId = transaction || (hotmartSubscriptionId ? `subscription:${hotmartSubscriptionId}:${eventType}` : eventId);
  const origin = record(purchase.origin);

  return {
    eventId,
    eventType,
    occurredAt,
    productId,
    planId,
    offerId: text(offer.code) || null,
    billingCycle,
    expectedAmountMinor,
    amountMinor: economicKind === "sale" ? chargedAmount : 0,
    currency: currency || "USD",
    transactionId,
    economicKind,
    paymentStatus,
    membershipStatus,
    email,
    name,
    subscriberCode,
    hotmartSubscriptionId,
    source: text(origin.src).slice(0, 160) || null,
    anonymousId: text(origin.sck).slice(0, 120) || null,
    trialEndsAt,
    currentPeriodEnd,
    accessUntil,
    graceEndsAt,
    cancelAtPeriodEnd: membershipStatus === "cancelled",
  };
}
