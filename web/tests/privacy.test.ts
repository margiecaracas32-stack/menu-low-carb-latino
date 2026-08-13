import assert from "node:assert/strict";
import test from "node:test";
import { DELETE_CONFIRMATION, hashPrivacySubject, isSameOrigin, PRIVACY_POLICY_VERSION } from "../lib/privacy.ts";

test("privacy audit hashes are stable and do not expose the subject", () => {
  const subject = "2fdd7de8-6535-4daa-a41f-daf4b35f0877";
  const hash = hashPrivacySubject(subject);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash, hashPrivacySubject(subject));
  assert.equal(hash.includes(subject), false);
});

test("destructive confirmation is explicit and policy is versioned", () => {
  assert.equal(DELETE_CONFIRMATION, "ELIMINAR MI CUENTA");
  assert.match(PRIVACY_POLICY_VERSION, /^\d{4}-\d{2}-\d{2}$/);
});

test("same-origin protection rejects a foreign browser origin", () => {
  assert.equal(isSameOrigin(new Request("https://menu.example/api/privacy/delete", { headers: { origin: "https://menu.example" } })), true);
  assert.equal(isSameOrigin(new Request("https://menu.example/api/privacy/delete", { headers: { origin: "https://attacker.example" } })), false);
});
