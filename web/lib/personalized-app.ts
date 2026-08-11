import type { SupabaseClient } from "@supabase/supabase-js";
import type { Aisle, ShoppingItem, WeekMeal } from "../app/app/recipe-catalog";
import { derivePersonalizedPlan, type OnboardingAnswers } from "../app/app/recipe-catalog";

export type PersonalizedAppData = {
  householdSize: number;
  availableMinutes: number;
  avoids: string[];
  week: WeekMeal[];
  shoppingItems: ShoppingItem[];
};

export async function loadPersonalizedAppData(supabase: SupabaseClient, userId: string): Promise<PersonalizedAppData | null> {
  const today = new Date().toISOString().slice(0, 10);
  const oldestActive = new Date(`${today}T12:00:00Z`);
  oldestActive.setUTCDate(oldestActive.getUTCDate() - 6);
  const oldestActiveDate = oldestActive.toISOString().slice(0, 10);
  const [{ data: household }, { data: preferences }, { data: plan }] = await Promise.all([
    supabase.from("households").select("size, available_minutes").eq("user_id", userId).maybeSingle(),
    supabase.from("dietary_preferences").select("value").eq("user_id", userId).eq("kind", "avoid"),
    supabase.from("weekly_plans").select("id, week_start").eq("user_id", userId).gte("week_start", oldestActiveDate).lte("week_start", today).order("week_start", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (!household || !plan) return null;

  const [{ data: meals }, { data: list }] = await Promise.all([
    supabase.from("plan_meals").select("meal_date, recipe_key, servings").eq("plan_id", plan.id).order("meal_date"),
    supabase.from("shopping_lists").select("id").eq("plan_id", plan.id).maybeSingle(),
  ]);
  if (!meals || meals.length !== 7 || !list) return null;
  const { data: items } = await supabase.from("shopping_items").select("id, label, amount, aisle, checked").eq("list_id", list.id).order("position");
  if (!items) return null;

  return {
    householdSize: household.size,
    availableMinutes: household.available_minutes ?? 30,
    avoids: (preferences ?? []).map((entry) => entry.value),
    week: meals.map((meal) => ({ date: meal.meal_date, recipeId: meal.recipe_key, servings: meal.servings })),
    shoppingItems: items.map((item) => ({ id: item.id, label: item.label, amount: item.amount ?? "", aisle: item.aisle as Aisle, checked: item.checked })),
  };
}

export async function savePersonalizedAppData(supabase: SupabaseClient, answers: OnboardingAnswers) {
  const plan = derivePersonalizedPlan(answers);
  return supabase.rpc("save_personalized_week", {
    p_household_size: plan.householdSize,
    p_available_minutes: plan.availableMinutes,
    p_avoids: plan.avoids,
    p_week_start: plan.week[0].date,
    p_meals: plan.week.map((meal) => ({ meal_date: meal.date, recipe_key: meal.recipeId, servings: meal.servings })),
    p_items: plan.shoppingItems.map((item, position) => ({ label: item.label, amount: item.amount, aisle: item.aisle, position })),
  });
}

export async function loadSavedAnswers(supabase: SupabaseClient, userId: string): Promise<OnboardingAnswers | null> {
  const [{ data: household }, { data: preferences }] = await Promise.all([
    supabase.from("households").select("size, available_minutes").eq("user_id", userId).maybeSingle(),
    supabase.from("dietary_preferences").select("value").eq("user_id", userId).eq("kind", "avoid"),
  ]);
  if (!household || ![20, 30, 45].includes(household.available_minutes)) return null;
  const people = household.size >= 5 ? "5 o más" : `${household.size} ${household.size === 1 ? "persona" : "personas"}`;
  const reverseAvoid: Record<string, string> = { dairy: "Lácteos", egg: "Huevo", nuts: "Frutos secos", shellfish: "Mariscos" };
  const avoids = (preferences ?? []).map((entry) => reverseAvoid[entry.value]).filter(Boolean);
  return { people, time: `Hasta ${household.available_minutes} min`, avoids: avoids.length ? avoids : ["Ninguno"] };
}
