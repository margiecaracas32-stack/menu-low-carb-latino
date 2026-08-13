import assert from "node:assert/strict";
import test from "node:test";
import { safeAuthDestination } from "../lib/auth-destination.ts";

test("keeps only known app and admin destinations", () => {
  assert.equal(safeAuthDestination("/admin?section=errors"), "/admin?section=errors");
  assert.equal(safeAuthDestination("/app?tab=recipes"), "/app?tab=recipes");
  assert.equal(safeAuthDestination("/admin?section=unknown"), "/app");
});

test("rejects external and protocol-relative redirects", () => {
  assert.equal(safeAuthDestination("https://example.com"), "/app");
  assert.equal(safeAuthDestination("//example.com/admin"), "/app");
  assert.equal(safeAuthDestination(null), "/app");
});
