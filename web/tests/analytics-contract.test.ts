import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTHENTICATED_EVENTS,
  isAnalyticsEvent,
  sanitizeAnalyticsProperties,
} from "../lib/analytics-contract.ts";

test("solo acepta el catálogo de eventos aprobado", () => {
  assert.equal(isAnalyticsEvent("landing_vista"), true);
  assert.equal(isAnalyticsEvent("onboarding_paso_completado"), true);
  assert.equal(isAnalyticsEvent("email_del_usuario"), false);
  assert.equal(isAnalyticsEvent("evento_inventado"), false);
});

test("elimina información personal y campos desconocidos", () => {
  assert.deepEqual(sanitizeAnalyticsProperties("receta_vista", {
    recipe_id: "pollo-limon",
    email: "persona@example.com",
    nombre: "Persona",
    contenido: "dato libre",
  }), { recipe_id: "pollo-limon" });
});

test("valida pasos y límites antes de guardar", () => {
  assert.deepEqual(sanitizeAnalyticsProperties("onboarding_paso_completado", {
    paso: 2,
    total_pasos: 3,
    duracion_ms: 12_000,
  }), { paso: 2, total_pasos: 3, duracion_ms: 12_000 });

  assert.deepEqual(sanitizeAnalyticsProperties("onboarding_paso_completado", {
    paso: 8,
    total_pasos: 9,
    duracion_ms: -1,
  }), {});
});

test("protege las acciones internas detrás de una sesión autenticada", () => {
  assert.equal(AUTHENTICATED_EVENTS.has("app_abierta"), true);
  assert.equal(AUTHENTICATED_EVENTS.has("cena_completada"), true);
  assert.equal(AUTHENTICATED_EVENTS.has("landing_vista"), false);
  assert.equal(AUTHENTICATED_EVENTS.has("checkout_iniciado"), false);
});
