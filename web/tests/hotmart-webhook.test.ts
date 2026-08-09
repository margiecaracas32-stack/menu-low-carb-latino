import assert from "node:assert/strict";
import test from "node:test";
import { isFreshHotmartEvent, parseHotmartEvent, verifyHotmartToken } from "../lib/hotmart-webhook.ts";

const now = Date.now();
const catalog = { productId: "9001", monthlyPlanId: "101", annualPlanId: "102" };

function purchase(overrides: Record<string, unknown> = {}) {
  return {
    id: "evt-1",
    creation_date: now,
    event: "PURCHASE_APPROVED",
    version: "2.0.0",
    data: {
      product: { id: 9001 },
      buyer: { email: "buyer@example.com", name: "Buyer" },
      purchase: {
        transaction: "HP123",
        status: "APPROVED",
        price: { value: 6.99, currency_value: "USD" },
        original_offer_price: { value: 6.99, currency_value: "USD" },
        date_next_charge: now + 30 * 86_400_000,
        offer: { code: "offer-monthly" },
      },
      subscription: {
        id: 501,
        status: "ACTIVE",
        plan: { id: 101, name: "Plan mensual" },
        subscriber: { code: "SUB1" },
      },
      ...overrides,
    },
  };
}

test("compares HOTTOK without accepting missing or altered tokens", () => {
  assert.equal(verifyHotmartToken("secret-value", "secret-value"), true);
  assert.equal(verifyHotmartToken("secret-valuE", "secret-value"), false);
  assert.equal(verifyHotmartToken(null, "secret-value"), false);
});

test("normalizes an approved monthly charge", () => {
  const event = parseHotmartEvent(purchase(), catalog);
  assert.equal(event.membershipStatus, "active");
  assert.equal(event.economicKind, "sale");
  assert.equal(event.amountMinor, 699);
  assert.equal(event.billingCycle, "monthly");
});

test("keeps a zero-value trial separate from the first paid charge", () => {
  const payload = purchase();
  payload.data.purchase.price.value = 0;
  payload.data.purchase.status = "STARTED";
  payload.data.subscription.status = "STARTED";
  const event = parseHotmartEvent(payload, catalog);
  assert.equal(event.membershipStatus, "trialing");
  assert.equal(event.economicKind, null);
  assert.equal(event.trialEndsAt != null, true);
});

test("recognizes the annual plan without turning its full charge into monthly revenue", () => {
  const payload = purchase();
  payload.data.subscription.plan.id = 102;
  payload.data.purchase.price.value = 69.9;
  payload.data.purchase.original_offer_price.value = 69.9;
  const event = parseHotmartEvent(payload, catalog);
  assert.equal(event.billingCycle, "annual");
  assert.equal(event.amountMinor, 6990);
});

test("preserves paid access until the next charge after subscription cancellation", () => {
  const payload = {
    id: "evt-cancel",
    creation_date: now,
    event: "SUBSCRIPTION_CANCELLATION",
    version: "2.0.0",
    data: {
      date_next_charge: now + 20 * 86_400_000,
      product: { id: 9001 },
      subscriber: { email: "buyer@example.com", name: "Buyer", code: "SUB1" },
      subscription: { id: 501, plan: { id: 101, name: "Plan mensual" } },
    },
  };
  const event = parseHotmartEvent(payload, catalog);
  assert.equal(event.membershipStatus, "cancelled");
  assert.equal(event.cancelAtPeriodEnd, true);
  assert.equal(event.accessUntil, new Date(now + 20 * 86_400_000).toISOString());
});

test("maps refunds to an economic reversal and immediate access removal", () => {
  const payload = purchase();
  payload.id = "evt-refund";
  payload.event = "PURCHASE_REFUNDED";
  const event = parseHotmartEvent(payload, catalog);
  assert.equal(event.membershipStatus, "refunded");
  assert.equal(event.economicKind, "refund");
  assert.equal(event.accessUntil, new Date(now).toISOString());
});

test("rejects products, plans, prices and currencies outside the server catalog", () => {
  const wrongProduct = purchase();
  wrongProduct.data.product.id = 9999;
  assert.throws(() => parseHotmartEvent(wrongProduct, catalog), /product_not_allowed/);

  const wrongPlan = purchase();
  wrongPlan.data.subscription.plan.id = 999;
  assert.throws(() => parseHotmartEvent(wrongPlan, catalog), /plan_not_allowed/);

  const wrongPrice = purchase();
  wrongPrice.data.purchase.original_offer_price.value = 1;
  assert.throws(() => parseHotmartEvent(wrongPrice, catalog), /amount_not_allowed/);

  const wrongCurrency = purchase();
  wrongCurrency.data.purchase.original_offer_price.currency_value = "EUR";
  assert.throws(() => parseHotmartEvent(wrongCurrency, catalog), /currency_not_allowed/);
});

test("requires fresh, timestamped events", () => {
  assert.equal(isFreshHotmartEvent(now, now), true);
  assert.equal(isFreshHotmartEvent(now - 16 * 60_000, now), false);
  assert.equal(isFreshHotmartEvent(undefined, now), false);
});
