const ADMIN_DESTINATION = /^\/admin(?:\?section=(profit|sales|users|errors|ai))?$/;
const APP_DESTINATION = /^\/app(?:\?tab=(today|week|shopping|recipes))?$/;

export function safeAuthDestination(value: string | null | undefined) {
  if (value && (ADMIN_DESTINATION.test(value) || APP_DESTINATION.test(value))) return value;
  return "/app";
}
