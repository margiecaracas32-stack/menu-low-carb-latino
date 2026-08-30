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
  unit: "g" | "ml" | "unidad" | "lata" | "diente" | "tallo" | "cabeza" | "filete" | "chuleta";
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

const SEMANTIC_MEASURES: Partial<Record<string, Pick<ShoppingIngredient, "quantity" | "unit">>> = {
  aceitunas: { quantity: 80, unit: "g" },
  ajo: { quantity: 1, unit: "diente" },
  apio: { quantity: 1, unit: "tallo" },
  atun: { quantity: 1, unit: "lata" },
  bacalao: { quantity: 1, unit: "filete" },
  chuleta: { quantity: 1, unit: "chuleta" },
  lechuga: { quantity: 1, unit: "cabeza" },
  pescado: { quantity: 1, unit: "filete" },
  salmon: { quantity: 1, unit: "filete" },
  "tomate-lata": { quantity: 1, unit: "lata" },
};

const NATURAL_UNITS: Record<Exclude<ShoppingIngredient["unit"], "g" | "ml" | "unidad">, [string, string]> = {
  lata: ["lata", "latas"],
  diente: ["diente", "dientes"],
  tallo: ["tallo", "tallos"],
  cabeza: ["cabeza", "cabezas"],
  filete: ["filete", "filetes"],
  chuleta: ["chuleta", "chuletas"],
};

const UNIT_NOUNS: Record<string, [string, string]> = {
  aguacate: ["aguacate", "aguacates"],
  berenjena: ["berenjena", "berenjenas"],
  brocoli: ["brócoli", "brócolis"],
  calabacin: ["calabacín", "calabacines"],
  cebolla: ["cebolla", "cebollas"],
  champinon: ["champiñón grande", "champiñones grandes"],
  chayote: ["chayote", "chayotes"],
  coliflor: ["coliflor", "coliflores"],
  huevo: ["huevo", "huevos"],
  limon: ["limón", "limones"],
  naranja: ["naranja", "naranjas"],
  pepino: ["pepino", "pepinos"],
  pimiento: ["pimiento", "pimientos"],
  repollo: ["repollo", "repollos"],
  tomate: ["tomate", "tomates"],
};

const s = (key: string, label: string, quantity: number, unit: ShoppingIngredient["unit"], aisle: Aisle): ShoppingIngredient => {
  const measure = SEMANTIC_MEASURES[key];
  return {
    key,
    label,
    quantity: measure ? measure.quantity * quantity : quantity,
    unit: measure?.unit ?? unit,
    aisle,
  };
};

function quantityLabel(quantity: number, unit: ShoppingIngredient["unit"]) {
  if (unit === "g" || unit === "ml") return `${quantity} ${unit}`;
  if (unit === "unidad") return `${quantity} ${quantity === 1 ? "unidad" : "unidades"}`;
  const words = NATURAL_UNITS[unit];
  return `${quantity} ${quantity === 1 ? words[0] : words[1]}`;
}

function formatRecipeIngredient(item: ShoppingIngredient) {
  if (item.unit === "g" || item.unit === "ml") return `${item.quantity} ${item.unit} de ${item.label.toLowerCase()}`;
  if (item.unit === "unidad") {
    const words = UNIT_NOUNS[item.key];
    return words ? `${item.quantity} ${item.quantity === 1 ? words[0] : words[1]}` : `${item.quantity} ${item.label.toLowerCase()}`;
  }
  if (item.unit === "diente") return `${quantityLabel(item.quantity, item.unit)} de ajo`;
  if (item.unit === "tallo") return `${quantityLabel(item.quantity, item.unit)} de apio`;
  if (item.unit === "cabeza") return `${item.quantity} ${item.quantity === 1 ? "lechuga" : "lechugas"}`;
  if (item.unit === "chuleta") return `${quantityLabel(item.quantity, item.unit)} de cerdo`;
  if (item.unit === "lata") return `${quantityLabel(item.quantity, item.unit)} de ${item.label.replace(/ en lata$/i, "").toLowerCase()}`;
  return `${quantityLabel(item.quantity, item.unit)} de ${item.label.replace(/^Filetes de /i, "").toLowerCase()}`;
}

const CORE_RECIPES: Recipe[] = [
  { id: "pollo-calabacin", title: "Pollo guisado con calabacín", description: "Una cena familiar, sabrosa y sencilla con ingredientes de cualquier mercado.", minutes: 25, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["680 g de pollo", "3 calabacines", "1 cebolla", "2 dientes de ajo", "1 cucharadita de orégano", "0.5 cucharadita de pimienta"], shopping: [s("pollo", "Pollo", 680, "g", "Proteínas"), s("calabacin", "Calabacín", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], steps: ["Dora el pollo con ajo y cebolla.", "Agrega el calabacín en trozos y sazona.", "Cocina tapado 10 minutos y sirve."] },
  { id: "pollo-limon", title: "Pollo al limón con calabacín", description: "Tiras de pollo doradas con limón y vegetales, listas en una sola sartén.", minutes: 18, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["650 g de pollo", "2 calabacines", "2 limones", "1 cebolla", "2 dientes de ajo"], shopping: [s("pollo", "Pollo", 650, "g", "Proteínas"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], steps: ["Dora el pollo en tiras.", "Añade cebolla y calabacín.", "Termina con limón y ajo."] },
  { id: "carne-pimientos", title: "Carne salteada con pimientos", description: "Carne tierna y pimientos con sazón criolla para una noche corta.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["600 g de carne en tiras", "3 pimientos", "1 cebolla", "2 dientes de ajo"], shopping: [s("carne-tiras", "Carne en tiras", 600, "g", "Proteínas"), s("pimiento", "Pimientos", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], steps: ["Sella la carne a fuego alto.", "Agrega pimientos y cebolla.", "Sazona con ajo y saltea hasta que estén tiernos."] },
  { id: "chuletas-aguacate", title: "Chuletas con ensalada de aguacate", description: "Cerdo dorado con una ensalada fresca que no necesita cocción.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["4 chuletas", "2 aguacates", "2 tomates", "1 limón"], shopping: [s("chuleta", "Chuletas de cerdo", 4, "unidad", "Proteínas"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], steps: ["Sazona y dora las chuletas.", "Corta aguacate y tomate.", "Aliña la ensalada con limón."] },
  { id: "pavo-repollo", title: "Pavo criollo con repollo", description: "Pavo molido con repollo tierno y sofrito latino.", minutes: 19, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["600 g de pavo molido", "1 repollo pequeño", "1 pimiento", "1 cebolla"], shopping: [s("pavo", "Pavo molido", 600, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], steps: ["Cocina el pavo con cebolla y pimiento.", "Añade el repollo en tiras.", "Tapa 8 minutos y ajusta la sazón."] },
  { id: "atun-aguacate", title: "Ensalada tibia de atún y aguacate", description: "Una cena fresca con atún, aguacate y vegetales comunes.", minutes: 15, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["4 latas de atún", "2 aguacates", "2 tomates", "1 pepino", "2 limones"], shopping: [s("atun", "Atún en lata", 4, "unidad", "Despensa"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("pepino", "Pepino", 1, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales")], steps: ["Escurre el atún.", "Corta los vegetales.", "Mezcla y aliña con limón."] },
  { id: "cerdo-brocoli", title: "Cerdo rápido con brócoli", description: "Lomo de cerdo salteado con brócoli y ajo, sin salsas pesadas.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["650 g de lomo de cerdo", "2 brócolis", "3 dientes de ajo", "1 limón"], shopping: [s("cerdo", "Lomo de cerdo", 650, "g", "Proteínas"), s("brocoli", "Brócoli", 2, "unidad", "Vegetales"), s("ajo", "Ajo", 3, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], steps: ["Dora el cerdo en tiras.", "Agrega brócoli y ajo.", "Tapa 5 minutos y termina con limón."] },
  { id: "pollo-aguacate", title: "Pollo con ensalada criolla", description: "Pollo a la plancha con tomate, pepino y aguacate.", minutes: 20, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["650 g de pollo", "2 tomates", "1 pepino", "2 aguacates"], shopping: [s("pollo", "Pollo", 650, "g", "Proteínas"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("pepino", "Pepino", 1, "unidad", "Vegetales"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales")], steps: ["Cocina el pollo a la plancha.", "Corta los vegetales.", "Sirve todo con el aliño de tu casa."] },
  { id: "ropa-vieja", title: "Ropa vieja con pimientos", description: "Carne desmechada con sabor criollo y vegetales, sin acompañamientos pesados.", minutes: 35, servings: 4, tags: ["Familia"], allergens: [], ingredients: ["700 g de falda cocida", "2 pimientos", "1 cebolla", "1 lata (400 g) de tomate triturado", "1 cucharadita de comino"], shopping: [s("falda", "Carne para desmechar", 700, "g", "Proteínas"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa")], steps: ["Sofríe cebolla y pimientos.", "Añade la carne y el tomate.", "Cocina 15 minutos a fuego bajo."] },
  { id: "pescado-coco", title: "Pescado al coco con ensalada", description: "Filetes suaves en salsa de coco ligera con ensalada fresca de repollo.", minutes: 30, servings: 4, tags: ["Familia"], allergens: [], ingredients: ["4 filetes de pescado", "200 ml de leche de coco", "1 repollo pequeño", "2 limones", "15 g de cilantro"], shopping: [s("pescado", "Filetes de pescado", 4, "unidad", "Proteínas"), s("leche-coco", "Leche de coco", 200, "ml", "Despensa"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], steps: ["Sazona y sella el pescado.", "Añade leche de coco y cocina 8 minutos.", "Sirve con el repollo aliñado."] },
  { id: "picadillo-coliflor", title: "Picadillo criollo con coliflor", description: "El picadillo de siempre acompañado por arroz de coliflor bien sazonado.", minutes: 28, servings: 4, tags: ["Rápida", "Familia"], allergens: [], ingredients: ["600 g de carne molida", "1 coliflor", "1 pimiento", "80 g de aceitunas", "15 g de cilantro"], shopping: [s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("coliflor", "Coliflor", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("aceitunas", "Aceitunas", 1, "unidad", "Despensa"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], steps: ["Cocina la carne con el sofrito.", "Procesa y saltea la coliflor.", "Ajusta la sazón y sirve junto."] },
  { id: "pernil-repollo", title: "Pernil rápido con repollo", description: "Cerdo dorado con especias latinas y repollo tibio al limón.", minutes: 32, servings: 4, tags: ["Familia"], allergens: [], ingredients: ["700 g de lomo de cerdo", "1 repollo", "1 naranja agria", "3 dientes de ajo", "1 cucharadita de orégano"], shopping: [s("cerdo", "Lomo de cerdo", 700, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("naranja", "Naranja agria", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 3, "unidad", "Vegetales")], steps: ["Marina el cerdo con ajo y cítrico.", "Dora por ambos lados y termina tapado.", "Saltea el repollo con los jugos."] },
  { id: "tortilla-espinaca", title: "Tortilla de espinaca y queso", description: "Una cena rápida de sartén para los días en que queda poca energía.", minutes: 18, servings: 4, tags: ["Rápida", "Vegetariana"], allergens: ["dairy", "egg"], ingredients: ["8 huevos", "250 g de espinaca", "150 g de queso", "1 cebolla", "0.5 cucharadita de pimienta"], shopping: [s("huevo", "Huevos", 8, "unidad", "Proteínas"), s("espinaca", "Espinaca", 250, "g", "Vegetales"), s("queso", "Queso", 150, "g", "Proteínas"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], steps: ["Saltea cebolla y espinaca.", "Añade los huevos batidos y el queso.", "Cocina tapado hasta cuajar."] },
  { id: "albondigas-criollas", title: "Albóndigas en salsa criolla", description: "Albóndigas jugosas con tomate y hierbas, pensadas para toda la familia.", minutes: 38, servings: 4, tags: ["Familia"], allergens: ["egg"], ingredients: ["650 g de carne molida", "1 lata (400 g) de tomate triturado", "1 huevo", "15 g de cilantro", "2 dientes de ajo"], shopping: [s("carne-molida", "Carne molida", 650, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("huevo", "Huevos", 1, "unidad", "Proteínas"), s("ajo", "Ajo", 2, "unidad", "Vegetales"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], steps: ["Forma las albóndigas y dóralas.", "Prepara la salsa criolla.", "Cocina todo junto 18 minutos."] },
];

function extraRecipe(id: string, title: string, description: string, minutes: number, tags: string[], shopping: ShoppingIngredient[], steps: string[], allergens: AvoidKey[] = []): Recipe {
  const ingredients = shopping.map(formatRecipeIngredient);
  return { id, title, description, minutes, servings: 4, tags, allergens, ingredients, shopping, steps };
}

const ADDITIONAL_RECIPES: Recipe[] = [
  extraRecipe("bistec-encebollado", "Bistec encebollado con ensalada", "Un clásico latino con cebolla dorada y ensalada fresca.", 25, ["Rápida", "Familia"], [s("bistec", "Bistec", 650, "g", "Proteínas"), s("cebolla", "Cebolla", 2, "unidad", "Vegetales"), s("lechuga", "Lechuga", 1, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales")], ["Sazona y sella los bistecs.", "Dora la cebolla en la misma sartén.", "Sirve con lechuga y tomate."]),
  extraRecipe("pollo-coco", "Pollo al coco con pimientos", "Pollo cremoso sin lácteos, con coco y pimientos de colores.", 30, ["Familia"], [s("pollo", "Pollo", 650, "g", "Proteínas"), s("leche-coco", "Leche de coco", 250, "ml", "Despensa"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Dora el pollo en trozos.", "Añade cebolla y pimientos.", "Vierte la leche de coco y cocina 10 minutos."]),
  extraRecipe("carne-calabacin", "Carne molida con calabacín", "Un salteado jugoso y sencillo que usa una sola sartén.", 22, ["Rápida", "Familia"], [s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("calabacin", "Calabacín", 3, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Dora la carne con ajo.", "Agrega tomate y calabacín.", "Cocina hasta que el calabacín esté tierno."]),
  extraRecipe("cerdo-citrico", "Cerdo cítrico con repollo", "Lomo de cerdo con limón y naranja, acompañado de repollo tibio.", 27, ["Rápida", "Familia"], [s("cerdo", "Lomo de cerdo", 650, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales"), s("naranja", "Naranja", 1, "unidad", "Vegetales")], ["Dora el cerdo en tiras.", "Saltea el repollo.", "Añade los cítricos y reduce los jugos."]),
  extraRecipe("fajitas-pollo", "Fajitas de pollo sin tortilla", "Todo el sabor de unas fajitas, servido sobre vegetales salteados.", 25, ["Rápida", "Familia"], [s("pollo", "Pollo", 650, "g", "Proteínas"), s("pimiento", "Pimientos", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales")], ["Corta pollo y vegetales en tiras.", "Saltea todo a fuego alto.", "Sirve con aguacate."]),
  extraRecipe("pavo-calabacin", "Pavo con calabacín al comino", "Pavo molido, vegetales y comino para una cena ligera y familiar.", 24, ["Rápida", "Familia"], [s("pavo", "Pavo molido", 600, "g", "Proteínas"), s("calabacin", "Calabacín", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales")], ["Sofríe cebolla y pavo.", "Añade calabacín y tomate.", "Sazona con comino y cocina 8 minutos."]),
  extraRecipe("carne-repollo", "Carne criolla con repollo", "Carne molida con sofrito y repollo, rendidora sin ser pesada.", 30, ["Familia"], [s("carne-molida", "Carne molida", 650, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa")], ["Prepara el sofrito con pimiento.", "Dora la carne.", "Añade repollo y tomate; cocina tapado."]),
  extraRecipe("pollo-calabaza", "Pollo guisado con calabaza", "Guiso casero de pollo y calabaza con especias latinas.", 35, ["Familia"], [s("pollo", "Pollo", 700, "g", "Proteínas"), s("calabaza", "Calabaza", 700, "g", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Dora el pollo con ajo y cebolla.", "Agrega la calabaza en cubos.", "Tapa y cocina hasta que esté suave."]),
  extraRecipe("salmon-ajo", "Salmón al ajo con espárragos", "Salmón dorado y espárragos al limón en menos de media hora.", 25, ["Rápida", "Familia"], [s("salmon", "Filetes de salmón", 4, "unidad", "Proteínas"), s("esparrago", "Espárragos", 500, "g", "Vegetales"), s("ajo", "Ajo", 3, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], ["Sazona el salmón.", "Dora salmón y espárragos.", "Termina con ajo y limón."]),
  extraRecipe("pescado-tomate", "Pescado en salsa de tomate", "Filetes de pescado en una salsa criolla sencilla y aromática.", 28, ["Rápida", "Familia"], [s("pescado", "Filetes de pescado", 4, "unidad", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Sofríe cebolla y pimiento.", "Añade el tomate.", "Cocina el pescado dentro de la salsa."]),
  extraRecipe("camarones-ajo", "Camarones al ajo con calabacín", "Camarones jugosos y calabacín dorado para una cena muy rápida.", 18, ["Rápida", "Familia"], [s("camaron", "Camarones", 650, "g", "Proteínas"), s("calabacin", "Calabacín", 3, "unidad", "Vegetales"), s("ajo", "Ajo", 4, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], ["Dora el calabacín.", "Añade camarones y ajo.", "Cocina hasta que cambien de color y agrega limón."], ["shellfish"]),
  extraRecipe("camarones-coco", "Camarones al coco con pimientos", "Camarones con leche de coco, pimientos y un toque de cilantro.", 25, ["Rápida", "Familia"], [s("camaron", "Camarones", 650, "g", "Proteínas"), s("leche-coco", "Leche de coco", 250, "ml", "Despensa"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], ["Saltea camarones y pimientos.", "Añade leche de coco.", "Reduce 6 minutos y termina con cilantro."], ["shellfish"]),
  extraRecipe("bacalao-pimientos", "Bacalao con pimientos asados", "Bacalao suave con pimientos, tomate y aceitunas.", 30, ["Familia"], [s("bacalao", "Filetes de bacalao", 4, "unidad", "Proteínas"), s("pimiento", "Pimientos", 3, "unidad", "Vegetales"), s("tomate", "Tomate", 3, "unidad", "Vegetales"), s("aceitunas", "Aceitunas", 1, "unidad", "Despensa")], ["Saltea pimientos y tomate.", "Coloca el bacalao encima.", "Tapa y cocina; termina con aceitunas."]),
  extraRecipe("tortitas-atun", "Tortitas de atún con ensalada", "Tortitas doradas de atún con una ensalada crujiente.", 25, ["Rápida", "Familia"], [s("atun", "Atún en lata", 4, "unidad", "Despensa"), s("huevo", "Huevos", 2, "unidad", "Proteínas"), s("lechuga", "Lechuga", 1, "unidad", "Vegetales"), s("pepino", "Pepino", 1, "unidad", "Vegetales")], ["Mezcla atún y huevo.", "Forma y dora las tortitas.", "Sirve con lechuga y pepino."], ["egg"]),
  extraRecipe("berenjena-carne", "Berenjena con carne criolla", "Berenjena tierna cubierta con carne molida y tomate.", 35, ["Familia"], [s("berenjena", "Berenjena", 3, "unidad", "Vegetales"), s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Dora las berenjenas.", "Cocina la carne con cebolla y tomate.", "Une todo y cocina 8 minutos."]),
  extraRecipe("pimientos-rellenos", "Pimientos rellenos de picadillo", "Pimientos al horno con picadillo criollo y vegetales.", 40, ["Familia"], [s("pimiento", "Pimientos", 4, "unidad", "Vegetales"), s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("coliflor", "Coliflor", 1, "unidad", "Vegetales")], ["Prepara el picadillo.", "Rellena los pimientos.", "Hornea hasta que estén tiernos."]),
  extraRecipe("lasana-calabacin", "Lasaña de calabacín y carne", "Capas de calabacín, carne y queso para una cena de horno.", 45, ["Familia"], [s("calabacin", "Calabacín", 4, "unidad", "Vegetales"), s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("queso", "Queso", 250, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa")], ["Corta el calabacín en láminas.", "Alterna con carne y tomate.", "Cubre con queso y hornea."], ["dairy"]),
  extraRecipe("pollo-coliflor", "Pollo con arroz de coliflor", "Pollo sazonado con coliflor salteada y vegetales.", 28, ["Rápida", "Familia"], [s("pollo", "Pollo", 650, "g", "Proteínas"), s("coliflor", "Coliflor", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Dora el pollo.", "Procesa la coliflor.", "Saltea coliflor, pimiento y cebolla."]),
  extraRecipe("cerdo-aguacate", "Cerdo con ensalada de aguacate", "Cerdo a la plancha con aguacate, tomate y limón.", 25, ["Rápida", "Familia"], [s("cerdo", "Lomo de cerdo", 650, "g", "Proteínas"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("limon", "Limón", 1, "unidad", "Vegetales")], ["Sazona y cocina el cerdo.", "Corta aguacate y tomate.", "Aliña con limón y sirve."]),
  extraRecipe("carne-brocoli", "Carne con brócoli al ajo", "Tiras de carne con brócoli crujiente y ajo.", 30, ["Familia"], [s("carne-tiras", "Carne en tiras", 650, "g", "Proteínas"), s("brocoli", "Brócoli", 2, "unidad", "Vegetales"), s("ajo", "Ajo", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Sella la carne.", "Añade brócoli, ajo y cebolla.", "Tapa 5 minutos y sirve."]),
  extraRecipe("pavo-coliflor", "Pavo con coliflor dorada", "Pavo molido con coliflor, pimiento y especias.", 25, ["Rápida", "Familia"], [s("pavo", "Pavo molido", 600, "g", "Proteínas"), s("coliflor", "Coliflor", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Dora el pavo con ajo.", "Añade coliflor y pimiento.", "Cocina hasta dorar los bordes."]),
  extraRecipe("pollo-espinaca", "Pollo rápido con espinaca", "Pollo salteado con espinaca, tomate y ajo.", 20, ["Rápida", "Familia"], [s("pollo", "Pollo", 650, "g", "Proteínas"), s("espinaca", "Espinaca", 300, "g", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Dora el pollo.", "Añade tomate y ajo.", "Incorpora la espinaca al final."]),
  extraRecipe("pollo-aceitunas", "Pollo criollo con aceitunas", "Pollo guisado con tomate, pimientos y aceitunas.", 30, ["Familia"], [s("pollo", "Pollo", 700, "g", "Proteínas"), s("aceitunas", "Aceitunas", 1, "unidad", "Despensa"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales")], ["Dora el pollo.", "Añade tomate y pimiento.", "Cocina tapado y termina con aceitunas."]),
  extraRecipe("cerdo-tomate", "Cerdo guisado con tomate", "Cerdo tierno en salsa de tomate con cebolla y orégano.", 35, ["Familia"], [s("cerdo", "Lomo de cerdo", 700, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Dora el cerdo.", "Añade ajo, cebolla y tomate.", "Cocina tapado hasta que esté tierno."]),
  extraRecipe("carne-tomate", "Carne guisada con tomate", "Carne en cubos con tomate, pimiento y comino.", 35, ["Familia"], [s("carne-cubos", "Carne en cubos", 700, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Sella la carne.", "Agrega cebolla, pimiento y tomate.", "Tapa y cocina hasta ablandar."]),
  extraRecipe("rollos-repollo", "Rollos de repollo con carne", "Hojas de repollo rellenas de carne y vegetales.", 45, ["Familia"], [s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales")], ["Suaviza las hojas de repollo.", "Rellena con carne y pimiento.", "Cocina los rollos en salsa de tomate."]),
  extraRecipe("albondigas-pavo", "Albóndigas de pavo al tomate", "Albóndigas ligeras de pavo en salsa de tomate casera.", 35, ["Familia"], [s("pavo", "Pavo molido", 650, "g", "Proteínas"), s("huevo", "Huevos", 1, "unidad", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Mezcla pavo, huevo y ajo.", "Forma y dora las albóndigas.", "Termina la cocción en tomate."], ["egg"]),
  extraRecipe("calabacines-rellenos", "Calabacines rellenos de pollo", "Calabacines al horno con pollo, tomate y queso.", 40, ["Familia"], [s("calabacin", "Calabacín", 4, "unidad", "Vegetales"), s("pollo", "Pollo", 600, "g", "Proteínas"), s("queso", "Queso", 180, "g", "Proteínas"), s("tomate", "Tomate", 2, "unidad", "Vegetales")], ["Vacía los calabacines.", "Rellena con pollo y tomate.", "Cubre con queso y hornea."], ["dairy"]),
  extraRecipe("revoltillo-vegetales", "Revoltillo de vegetales", "Huevos suaves con pimientos, espinaca y tomate.", 15, ["Rápida", "Vegetariana"], [s("huevo", "Huevos", 8, "unidad", "Proteínas"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("espinaca", "Espinaca", 250, "g", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales")], ["Saltea los vegetales.", "Añade los huevos batidos.", "Revuelve suavemente hasta cuajar."], ["egg"]),
  extraRecipe("huevos-tomate", "Huevos al tomate con aguacate", "Huevos cocidos en tomate especiado, servidos con aguacate.", 18, ["Rápida", "Vegetariana"], [s("huevo", "Huevos", 8, "unidad", "Proteínas"), s("tomate-lata", "Tomate triturado", 1, "unidad", "Despensa"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales")], ["Cocina tomate y pimiento.", "Abre los huevos sobre la salsa.", "Tapa hasta cuajar y sirve con aguacate."], ["egg"]),
  extraRecipe("coliflor-queso", "Coliflor gratinada con queso", "Coliflor cremosa al horno con queso dorado.", 30, ["Vegetariana", "Familia"], [s("coliflor", "Coliflor", 2, "unidad", "Vegetales"), s("queso", "Queso", 250, "g", "Proteínas"), s("crema", "Crema de leche", 200, "ml", "Proteínas"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Cuece la coliflor al dente.", "Mezcla con crema y ajo.", "Cubre con queso y gratina."], ["dairy"]),
  extraRecipe("espinaca-champinones", "Espinaca con champiñones cremosos", "Champiñones y espinaca en una salsa ligera de queso.", 20, ["Rápida", "Vegetariana"], [s("champinon", "Champiñones", 500, "g", "Vegetales"), s("espinaca", "Espinaca", 300, "g", "Vegetales"), s("queso-crema", "Queso crema", 180, "g", "Proteínas"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Dora champiñones y ajo.", "Añade la espinaca.", "Integra el queso crema y sirve."], ["dairy"]),
  extraRecipe("tofu-criollo", "Tofu criollo con pimientos", "Tofu dorado con sofrito, pimientos y calabacín.", 25, ["Rápida", "Vegetariana"], [s("tofu", "Tofu firme", 600, "g", "Proteínas"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Dora el tofu en cubos.", "Añade cebolla y pimientos.", "Incorpora calabacín y cocina 6 minutos."]),
  extraRecipe("champinones-rellenos", "Champiñones rellenos de espinaca", "Champiñones grandes con espinaca, ajo y queso.", 30, ["Vegetariana", "Familia"], [s("champinon", "Champiñones grandes", 12, "unidad", "Vegetales"), s("espinaca", "Espinaca", 250, "g", "Vegetales"), s("queso", "Queso", 180, "g", "Proteínas"), s("ajo", "Ajo", 2, "unidad", "Vegetales")], ["Retira los tallos.", "Mezcla espinaca, ajo y queso.", "Rellena y hornea hasta dorar."], ["dairy"]),
  extraRecipe("sopa-pollo", "Sopa de pollo y vegetales", "Caldo casero con pollo, calabacín, apio y cilantro.", 35, ["Familia"], [s("pollo", "Pollo", 700, "g", "Proteínas"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales"), s("apio", "Apio", 4, "unidad", "Vegetales"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], ["Hierve el pollo con apio.", "Añade calabacín.", "Desmenuza el pollo y termina con cilantro."]),
  extraRecipe("sopa-carne", "Sopa de carne con repollo", "Caldo sustancioso de carne, repollo y vegetales.", 40, ["Familia"], [s("carne-cubos", "Carne en cubos", 700, "g", "Proteínas"), s("repollo", "Repollo", 1, "unidad", "Vegetales"), s("apio", "Apio", 4, "unidad", "Vegetales"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales")], ["Cuece la carne hasta ablandar.", "Añade repollo y apio.", "Incorpora calabacín al final."]),
  extraRecipe("sopa-cerdo", "Sopa de cerdo con chayote", "Cerdo tierno con chayote, apio y cilantro.", 40, ["Familia"], [s("cerdo", "Lomo de cerdo", 700, "g", "Proteínas"), s("chayote", "Chayote", 3, "unidad", "Vegetales"), s("apio", "Apio", 4, "unidad", "Vegetales"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], ["Cuece el cerdo en agua sazonada.", "Añade chayote y apio.", "Termina con cilantro fresco."]),
  extraRecipe("sopa-pescado", "Sopa de pescado al cilantro", "Pescado suave en caldo de tomate, pimientos y cilantro.", 35, ["Familia"], [s("pescado", "Filetes de pescado", 4, "unidad", "Proteínas"), s("tomate", "Tomate", 3, "unidad", "Vegetales"), s("pimiento", "Pimientos", 1, "unidad", "Vegetales"), s("cilantro", "Cilantro", 15, "g", "Vegetales")], ["Prepara el caldo con tomate y pimiento.", "Añade el pescado en trozos.", "Cocina suavemente y termina con cilantro."]),
  extraRecipe("ensalada-pollo-aguacate", "Ensalada de pollo y aguacate", "Pollo cocido, aguacate y vegetales en una cena fresca.", 18, ["Rápida", "Familia"], [s("pollo", "Pollo cocido", 600, "g", "Proteínas"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales"), s("lechuga", "Lechuga", 1, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales")], ["Corta el pollo y los vegetales.", "Mezcla en un tazón.", "Aliña con limón, sal y pimienta."]),
  extraRecipe("tacos-pavo-lechuga", "Tacos de lechuga con pavo", "Pavo criollo servido en hojas crujientes de lechuga.", 20, ["Rápida", "Familia"], [s("pavo", "Pavo molido", 600, "g", "Proteínas"), s("lechuga", "Lechuga", 1, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales")], ["Cocina el pavo con especias.", "Separa las hojas de lechuga.", "Rellena y termina con tomate y aguacate."]),
  extraRecipe("tacos-carne-lechuga", "Tacos de lechuga con carne", "Carne sazonada con tomate y aguacate en hojas de lechuga.", 20, ["Rápida", "Familia"], [s("carne-molida", "Carne molida", 600, "g", "Proteínas"), s("lechuga", "Lechuga", 1, "unidad", "Vegetales"), s("tomate", "Tomate", 2, "unidad", "Vegetales"), s("aguacate", "Aguacate", 2, "unidad", "Vegetales")], ["Dora la carne con comino.", "Prepara las hojas de lechuga.", "Rellena con carne, tomate y aguacate."]),
  extraRecipe("rollitos-cerdo-lechuga", "Rollitos de lechuga con cerdo", "Cerdo salteado con pimientos dentro de hojas frescas.", 20, ["Rápida", "Familia"], [s("cerdo", "Lomo de cerdo", 600, "g", "Proteínas"), s("lechuga", "Lechuga", 1, "unidad", "Vegetales"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Saltea el cerdo en tiras.", "Añade pimiento y cebolla.", "Sirve dentro de hojas de lechuga."]),
  extraRecipe("brochetas-pollo", "Brochetas de pollo y vegetales", "Brochetas doradas de pollo, pimientos y calabacín.", 30, ["Familia"], [s("pollo", "Pollo", 650, "g", "Proteínas"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales")], ["Corta todo en cubos.", "Arma las brochetas.", "Cocina en sartén o parrilla hasta dorar."]),
  extraRecipe("brochetas-carne", "Brochetas de carne y pimientos", "Carne tierna con pimientos, cebolla y especias.", 30, ["Familia"], [s("carne-cubos", "Carne en cubos", 650, "g", "Proteínas"), s("pimiento", "Pimientos", 3, "unidad", "Vegetales"), s("cebolla", "Cebolla", 2, "unidad", "Vegetales"), s("calabacin", "Calabacín", 1, "unidad", "Vegetales")], ["Sazona la carne.", "Alterna carne y vegetales.", "Cocina las brochetas hasta el punto deseado."]),
  extraRecipe("brochetas-cerdo", "Brochetas de cerdo al limón", "Cerdo al limón con calabacín y cebolla dorada.", 30, ["Familia"], [s("cerdo", "Lomo de cerdo", 650, "g", "Proteínas"), s("calabacin", "Calabacín", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 2, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales")], ["Marina el cerdo con limón.", "Arma con calabacín y cebolla.", "Cocina hasta dorar."]),
  extraRecipe("brochetas-pescado", "Brochetas de pescado al mojo", "Pescado con pimientos y mojo de ajo y limón.", 25, ["Rápida", "Familia"], [s("pescado", "Filetes de pescado", 4, "unidad", "Proteínas"), s("pimiento", "Pimientos", 2, "unidad", "Vegetales"), s("cebolla", "Cebolla", 1, "unidad", "Vegetales"), s("limon", "Limón", 2, "unidad", "Vegetales")], ["Corta el pescado en cubos.", "Arma las brochetas con vegetales.", "Cocina y termina con ajo y limón."]),
];

const STEP_OVERRIDES: Partial<Record<string, string[]>> = {
  "huevos-tomate": [
    "Calienta una sartén a fuego medio. Añade el tomate y el pimiento, y cocina durante 5 minutos, removiendo cada minuto, hasta que el pimiento esté suave y el tomate forme una salsa espesa.",
    "Haz cuatro espacios en la salsa y abre dos huevos en cada zona. Cocina durante 1 minuto sin moverlos para que comiencen a fijarse.",
    "Tapa la sartén y cocina de 4 a 6 minutos, hasta que las claras estén firmes y las yemas queden a tu gusto. Apaga el fuego y sirve con el aguacate cortado.",
  ],
};

function finishSentence(value: string) {
  const clean = value.trim().replace(/\.+$/, "");
  return `${clean}.`;
}

function donenessCue(recipe: Recipe, step: string) {
  const direct = step.toLowerCase();
  const context = `${step} ${recipe.title}`.toLowerCase();
  if (/pollo|pavo/.test(direct)) return "hasta que la carne esté opaca y no quede rosada en el centro";
  if (/camar[oó]n/.test(direct)) return "hasta que los camarones estén rosados, opacos y curvados";
  if (/pescado|salm[oó]n|bacalao|at[uú]n/.test(direct)) return "hasta que el pescado esté opaco y se separe fácilmente con un tenedor";
  if (/huevo|tortilla|revoltillo/.test(direct)) return "hasta que el huevo esté cuajado y ya no se vea líquido";
  if (/cerdo|chuleta|pernil/.test(direct)) return "hasta que la carne esté dorada por fuera y cocida en el centro";
  if (/carne|bistec|alb[oó]ndiga|picadillo/.test(direct)) return "hasta que la carne esté dorada y no queden partes crudas";
  if (/calabac[ií]n|pimiento|cebolla|repollo|br[oó]coli|coliflor|berenjena|espinaca|calabaza|chayote|esp[aá]rrago|champi[nñ][oó]n/.test(direct)) return "hasta que los vegetales estén tiernos, pero conserven un poco de firmeza";
  if (/sopa|caldo/.test(context)) return "hasta que el caldo hierva suavemente y los ingredientes estén tiernos";
  if (/pollo|pavo/.test(context)) return "hasta que la carne esté opaca y no quede rosada en el centro";
  if (/pescado|salm[oó]n|bacalao/.test(context)) return "hasta que el pescado esté opaco y se separe fácilmente con un tenedor";
  if (/cerdo|chuleta|pernil/.test(context)) return "hasta que la carne esté dorada por fuera y cocida en el centro";
  if (/carne|bistec|alb[oó]ndiga|picadillo/.test(context)) return "hasta que la carne esté dorada y no queden partes crudas";
  return "hasta que los vegetales estén tiernos, pero conserven un poco de firmeza";
}

function clarifyStep(recipe: Recipe, step: string, index: number) {
  const base = finishSentence(step);
  const lower = base.toLowerCase();
  const suggested = [Math.max(4, Math.round(recipe.minutes * 0.2)), Math.max(5, Math.round(recipe.minutes * 0.3)), Math.max(5, Math.round(recipe.minutes * 0.35))][index] ?? 4;
  const alreadyHasTime = /\b\d+\s*(?:a\s*\d+\s*)?minutos?\b/i.test(base);
  const alreadyHasCue = /hasta que|cuando est[eé]|al dente|cambien de color|punto deseado|sin partes|no quede/i.test(base);

  if (alreadyHasTime) {
    return alreadyHasCue ? base : `${base} Comprueba la cocción: ${donenessCue(recipe, base)}.`;
  }

  if (/\b(hornea|gratina)\b/i.test(lower)) {
    const ovenMinutes = Math.max(12, Math.round(recipe.minutes * 0.4));
    return `${base} Mantén el horno a 200 °C durante unos ${ovenMinutes} minutos y revisa el punto sin abrir la puerta durante los primeros 10 minutos.`;
  }

  if (/\b(hierve|cuece)\b/i.test(lower)) {
    return `${base} Mantén un hervor suave durante ${suggested} minutos y retira la espuma si aparece.`;
  }

  if (/\b(dora|sella|saltea|sofr[ií]e|cocina|reduce|tapa)\b/i.test(lower)) {
    const heat = /fuego|horno|hierve/i.test(lower) ? "" : " a fuego medio";
    return `${base} Cocina${heat} durante ${suggested} minutos, volteando o removiendo cuando sea necesario, ${donenessCue(recipe, base)}.`;
  }

  if (/\b(añade|agrega|incorpora|vierte|coloca|cubre|une)\b/i.test(lower)) {
    return `${base} Cocina durante ${suggested} minutos, removiendo de vez en cuando, ${donenessCue(recipe, base)}.`;
  }

  if (/\b(prepara)\b/i.test(lower) && /caldo|salsa|picadillo|sofrito/.test(lower)) {
    return `${base} Cocina durante ${suggested} minutos, removiendo, hasta que tenga aroma y una textura uniforme.`;
  }

  if (/\b(corta|procesa)\b/i.test(lower)) {
    const raw = /ensalada|aguacate|pepino|lechuga/.test(`${recipe.title} ${lower}`);
    return raw ? `${base} Dedica unos 3 minutos y haz piezas de tamaño cómodo para comer.` : `${base} Dedica unos 3 minutos y haz trozos parejos para que se cocinen al mismo ritmo.`;
  }

  if (/\b(sazona|marina)\b/i.test(lower)) return `${base} Mezcla bien y deja reposar durante 4 minutos para que absorba el sabor.`;
  if (/\b(arma|rellena|vac[ií]a|alterna|forma)\b/i.test(lower)) return `${base} Dedica unos 4 minutos y procura que todas las porciones tengan un tamaño parecido.`;
  if (/\b(mezcla|escurre|suaviza|separa|retira)\b/i.test(lower)) return `${base} Hazlo durante 2 minutos y comprueba que todo quede uniforme antes de continuar.`;
  if (/\b(sirve|termina|aliña|ajusta)\b/i.test(lower)) return `${base} Deja reposar durante 2 minutos, prueba y ajusta la sazón antes de llevar a la mesa.`;
  return `${base} Dedica unos ${suggested} minutos a este paso y comprueba el aspecto y la textura antes de continuar.`;
}

function clarifyRecipe(recipe: Recipe): Recipe {
  const override = STEP_OVERRIDES[recipe.id];
  return { ...recipe, steps: override ?? recipe.steps.map((step, index) => clarifyStep(recipe, step, index)) };
}

export const RECIPES: Recipe[] = [...CORE_RECIPES, ...ADDITIONAL_RECIPES].map(clarifyRecipe);

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
  const rounded = unit === "g" || unit === "ml" ? Math.ceil(quantity / 10) * 10 : Math.ceil(quantity);
  return quantityLabel(rounded, unit);
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
