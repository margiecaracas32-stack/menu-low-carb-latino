export type Recipe = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  servings: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
};

export type WeekMeal = {
  date: string;
  recipeId: string;
};

export type ShoppingItem = {
  id: string;
  label: string;
  amount: string;
  aisle: "Vegetales" | "Proteínas" | "Despensa";
};

export const RECIPES: Recipe[] = [
  {
    id: "pollo-calabacin",
    title: "Pollo guisado con calabacín",
    description: "Una cena familiar, sabrosa y sencilla con ingredientes que encuentras en cualquier mercado.",
    minutes: 25,
    servings: 4,
    tags: ["Rápida", "Familia"],
    ingredients: ["680 g de pollo", "3 calabacines", "1 cebolla", "2 dientes de ajo", "Orégano y pimienta"],
    steps: ["Dora el pollo con ajo y cebolla.", "Agrega el calabacín en trozos y sazona.", "Cocina tapado 10 minutos y sirve."],
  },
  {
    id: "ropa-vieja",
    title: "Ropa vieja con pimientos",
    description: "Carne desmechada con sabor criollo y vegetales, sin acompañamientos pesados.",
    minutes: 35,
    servings: 4,
    tags: ["Familia"],
    ingredients: ["700 g de falda cocida", "2 pimientos", "1 cebolla", "Tomate triturado", "Comino"],
    steps: ["Sofríe cebolla y pimientos.", "Añade la carne y el tomate.", "Cocina 15 minutos a fuego bajo."],
  },
  {
    id: "pescado-coco",
    title: "Pescado al coco con ensalada",
    description: "Filetes suaves en salsa de coco ligera con ensalada fresca de repollo.",
    minutes: 30,
    servings: 4,
    tags: ["Familia"],
    ingredients: ["4 filetes de pescado", "200 ml de leche de coco", "1 repollo pequeño", "2 limones", "Cilantro"],
    steps: ["Sazona y sella el pescado.", "Añade leche de coco y cocina 8 minutos.", "Sirve con el repollo aliñado."],
  },
  {
    id: "picadillo-coliflor",
    title: "Picadillo criollo con coliflor",
    description: "El picadillo de siempre acompañado por arroz de coliflor bien sazonado.",
    minutes: 28,
    servings: 4,
    tags: ["Rápida", "Familia"],
    ingredients: ["600 g de carne molida", "1 coliflor", "1 pimiento", "Aceitunas", "Culantro"],
    steps: ["Cocina la carne con el sofrito.", "Procesa y saltea la coliflor.", "Ajusta la sazón y sirve junto."],
  },
  {
    id: "pernil-repollo",
    title: "Pernil rápido con repollo",
    description: "Cerdo dorado con especias latinas y repollo tibio al limón.",
    minutes: 32,
    servings: 4,
    tags: ["Familia"],
    ingredients: ["700 g de lomo de cerdo", "1 repollo", "1 naranja agria", "Ajo", "Orégano"],
    steps: ["Marina el cerdo con ajo y cítrico.", "Dora por ambos lados y termina tapado.", "Saltea el repollo con los jugos."],
  },
  {
    id: "tortilla-espinaca",
    title: "Tortilla de espinaca y queso",
    description: "Una cena rápida de sartén para los días en que queda poca energía.",
    minutes: 18,
    servings: 4,
    tags: ["Rápida", "Vegetariana"],
    ingredients: ["8 huevos", "250 g de espinaca", "150 g de queso", "1 cebolla", "Pimienta"],
    steps: ["Saltea cebolla y espinaca.", "Añade los huevos batidos y el queso.", "Cocina tapado hasta cuajar."],
  },
  {
    id: "albondigas-criollas",
    title: "Albóndigas en salsa criolla",
    description: "Albóndigas jugosas con tomate y hierbas, pensadas para toda la familia.",
    minutes: 38,
    servings: 4,
    tags: ["Familia"],
    ingredients: ["650 g de carne molida", "Tomate triturado", "1 huevo", "Cilantro", "Ajo"],
    steps: ["Forma las albóndigas y dóralas.", "Prepara la salsa criolla.", "Cocina todo junto 18 minutos."],
  },
];

export const SHOPPING_ITEMS: ShoppingItem[] = [
  { id: "s1", label: "Calabacín", amount: "3 unidades", aisle: "Vegetales" },
  { id: "s2", label: "Pimientos", amount: "5 unidades", aisle: "Vegetales" },
  { id: "s3", label: "Cebolla", amount: "6 unidades", aisle: "Vegetales" },
  { id: "s4", label: "Repollo", amount: "2 pequeños", aisle: "Vegetales" },
  { id: "s5", label: "Espinaca", amount: "250 g", aisle: "Vegetales" },
  { id: "s6", label: "Pollo", amount: "680 g", aisle: "Proteínas" },
  { id: "s7", label: "Carne para desmechar", amount: "700 g", aisle: "Proteínas" },
  { id: "s8", label: "Filetes de pescado", amount: "4 unidades", aisle: "Proteínas" },
  { id: "s9", label: "Carne molida", amount: "1,25 kg", aisle: "Proteínas" },
  { id: "s10", label: "Huevos", amount: "8 unidades", aisle: "Proteínas" },
  { id: "s11", label: "Leche de coco", amount: "1 lata", aisle: "Despensa" },
  { id: "s12", label: "Tomate triturado", amount: "2 latas", aisle: "Despensa" },
  { id: "s13", label: "Aceitunas", amount: "1 frasco pequeño", aisle: "Despensa" },
  { id: "s14", label: "Orégano", amount: "1 frasco", aisle: "Despensa" },
];

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildWeek(today = new Date()): WeekMeal[] {
  return RECIPES.slice(0, 7).map((recipe, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return { date: isoDate(date), recipeId: recipe.id };
  });
}

