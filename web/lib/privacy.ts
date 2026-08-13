import { createHash } from "node:crypto";

export const PRIVACY_POLICY_VERSION = "2026-08-11";
export const SERVICE_CONSENT_PURPOSE = "service";
export const DELETE_CONFIRMATION = "ELIMINAR MI CUENTA";

export function hashPrivacySubject(subjectId: string) {
  return createHash("sha256").update(subjectId).digest("hex");
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
