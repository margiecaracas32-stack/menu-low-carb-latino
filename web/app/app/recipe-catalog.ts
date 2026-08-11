export const PEOPLE_OPTIONS = ["1 persona", "2 personas", "3 personas", "4 personas", "5 o más"] as const;
export const TIME_OPTIONS = ["Hasta 20 min", "Hasta 30 min", "Hasta 45 min"] as const;
export const AVOID_OPTIONS = ["Ninguno", "Lácteos", "Huevo", "Frutos secos", "Mariscos"] as const;

export type AvoidKey = "dairy" | "egg" | "nuts" | "shellfish";
export type Aisle = "Vegetales" | "Proteínas" | "Despensa";
export type OnboardingAnswers = { people: string; avoids: string[]; time: string };

type ShoppingIngredient = {
  key: string;
  label: string;
  quantity: number;
  unit: "g" | "ml" | "unidad";
  aisle: Aisle;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  servings: number;
  tags: string[];
  allergens: AvoidKey[];
  ingredients: string[];
  shopping: ShoppingIngredient[];
  steps: string[];
};

export type WeekMeal = { date: string; recipeId: string; servings: number };
export type ShoppingItem = { id: string; label: string; amount: string; aisle: Aisle; checked?: boolean };
export type PersonalizedPlan = {
  householdSize: number;
  availableMinutes: number;
  avoids: AvoidKey[];
  week: WeekMeal[];
  shoppingItems: ShoppingItem[];
};

const s = (key: string, label: string, quantity: number, unit: ShoppingIngredient["unit"], aisle: Aisle): ShoppingIngredient => ({ key, label, quantity, unit, aisle });

export const RECIPES: Recipe[] = [
  { id: "pollo-calabacin", title: "Pollo guisado con calabacín", description: "Una cena familiar, sabrosa y sencilla con ingredientes de cualquier mercado.", minutes: 25, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["680 g de pollo", "3 calabacines", "1 cebolla", "2 dientes de ajo", "Orégano y pimienta"], shopping: [s("pollo", "Pollo", 680, "g", "Proteínas"), s("calabacin", "Calabacín", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], steps: ["Dora el pollo con ajo y cebolla.", "Agrega el calabacín en trozos y sazona.", "Cocina tapado 10 minutos y sirve."] },
  { id: "pollo-limon", title: "Pollo al limón con calabacín", description: "Tiras de pollo doradas con limón y vegetales, listas en una sola sartén.", minutes: 18, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["650 g de pollo", "2 calabacines", "2 limones", "1 cebolla", "Ajo"], shopping: [s("pollo", "Pollo", 650, "g", "Proteínas"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], steps: ["Dora el pollo en tiras.", "Añade cebolla y calabacín.", "Termina con limón y ajo."] },
  { id: "carne-pimientos", title: "Carne salteada con pimientos", description: "Carne tierna y pimientos con sazón criolla para una noche corta.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["600 g de carne en tiras", "3 pimientos", "1 cebolla", "Comino"], shopping: [s("carne-tiras", "Carne en tiras", 600, "g", "Proteínas"), s("pimiento", "Pimientos", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], steps: ["Sella la carne a fuego alto.", "Agrega pimientos y cebolla.", "Sazona y saltea hasta que estén tiernos."] },
  { id: "chuletas-aguacate", title: "Chuletas con ensalada de aguacate", description: "Cerdo dorado con una ensalada fresca que no necesita cocción.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["4 chuletas", "2 aguacates", "2 tomates", "1 limón"], shopping: [s("chuleta", "Chuletas de cerdo", 4, "unidad", "Proteínas"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], steps: ["Sazona y dora las chuletas.", "Corta aguacate y tomate.", "Aliña la ensalada con limón."] },
  { id: "pavo-repollo", title: "Pavo criollo con repollo", description: "Pavo molido con repollo tierno y sofrito latino.", minutes: 19, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["600 g de pavo molido", "1 repollo pequeño", "1 pimiento", "Sofrito"], shopping: [s("pavo", "Pavo molido", 600, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales")], steps: ["Cocina el pavo con sofrito.", "Añade el repollo en tiras.", "Tapa 8 minutos y ajusta la sazón."] },
  { id: "atun-aguacate", title: "Ensalada tibia de atún y aguacate", description: "Una cena fresca con atún, aguacate y vegetales comunes.", minutes: 15, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["4 latas de atún", "2 aguacates", "2 tomates", "1 pepino", "2 limones"], shopping: [s("atun", "Atún en lata", 4, "unidad", "Despensa"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("pepino", "Pepino", 1, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales")], steps: ["Escurre el atún.", "Corta los vegetales.", "Mezcla y aliña con limón."] },
  { id: "cerdo-brocoli", title: "Cerdo rápido con brócoli", description: "Lomo de cerdo salteado con brócoli y ajo, sin salsas pesadas.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["650 g de lomo de cerdo", "2 brócolis", "3 dientes de ajo", "1 limón"], shopping: [s("cerdo", "Lomo de cerdo", 650, "g", "Proteínas"), s("brocoli", "Brócoli", 2, "unidad", "Vegetales"), s("ajo", "Ajo", 3, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], steps: ["Dora el cerdo en tiras.", "Agrega brócoli y ajo.", "Tapa 5 minutos y termina con limón."] },
  { id: "pollo-aguacate", title: "Pollo con ensalada criolla", description: "Pollo a la plancha con tomate, pepino y aguacate.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["650 g de pollo", "2 tomates", "1 pepino", "2 aguacates"], shopping: [s("pollo", "Pollo", 650, "g", "Proteínas"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("pepino", "Pepino", 1, "unidad", "Vegetales"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales")], steps: ["Cocina el pollo a la plancha.", "Corta los vegetales.", "Sirve todo con el aliño de tu casa."] },
  { id: "ropa-vieja", title: "Ropa vieja con pimientos", description: "Carne desmechada con sabor criollo y vegetales, sin acompañamientos pesados.", minutes: 35, servings: 4, tags: ["Familia"], allergens: [], ingredients: ["700 g de falda cocida", "2 pimientos", "1 cebolla", "Tomate triturado", "Comino"], shopping: [s("falda", "Carne para desmechar", 700, "g", "Proteínas"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa")], steps: ["Sofríe cebolla y pimientos.", "Añade la carne y el tomate.", "Cocina 15 minutos a fuego bajo."] },
  { id: "pescado-coco", title: "Pescado al coco con ensalada", description: "Filetes suaves en salsa de coco ligera con ensalada fresca de repollo.", minutes: 30, servings: 4, tags: ["Familia"], allergens: [], ingredients: ["4 filetes de pescado", "200 ml de leche de coco", "1 repollo pequeño", "2 limones", "Cilantro"], shopping: [s("pescado", "Filetes de pescado", 4, "unidad", "Proteínas"), s("leche-coco", "Leche de coco", 200, "ml", "Despensa"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales")], steps: ["Sazona y sella el pescado.", "Añade leche de coco y cocina 8 minutos.", "Sirve con el repollo aliñado."] },
  { id: "picadillo-coliflor", title: "Picadillo criollo con coliflor", description: "El picadillo de siempre acompañado por arroz de coliflor bien sazonado.", minutes: 28, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["600 g de carne molida", "1 coliflor", "1 pimiento", "Aceitunas", "Culantro"], shopping: [s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("coliflor", "Coliflor", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("aceitunas", "Aceitunas", 1, "unidad", "Despensa")], steps: ["Cocina la carne con el sofrito.", "Procesa y saltea la coliflor.", "Ajusta la sazón y sirve junto."] },
  { id: "pernil-repollo", title: "Pernil rápido con repollo", description: "Cerdo dorado con especias latinas y repollo tibio al limón.", minutes: 32, servings: 4, tags: ["Familia"], allergens: [], ingredients: ["700 g de lomo de cerdo", "1 repollo", "1 naranja agria", "Ajo", "Orégano"], shopping: [s("cerdo", "Lomo de cerdo", 700, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("naranja", "Naranja agria", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 3, "unidad", "Vegetales")], steps: ["Marina el cerdo con ajo y cítrico.", "Dora por ambos lados y termina tapado.", "Saltea el repollo con los jugos."] },
  { id: "tortilla-espinaca", title: "Tortilla de espinaca y queso", description: "Una cena rápida de sartén para los días en que queda poca energía.", minutes: 18, servings: 4, tags: ["Rápida", "Vegetariana"], allergens: ["dairy", "egg"], ingredients: ["8 huevos", "250 g de espinaca", "150 g de queso", "1 cebolla", "Pimienta"], shopping: [s("huevo", "Huevos", 8, "unidad", "Proteínas"), s("espinaca", "Espinaca", 250, "g", "Vegetales"), s("queso", "Queso", 150, "g", "Proteínas"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], steps: ["Saltea cebolla y espinaca.", "Añade los huevos batidos y el queso.", "Cocina tapado hasta cuajar."] },
  { id: "albondigas-criollas", title: "Albóndigas en salsa criolla", description: "Albóndigas jugosas con tomate y hierbas, pensadas para toda la familia.", minutes: 38, servings: 4, tags: ["Familia"], allergens: ["egg"], ingredients: ["650 g de carne molida", "Tomate triturado", "1 huevo", "Cilantro", "Ajo"], shopping: [s("carne-molida", "Carne molida", 650, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("huevo", "Huevos", 1, "unidad", "Proteínas"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], steps: ["Forma las albóndigas y dóralas.", "Prepara la salsa criolla.", "Cocina todo junto 18 minutos."] },
];

const avoidMap: Record<string, AvoidKey> = { "Lácteos": "dairy", Huevo: "egg", "Frutos secos": "nuts", Mariscos: "shellfish" };

export function validateAnswers(value: unknown): OnboardingAnswers | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (!PEOPLE_OPTIONS.includes(raw.people as typeof PEOPLE_OPTIONS[number])) return null;
  if (!TIME_OPTIONS.includes(raw.time as typeof TIME_OPTIONS[number])) return null;
  if (!Array.isArray(raw.avoids) || raw.avoids.length < 1 || raw.avoids.length > 4) return null;
  if (!raw.avoids.every((item) => typeof item === "string" && AVOID_OPTIONS.includes(item as typeof AVOID_OPTIONS[number]))) return null;
  if (raw.avoids.includes("Ninguno") && raw.avoids.length !== 1) return null;
  return { people: raw.people as string, time: raw.time as string, avoids: [...new Set(raw.avoids as string[])] };
}

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatAmount(quantity: number, unit: ShoppingIngredient["unit"]) {
  const rounded = unit === "unidad" ? Math.ceil(quantity) : Math.ceil(quantity / 10) * 10;
  return unit === "unidad" ? `${rounded} ${rounded === 1 ? "unidad" : "unidades"}` : `${rounded} ${unit}`;
}

export function derivePersonalizedPlan(answers: OnboardingAnswers, today = new Date()): PersonalizedPlan {
  const valid = validateAnswers(answers);
  if (!valid) throw new Error("invalid_answers");
  const householdSize = valid.people === "5 o más" ? 5 : Number(valid.people.split(" ")[0]);
  const availableMinutes = Number(valid.time.match(/\d+/)?.[0]);
  const avoids = valid.avoids.filter((value) => value !== "Ninguno").map((value) => avoidMap[value]);
  const eligible = RECIPES.filter((recipe) => recipe.minutes <= availableMinutes && !recipe.allergens.some((allergen) => avoids.includes(allergen)));
  if (eligible.length < 7) throw new Error("insufficient_compatible_recipes");

  const seed = `${isoDate(today)}:${householdSize}:${availableMinutes}:${avoids.slice().sort().join(",")}`;
  const offset = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % eligible.length;
  const selected = [...eligible.slice(offset), ...eligible.slice(0, offset)].slice(0, 7);
  const week = selected.map((recipe, index) => {
    const date = new Date(today);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return { date: isoDate(date), recipeId: recipe.id, servings: householdSize };
  });

  const scale = householdSize / 4;
  const grouped = new Map<string, ShoppingIngredient>();
  selected.flatMap((recipe) => recipe.shopping).forEach((item) => {
    const current = grouped.get(item.key);
    grouped.set(item.key, current ? { ...current, quantity: current.quantity + item.quantity * scale } : { ...item, quantity: item.quantity * scale });
  });
  const aisleOrder: Aisle[] = ["Vegetales", "Proteínas", "Despensa"];
  const shoppingItems = [...grouped.values()]
    .sort((a, b) => aisleOrder.indexOf(a.aisle) - aisleOrder.indexOf(b.aisle) || a.label.localeCompare(b.label, "es"))
    .map((item) => ({ id: item.key, label: item.label, amount: formatAmount(item.quantity, item.unit), aisle: item.aisle }));

  return { householdSize, availableMinutes, avoids, week, shoppingItems };
}

export function buildDemoPlan(today = new Date()) {
  return derivePersonalizedPlan({ people: "4 personas", avoids: ["Ninguno"], time: "Hasta 30 min" }, today);
}

