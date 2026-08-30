import assert from "node:assert/strict";
import test from "node:test";
import { derivePersonalizedPlan, RECIPES, validateAnswers } from "../app/app/recipe-catalog.ts";

const fixedDate = new Date("2026-08-11T12:00:00-04:00");

test("el catálogo vendible contiene sesenta recetas únicas y completas", () => {
  assert.equal(RECIPES.length, 60);
  assert.equal(new Set(RECIPES.map((recipe) => recipe.id)).size, 60);
  for (const recipe of RECIPES) {
    assert.ok(recipe.title.length >= 8);
    assert.ok(recipe.description.length >= 20);
    assert.ok(recipe.ingredients.length >= 4);
    assert.ok(recipe.steps.length >= 3);
    assert.ok(recipe.steps.every((step) => step.length >= 70), `${recipe.id} conserva una instrucción demasiado breve`);
    assert.ok(recipe.steps.every((step) => /\b\d+\s*(?:a\s*\d+\s*)?minutos?\b/i.test(step)), `${recipe.id} tiene un paso sin tiempo orientativo`);
    assert.ok(recipe.shopping.length >= 4);
  }
});

test("la receta señalada explica el sofrito y el punto del huevo", () => {
  const recipe = RECIPES.find((entry) => entry.id === "huevos-tomate");
  assert.ok(recipe);
  assert.match(recipe.steps[0], /5 minutos/);
  assert.match(recipe.steps[0], /pimiento esté suave/);
  assert.match(recipe.steps[2], /claras estén firmes/);
});

test("las cantidades usan medidas culinarias reales y no unidades genéricas", () => {
  for (const recipe of RECIPES) {
    assert.ok(recipe.ingredients.every((ingredient) => /^\d+(?:[.,]\d+)?\s/.test(ingredient)), `${recipe.id} conserva un ingrediente sin cantidad`);
    assert.equal(recipe.ingredients.some((ingredient) => /\bunidad(?:es)? de\b/i.test(ingredient)), false, `${recipe.id} muestra una unidad genérica`);
  }

  const recipesWithOlives = RECIPES.filter((recipe) => recipe.shopping.some((item) => item.key === "aceitunas"));
  assert.equal(recipesWithOlives.length, 3);
  for (const recipe of recipesWithOlives) assert.ok(recipe.ingredients.includes("80 g de aceitunas"));

  const eggs = RECIPES.find((recipe) => recipe.id === "huevos-tomate");
  assert.ok(eggs?.ingredients.includes("1 lata de tomate triturado"));
  const soup = RECIPES.find((recipe) => recipe.id === "sopa-pollo");
  assert.ok(soup?.ingredients.includes("4 tallos de apio"));
  assert.ok(soup?.ingredients.includes("15 g de cilantro"));
});

test("cada combinación crítica conserva variedad suficiente", () => {
  const limits = [20, 30, 45];
  const exclusions = [[], ["dairy"], ["egg"], ["shellfish"], ["dairy", "egg", "shellfish"]];
  for (const limit of limits) {
    for (const excluded of exclusions) {
      const compatible = RECIPES.filter((recipe) => recipe.minutes <= limit && !recipe.allergens.some((allergen) => excluded.includes(allergen)));
      assert.ok(compatible.length >= 12, `${limit} minutos y ${excluded.join(",")} solo dejó ${compatible.length} recetas`);
    }
  }
});

test("rechaza respuestas manipuladas", () => {
  assert.equal(validateAnswers({ people: "50 personas", avoids: ["Ninguno"], time: "Hasta 30 min" }), null);
  assert.equal(validateAnswers({ people: "4 personas", avoids: ["Ninguno", "Huevo"], time: "Hasta 30 min" }), null);
  assert.equal(validateAnswers({ people: "4 personas", avoids: ["Gluten"], time: "Hasta 30 min" }), null);
});

test("crea siete cenas dentro del tiempo y sin alérgenos excluidos", () => {
  const plan = derivePersonalizedPlan({ people: "3 personas", avoids: ["Lácteos", "Huevo"], time: "Hasta 20 min" }, fixedDate);
  assert.equal(plan.week.length, 7);
  assert.equal(plan.householdSize, 3);
  assert.equal(plan.availableMinutes, 20);
  for (const meal of plan.week) {
    const recipe = RECIPES.find((entry) => entry.id === meal.recipeId);
    assert.ok(recipe);
    assert.ok(recipe.minutes <= 20);
    assert.equal(recipe.allergens.includes("dairy"), false);
    assert.equal(recipe.allergens.includes("egg"), false);
    assert.equal(meal.servings, 3);
  }
});

test("escala y agrupa la compra según el hogar", () => {
  const one = derivePersonalizedPlan({ people: "1 persona", avoids: ["Ninguno"], time: "Hasta 30 min" }, fixedDate);
  const five = derivePersonalizedPlan({ people: "5 o más", avoids: ["Ninguno"], time: "Hasta 30 min" }, fixedDate);
  assert.ok(one.shoppingItems.length > 0);
  assert.equal(new Set(one.shoppingItems.map((item) => item.id)).size, one.shoppingItems.length);
  assert.equal(five.householdSize, 5);
  const oneChicken = one.shoppingItems.find((item) => item.id === "pollo");
  const fiveChicken = five.shoppingItems.find((item) => item.id === "pollo");
  if (oneChicken && fiveChicken) assert.notEqual(oneChicken.amount, fiveChicken.amount);
});

test("la misma entrada produce el mismo plan", () => {
  const answers = { people: "4 personas", avoids: ["Mariscos"], time: "Hasta 45 min" };
  assert.deepEqual(derivePersonalizedPlan(answers, fixedDate), derivePersonalizedPlan(answers, fixedDate));
});
