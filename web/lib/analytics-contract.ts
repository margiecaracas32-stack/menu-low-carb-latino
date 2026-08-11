export const ANALYTICS_EVENTS = [
  "landing_vista",
  "onboarding_iniciado",
  "onboarding_paso_completado",
  "onboarding_completado",
  "onboarding_abandonado",
  "resultado_visto",
  "paywall_renderizado",
  "paywall_visto",
  "paywall_plan_elegido",
  "checkout_iniciado",
  "checkout_regresado",
  "app_abierta",
  "aha_alcanzado",
  "sesion_iniciada",
  "menu_semanal_generado",
  "receta_vista",
  "cena_completada",
  "cena_sustituida",
  "compra_completada",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
export type ServerAnalyticsEvent = "trial_iniciado" | "primer_cobro_confirmado";
export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

const EVENT_SET = new Set<string>(ANALYTICS_EVENTS);
const PLAN_VALUES = new Set(["unknown", "free", "trial", "pro", "cancelled"]);
const PLAN_CHOICE_VALUES = new Set(["annual", "monthly"]);
const SIMPLE_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;

export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return typeof value === "string" && EVENT_SET.has(value);
}

function integer(value: unknown, min: number, max: number) {
  return Number.isInteger(value) && Number(value) >= min && Number(value) <= max ? Number(value) : undefined;
}

function enumValue(value: unknown, allowed: Set<string>) {
  return typeof value === "string" && allowed.has(value) ? value : undefined;
}

function simpleId(value: unknown) {
  return typeof value === "string" && SIMPLE_ID.test(value) ? value : undefined;
}

export function sanitizeAnalyticsProperties(event: AnalyticsEvent, input: unknown) {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const clean: Record<string, string | number | boolean> = {};
  const plan = enumValue(source.plan, PLAN_VALUES);
  if (plan) clean.plan = plan;

  if (event === "onboarding_paso_completado") {
    const paso = integer(source.paso, 1, 3);
    const total = integer(source.total_pasos, 3, 3);
    const duration = integer(source.duracion_ms, 0, 600_000);
    if (paso) clean.paso = paso;
    if (total) clean.total_pasos = total;
    if (duration !== undefined) clean.duracion_ms = duration;
  }
  if (event === "onboarding_completado") {
    const skipped = integer(source.pasos_saltados, 0, 3);
    if (skipped !== undefined) clean.pasos_saltados = skipped;
  }
  if (event === "onboarding_abandonado") {
    const step = integer(source.paso, 1, 5);
    if (step) clean.paso = step;
  }
  if (event === "resultado_visto") {
    const recipes = integer(source.recetas_mostradas, 1, 7);
    const products = integer(source.productos_compra, 0, 500);
    if (recipes) clean.recetas_mostradas = recipes;
    if (products !== undefined) clean.productos_compra = products;
  }
  if (["paywall_visto", "paywall_plan_elegido", "checkout_iniciado", "checkout_regresado"].includes(event)) {
    const choice = enumValue(source.plan_elegido, PLAN_CHOICE_VALUES);
    if (choice) clean.plan_elegido = choice;
  }
  if (event === "aha_alcanzado") {
    const seconds = integer(source.tiempo_a_aha_seg, 0, 604_800);
    if (seconds !== undefined) clean.tiempo_a_aha_seg = seconds;
  }
  if (event === "sesion_iniciada") {
    const days = integer(source.dias_desde_alta, 0, 3650);
    if (days !== undefined) clean.dias_desde_alta = days;
  }
  if (event === "menu_semanal_generado") {
    const household = integer(source.personas, 1, 5);
    const minutes = integer(source.tiempo_max, 20, 45);
    const count = integer(source.recetas, 7, 7);
    if (household) clean.personas = household;
    if (minutes && [20, 30, 45].includes(minutes)) clean.tiempo_max = minutes;
    if (count) clean.recetas = count;
  }
  if (["receta_vista", "cena_completada"].includes(event)) {
    const recipeId = simpleId(source.recipe_id);
    if (recipeId) clean.recipe_id = recipeId;
  }
  if (event === "cena_sustituida") {
    const previous = simpleId(source.receta_anterior);
    const next = simpleId(source.receta_nueva);
    if (previous) clean.receta_anterior = previous;
    if (next) clean.receta_nueva = next;
  }
  if (event === "compra_completada") {
    const count = integer(source.productos, 1, 500);
    if (count) clean.productos = count;
  }
  return clean;
}

export const AUTHENTICATED_EVENTS = new Set<AnalyticsEvent>([
  "app_abierta",
  "aha_alcanzado",
  "sesion_iniciada",
  "menu_semanal_generado",
  "receta_vista",
  "cena_completada",
  "cena_sustituida",
  "compra_completada",
]);
