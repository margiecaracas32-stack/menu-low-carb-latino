"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type Variants } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Download,
  ExternalLink,
  Heart,
  House,
  LogOut,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  ShoppingBasket,
  Sparkles,
  Trash2,
  Utensils,
  WifiOff,
  X,
} from "lucide-react";
import { buildDemoPlan, RECIPES, type Recipe, type ShoppingItem, type WeekMeal } from "./recipe-catalog";
import type { PersonalizedAppData } from "../../lib/personalized-app";
import { reportProductError, track, trackDaily } from "../../lib/analytics";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";
import { DELETE_CONFIRMATION } from "../../lib/privacy";

type TabId = "today" | "week" | "shopping" | "recipes";
type FilterId = "Todas" | "Familia" | "Rápida" | "Favoritas";
type ModalState = { type: "recipe"; recipe: Recipe } | { type: "swap" } | { type: "add-item" } | { type: "account" } | null;

const STORAGE_KEY = "menu-low-carb-internal-v1";
const ONBOARDING_KEY = "menu-low-carb-onboarding-v1";
const DEMO_PLAN = buildDemoPlan();
const TABS = [
  { id: "today" as const, label: "Hoy", icon: House },
  { id: "week" as const, label: "Semana", icon: CalendarDays },
  { id: "shopping" as const, label: "Compras", icon: ShoppingBasket },
  { id: "recipes" as const, label: "Recetas", icon: ChefHat },
];
const EASE = [0.16, 1, 0.3, 1] as const;
const listVariants: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

function recipeById(id: string, recipes: Recipe[]) {
  return recipes.find((recipe) => recipe.id === id) ?? recipes[0];
}

function scaleIngredient(ingredient: string, servings: number) {
  const match = ingredient.match(/^(\d+(?:[.,]\d+)?)\s+(.+)$/);
  if (!match || servings === 4) return ingredient;
  const raw = Number(match[1].replace(",", ".")) * servings / 4;
  const amount = /^(g|ml)\b/i.test(match[2]) ? Math.max(10, Math.ceil(raw / 10) * 10) : Math.max(1, Math.ceil(raw));
  return `${amount} ${match[2]}`;
}

function CountUp({ value }: { value: number }) {
  const reduceMotion = useReducedMotion();
  const number = useMotionValue(reduceMotion ? value : 0);
  const rounded = useTransform(number, (current) => Math.round(current));

  useEffect(() => {
    const controls = animate(number, value, { duration: reduceMotion ? 0 : 0.65, ease: EASE });
    return () => controls.stop();
  }, [number, reduceMotion, value]);

  return <motion.span className="internal-tabular">{rounded}</motion.span>;
}

function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div className="internal-progress" role="img" aria-label={`${label}: ${value}%`}>
      <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: value / 100 }} transition={{ duration: 0.45, ease: EASE }}/>
    </div>
  );
}

function RecipeVisual({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  if (recipe.id === "pollo-calabacin") {
    return <Image className="internal-food-photo" src="/images/pollo-calabacin.jpeg" alt="Pollo con calabacín servido en una fuente" width={386} height={514}/>;
  }
  return <div className={`internal-plate-art ${compact ? "compact" : ""}`} aria-hidden="true"/>;
}

function LoadingView() {
  return (
    <div className="internal-loading" aria-label="Cargando tu semana">
      <div className="internal-skeleton hero"/>
      <div className="internal-skeleton line"/>
      <div className="internal-skeleton card"/>
      <div className="internal-skeleton card short"/>
    </div>
  );
}

export default function InternalApp({ demoMode, userId, userCreatedAt, initialData }: { demoMode: boolean; userId?: string; userCreatedAt?: string; initialData: PersonalizedAppData | null }) {
  const reduceMotion = useReducedMotion();
  const householdSize = initialData?.householdSize ?? DEMO_PLAN.householdSize;
  const recipes = useMemo(() => RECIPES.map((recipe) => ({ ...recipe, servings: householdSize, ingredients: recipe.ingredients.map((item) => scaleIngredient(item, householdSize)) })), [householdSize]);
  const week = initialData?.week ?? DEMO_PLAN.week;
  const baseShoppingItems = initialData?.shoppingItems ?? DEMO_PLAN.shoppingItems;
  const currentDate = new Date();
  const currentIso = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
  const currentDayIndex = Math.max(0, week.findIndex((entry) => entry.date === currentIso));
  const [tab, setTab] = useState<TabId>("today");
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [todayRecipeId, setTodayRecipeId] = useState(week[currentDayIndex].recipeId);
  const [completedMeals, setCompletedMeals] = useState<string[]>(demoMode ? [week[1].recipeId, week[2].recipeId] : []);
  const [checkedItems, setCheckedItems] = useState<string[]>(baseShoppingItems.filter((item) => item.checked).map((item) => item.id));
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(baseShoppingItems);
  const [favorites, setFavorites] = useState<string[]>(["pollo-calabacin", "picadillo-coliflor"]);
  const [selectedDay, setSelectedDay] = useState(currentDayIndex);
  const [filter, setFilter] = useState<FilterId>("Todas");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [newItem, setNewItem] = useState("");
  const [message, setMessage] = useState("");
  const [personalizationState, setPersonalizationState] = useState<"ready" | "syncing" | "missing" | "error">(initialData || demoMode ? "ready" : "syncing");

  const todayRecipe = recipeById(todayRecipeId, recipes);
  const selectedRecipe = recipeById(week[selectedDay].recipeId, recipes);
  const completion = Math.round((completedMeals.length / week.length) * 100);
  const shoppingCompletion = shoppingItems.length ? Math.round((checkedItems.length / shoppingItems.length) * 100) : 0;

  useEffect(() => {
    if (!userId || initialData || demoMode) return;
    let cancelled = false;
    async function synchronize() {
      try {
        const stored = window.localStorage.getItem(ONBOARDING_KEY);
        const answers = stored ? JSON.parse(stored)?.answers : null;
        const response = await fetch("/api/app/personalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });
        if (response.status === 400) { if (!cancelled) setPersonalizationState("missing"); return; }
        if (!response.ok) throw new Error("personalization_failed");
        if (!cancelled) window.location.reload();
      } catch (error) {
        if (userId) reportProductError(error instanceof Error ? error : new Error("personalization_failed"), "personalization_sync", "/app");
        if (!cancelled) setPersonalizationState("error");
      }
    }
    void synchronize();
    return () => { cancelled = true; };
  }, [demoMode, initialData, userId]);

  useEffect(() => {
    let finish = 0;
    const hydrate = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedTab = params.get("tab") as TabId | null;
      if (requestedTab && TABS.some((entry) => entry.id === requestedTab)) setTab(requestedTab);

      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            todayRecipeId?: string;
            completedMeals?: string[];
            checkedItems?: string[];
            favorites?: string[];
            extraItems?: ShoppingItem[];
          };
          if (parsed.todayRecipeId && recipes.some((recipe) => recipe.id === parsed.todayRecipeId)) setTodayRecipeId(parsed.todayRecipeId);
          if (Array.isArray(parsed.completedMeals)) setCompletedMeals(parsed.completedMeals);
          if (Array.isArray(parsed.checkedItems)) setCheckedItems(parsed.checkedItems);
          if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
          if (Array.isArray(parsed.extraItems) && parsed.extraItems.length) setShoppingItems([...baseShoppingItems, ...parsed.extraItems]);
        }
      } catch {
        setStorageError(true);
      }

      setOnline(navigator.onLine);
      finish = window.setTimeout(() => setLoading(false), reduceMotion ? 100 : 520);
    });
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.cancelAnimationFrame(hydrate);
      window.clearTimeout(finish);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [baseShoppingItems, recipes, reduceMotion]);

  useEffect(() => {
    if (loading) return;
    const extras = shoppingItems.filter((item) => item.id.startsWith("extra-"));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ todayRecipeId, completedMeals, checkedItems, favorites, extraItems: extras }));
  }, [checkedItems, completedMeals, favorites, loading, shoppingItems, todayRecipeId]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (loading || demoMode || !userId) return;
    const created = userCreatedAt ? new Date(userCreatedAt) : new Date();
    const daysSinceSignup = Math.max(0, Math.floor((Date.now() - created.getTime()) / 86_400_000));
    track("app_abierta", { plan: "unknown" }, `app-opened:${userId}`);
    trackDaily(userId, daysSinceSignup, "unknown");
    if (initialData) track("aha_alcanzado", { plan: "unknown" }, `aha:${userId}`);
  }, [demoMode, initialData, loading, userCreatedAt, userId]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setModal(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  function changeTab(nextTab: TabId) {
    setTab(nextTab);
    window.history.replaceState(null, "", `/app?tab=${nextTab}`);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function toggleFavorite(recipeId: string) {
    setFavorites((current) => current.includes(recipeId) ? current.filter((id) => id !== recipeId) : [...current, recipeId]);
  }

  function toggleTodayComplete() {
    const completed = completedMeals.includes(todayRecipe.id);
    setCompletedMeals((current) => completed ? current.filter((id) => id !== todayRecipe.id) : [...new Set([...current, todayRecipe.id])]);
    if (!completed && !demoMode) track("cena_completada", { recipe_id: todayRecipe.id, plan: "unknown" }, `dinner:${currentIso}:${todayRecipe.id}`);
    setMessage(completed ? "La cena volvió a quedar pendiente." : "Cena marcada. Tu semana avanza.");
  }

  function chooseSwap(recipe: Recipe) {
    const previousRecipeId = todayRecipe.id;
    setTodayRecipeId(recipe.id);
    if (!demoMode) track("cena_sustituida", { receta_anterior: previousRecipeId, receta_nueva: recipe.id, plan: "unknown" });
    setModal(null);
    setMessage(`Cena cambiada por ${recipe.title}.`);
  }

  function toggleShoppingItem(itemId: string) {
    setCheckedItems((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    if (!checkedItems.includes(itemId) && checkedItems.length + 1 === shoppingItems.length) {
      if (!demoMode) track("compra_completada", { productos: shoppingItems.length, plan: "unknown" }, `shopping:${week[0].date}`);
      setMessage("Compra completa. La semana está abastecida.");
    }
  }

  function openRecipe(recipe: Recipe) {
    if (!demoMode) track("receta_vista", { recipe_id: recipe.id, plan: "unknown" });
    setModal({ type: "recipe", recipe });
  }

  function addShoppingItem(event: FormEvent) {
    event.preventDefault();
    const label = newItem.trim();
    if (!label) return;
    setShoppingItems((current) => [...current, { id: `extra-${Date.now()}`, label, amount: "1 unidad", aisle: "Despensa" }]);
    setNewItem("");
    setModal(null);
    setMessage(`${label} se añadió a tu lista.`);
  }

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesFilter = filter === "Todas" || (filter === "Favoritas" ? favorites.includes(recipe.id) : recipe.tags.includes(filter));
      const matchesSearch = recipe.title.toLowerCase().includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [favorites, filter, recipes, search]);

  const dateLabel = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const rangeLabel = `${new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(`${week[0].date}T12:00:00`))} – ${new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(`${week[6].date}T12:00:00`))}`;

  return (
    <div className="internal-shell paper">
      <header className="internal-header">
        <Link className="internal-brand" href="/" aria-label="Volver a la página principal"><Image src="/brand/isotipo-v2.png" alt="" width={64} height={64}/><span>Menú Low Carb Latino</span></Link>
        <button className="internal-avatar" type="button" onClick={() => setModal({ type: "account" })} aria-label="Abrir cuenta y privacidad">A</button>
      </header>

      {!online && <div className="internal-offline" role="status"><WifiOff/> Sin conexión. Puedes seguir marcando tu lista; guardaremos los cambios en este dispositivo.</div>}
      {demoMode && <div className="internal-demo" role="note"><Sparkles/> Vista local con datos de demostración. El acceso real seguirá protegido al publicar.</div>}
      {personalizationState === "syncing" && <div className="internal-demo" role="status"><Sparkles/> Guardando tus preferencias y preparando tu semana…</div>}
      {personalizationState === "missing" && <div className="internal-error" role="alert"><CircleAlert/><span>Faltan tus tres preferencias para preparar la semana.</span><Link href="/onboarding">Responder ahora</Link></div>}
      {personalizationState === "error" && <div className="internal-error" role="alert"><CircleAlert/><span>No pudimos guardar tu semana.</span><button onClick={() => window.location.reload()}>Intentar de nuevo</button></div>}
      {storageError && <div className="internal-error" role="alert"><CircleAlert/><span>No pudimos recuperar los cambios anteriores.</span><button onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setStorageError(false); }}>Empezar con la semana guardada</button></div>}

      <main className="internal-main">
        {loading ? <LoadingView/> : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} className="internal-content" variants={listVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: 0.22, ease: EASE }}>
              {tab === "today" && <TodayView recipe={todayRecipe} dateLabel={dateLabel} completion={completion} completed={completedMeals.includes(todayRecipe.id)} onRecipe={() => openRecipe(todayRecipe)} onSwap={() => setModal({ type: "swap" })} onComplete={toggleTodayComplete}/>}
              {tab === "week" && <WeekView week={week} rangeLabel={rangeLabel} selectedDay={selectedDay} onSelectDay={setSelectedDay} selectedRecipe={selectedRecipe} completion={completion} onToday={() => changeTab("today")} onRecipe={() => openRecipe(selectedRecipe)}/>}
              {tab === "shopping" && <ShoppingView items={shoppingItems} checkedItems={checkedItems} progress={shoppingCompletion} onToggle={toggleShoppingItem} onAdd={() => setModal({ type: "add-item" })}/>}
              {tab === "recipes" && <RecipesView recipes={filteredRecipes} favorites={favorites} filter={filter} search={search} onFilter={setFilter} onSearch={setSearch} onFavorite={toggleFavorite} onRecipe={openRecipe}/>}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <nav className="internal-nav" aria-label="Navegación principal">
        <div>
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <motion.button key={id} type="button" whileTap={{ scale: 0.97 }} onClick={() => changeTab(id)} aria-current={active ? "page" : undefined}>
                {active && <motion.span className="internal-nav-indicator" layoutId="internal-active-tab"/>}
                <Icon aria-hidden="true" fill={active ? "currentColor" : "none"}/><span>{label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>{message && <motion.div className="internal-toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Check/>{message}</motion.div>}</AnimatePresence>
      <AnimatePresence>{modal && <InternalModal modal={modal} recipes={recipes} todayRecipe={todayRecipe} newItem={newItem} setNewItem={setNewItem} demoMode={demoMode} onClose={() => setModal(null)} onSwap={chooseSwap} onAddItem={addShoppingItem}/>}</AnimatePresence>
    </div>
  );
}

function ScreenHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <motion.header className="internal-screen-heading" variants={itemVariants}><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></motion.header>;
}

function TodayView({ recipe, dateLabel, completion, completed, onRecipe, onSwap, onComplete }: { recipe: Recipe; dateLabel: string; completion: number; completed: boolean; onRecipe: () => void; onSwap: () => void; onComplete: () => void }) {
  return <>
    <ScreenHeading eyebrow={dateLabel} title="Tu cena de hoy" description="Todo decidido para que solo tengas que cocinar."/>
    <motion.section className="internal-meal-hero" variants={itemVariants}>
      <div className="internal-meal-media"><RecipeVisual recipe={recipe}/><span><Clock3/>{recipe.minutes} min · rinde {recipe.servings}</span></div>
      <div className="internal-meal-copy"><p>MÉTODO SEMANA RESUELTA</p><h2>{recipe.title}</h2><span>{recipe.description}</span><button className="internal-primary" type="button" onClick={onRecipe}>Ver receta <ArrowRight/></button></div>
    </motion.section>
    <motion.section className="internal-progress-card" variants={itemVariants}>
      <div><span>Semana en marcha</span><strong><CountUp value={Math.round(completion / 14.3)}/> de 7 cenas</strong></div><ProgressBar value={completion} label="Progreso semanal"/>
      <p>{completion < 60 ? "Cada comida marcada mejora la próxima semana." : "Ya resolviste más de la mitad de la semana."}</p>
    </motion.section>
    <motion.div className="internal-actions" variants={itemVariants}>
      <motion.button whileTap={{ scale: 0.97 }} className={`internal-complete ${completed ? "done" : ""}`} type="button" onClick={onComplete}>{completed ? <><Check/> Cena completada</> : <><Utensils/> Marcar cuando cocine</>}</motion.button>
      <motion.button whileTap={{ scale: 0.97 }} className="internal-secondary" type="button" onClick={onSwap}><RefreshCw/> Sustituir cena</motion.button>
    </motion.div>
  </>;
}

function WeekView({ week, rangeLabel, selectedDay, onSelectDay, selectedRecipe, completion, onToday, onRecipe }: { week: WeekMeal[]; rangeLabel: string; selectedDay: number; onSelectDay: (index: number) => void; selectedRecipe: Recipe; completion: number; onToday: () => void; onRecipe: () => void }) {
  return <>
    <motion.header className="internal-period-heading" variants={itemVariants}><div><p>PLAN FAMILIAR</p><h1>Siete cenas, una sola decisión.</h1><span>{rangeLabel}</span></div><div><button type="button" aria-label="Semana anterior"><ChevronLeft/></button><button type="button" aria-label="Semana siguiente" disabled><ChevronRight/></button></div></motion.header>
    <motion.section className="internal-week-strip" variants={itemVariants} aria-label="Días de la semana">
      {week.map((entry, index) => { const date = new Date(`${entry.date}T12:00:00`); const selected = selectedDay === index; return <button key={entry.date} type="button" aria-pressed={selected} onClick={() => onSelectDay(index)}><span>{new Intl.DateTimeFormat("es", { weekday: "short" }).format(date).slice(0, 2)}</span><b>{date.getDate()}</b>{index < 2 && <Check/>}</button>; })}
    </motion.section>
    <motion.section className="internal-week-focus" variants={itemVariants}>
      <RecipeVisual recipe={selectedRecipe} compact/><div><p>{selectedDay === 0 ? "HOY" : `DÍA ${selectedDay + 1}`}</p><h2>{selectedRecipe.title}</h2><span>{selectedRecipe.minutes} min · rinde {selectedRecipe.servings}</span><button type="button" onClick={onRecipe}>Ver detalles <ArrowRight/></button></div>
    </motion.section>
    <motion.section className="internal-week-summary" variants={itemVariants}><div><span>Completadas</span><strong><CountUp value={Math.round(completion / 14.3)}/><small>/7</small></strong></div><div><span>Tiempo promedio</span><strong>29<small> min</small></strong></div><button className="internal-primary" onClick={onToday} type="button">Abrir cena de hoy <ArrowRight/></button></motion.section>
  </>;
}

function ShoppingView({ items, checkedItems, progress, onToggle, onAdd }: { items: ShoppingItem[]; checkedItems: string[]; progress: number; onToggle: (id: string) => void; onAdd: () => void }) {
  const aisles: ShoppingItem["aisle"][] = ["Vegetales", "Proteínas", "Despensa"];
  return <>
    <ScreenHeading eyebrow="COMPRA CONSOLIDADA" title="Una lista, sin duplicados." description="Agrupada por pasillos para terminar el mercado más rápido."/>
    <motion.section className="internal-shopping-progress" variants={itemVariants}><div><span>Productos encontrados</span><strong><CountUp value={checkedItems.length}/> de {items.length}</strong></div><ProgressBar value={progress} label="Progreso de compra"/><p>{progress === 100 ? "La compra de esta semana está completa." : `${items.length - checkedItems.length} productos pendientes.`}</p></motion.section>
    <motion.div className="internal-list-heading" variants={itemVariants}><h2>Tu recorrido</h2><button type="button" onClick={onAdd}><Plus/> Añadir</button></motion.div>
    <motion.div className="internal-shopping-groups" variants={listVariants}>
      {aisles.map((aisle) => <motion.section key={aisle} variants={itemVariants}><header><h3>{aisle}</h3><span>{items.filter((item) => item.aisle === aisle && !checkedItems.includes(item.id)).length} pendientes</span></header><ul>{items.filter((item) => item.aisle === aisle).map((item) => { const checked = checkedItems.includes(item.id); return <li key={item.id}><button type="button" onClick={() => onToggle(item.id)} aria-pressed={checked}><i>{checked && <Check/>}</i><span><b>{item.label}</b><small>{item.amount}</small></span></button></li>; })}</ul></motion.section>)}
    </motion.div>
  </>;
}

function RecipesView({ recipes, favorites, filter, search, onFilter, onSearch, onFavorite, onRecipe }: { recipes: Recipe[]; favorites: string[]; filter: FilterId; search: string; onFilter: (filter: FilterId) => void; onSearch: (value: string) => void; onFavorite: (id: string) => void; onRecipe: (recipe: Recipe) => void }) {
  const filters: FilterId[] = ["Todas", "Familia", "Rápida", "Favoritas"];
  return <>
    <ScreenHeading eyebrow="BIBLIOTECA CURADA" title="Recetas para tu vida real." description="Platos familiares, ingredientes comunes y ninguna cifra inventada."/>
    <motion.label className="internal-search" variants={itemVariants}><Search/><span className="sr-only">Buscar recetas</span><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar por nombre"/></motion.label>
    <motion.div className="internal-filters" variants={itemVariants} aria-label="Filtrar recetas">{filters.map((entry) => <button type="button" key={entry} aria-pressed={filter === entry} onClick={() => onFilter(entry)}>{entry}</button>)}</motion.div>
    {recipes.length ? <motion.div className="internal-recipe-grid" variants={listVariants}>{recipes.map((recipe) => <motion.article className="internal-recipe-card" key={recipe.id} variants={itemVariants}><button className="internal-recipe-open" type="button" onClick={() => onRecipe(recipe)}><RecipeVisual recipe={recipe} compact/><span className="internal-recipe-copy"><small>{recipe.tags.join(" · ")}</small><b>{recipe.title}</b><em>{recipe.minutes} min · {recipe.servings} porciones</em></span></button><button className="internal-favorite" type="button" data-active={favorites.includes(recipe.id)} onClick={() => onFavorite(recipe.id)} aria-label={favorites.includes(recipe.id) ? `Quitar ${recipe.title} de favoritas` : `Guardar ${recipe.title} como favorita`}><Heart fill={favorites.includes(recipe.id) ? "currentColor" : "none"}/></button></motion.article>)}</motion.div> : <motion.section className="internal-empty" variants={itemVariants}><ChefHat/><h2>Prueba con otra búsqueda</h2><p>No encontramos esa combinación. Cambia el filtro o escribe menos palabras.</p><button type="button" onClick={() => { onSearch(""); onFilter("Todas"); }}>Ver todas las recetas</button></motion.section>}
  </>;
}

function InternalModal({ modal, recipes, todayRecipe, newItem, setNewItem, demoMode, onClose, onSwap, onAddItem }: { modal: Exclude<ModalState, null>; recipes: Recipe[]; todayRecipe: Recipe; newItem: string; setNewItem: (value: string) => void; demoMode: boolean; onClose: () => void; onSwap: (recipe: Recipe) => void; onAddItem: (event: FormEvent) => void }) {
  const label = modal.type === "recipe" ? modal.recipe.title : modal.type === "swap" ? "Sustituir cena" : modal.type === "account" ? "Cuenta y privacidad" : "Añadir producto";
  return <motion.div className="internal-overlay" role="dialog" aria-modal="true" aria-label={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <motion.section className="internal-sheet" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3, ease: EASE }}>
      <button className="internal-close" type="button" onClick={onClose} aria-label="Cerrar"><X/></button>
      {modal.type === "recipe" && <><p className="kicker">RECETA PASO A PASO</p><h2>{modal.recipe.title}</h2><div className="internal-sheet-meta"><span><Clock3/>{modal.recipe.minutes} min</span><span><Utensils/>{modal.recipe.servings} porciones</span></div><h3>Ingredientes</h3><ul>{modal.recipe.ingredients.map((ingredient) => <li key={ingredient}><Check/>{ingredient}</li>)}</ul><h3>Preparación</h3><ol>{modal.recipe.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></>}
      {modal.type === "swap" && <><p className="kicker">CAMBIO COMPATIBLE</p><h2>Otra cena, la semana intacta.</h2><p className="internal-sheet-intro">Conservamos {todayRecipe.servings} porciones y priorizamos ingredientes que ya están en tu compra.</p><div className="internal-swap-list">{recipes.filter((recipe) => recipe.id !== todayRecipe.id).slice(0, 3).map((recipe) => <button key={recipe.id} type="button" onClick={() => onSwap(recipe)}><RecipeVisual recipe={recipe} compact/><span><b>{recipe.title}</b><small>{recipe.minutes} min · {recipe.tags.join(" · ")}</small></span><ArrowRight/></button>)}</div></>}
      {modal.type === "add-item" && <><p className="kicker">EXTRA PARA TU CASA</p><h2>Añade lo que falta.</h2><p className="internal-sheet-intro">Este producto quedará en Despensa y podrás marcarlo como el resto.</p><form className="internal-add-form" onSubmit={onAddItem}><label htmlFor="new-shopping-item">Producto</label><input id="new-shopping-item" autoFocus value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Ej. café molido"/><button className="internal-primary" type="submit" disabled={!newItem.trim()}>Añadir a mi lista <Plus/></button></form></>}
      {modal.type === "account" && <AccountPanel demoMode={demoMode}/>}
    </motion.section>
  </motion.div>;
}

function AccountPanel({ demoMode }: { demoMode: boolean }) {
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportCategory, setSupportCategory] = useState("access");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportStatus, setSupportStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [supportReply, setSupportReply] = useState("");

  async function downloadData() {
    if (demoMode || exporting) return;
    setExporting(true);
    setError("");
    try {
      const response = await fetch("/api/privacy/export", { headers: { Accept: "application/json" } });
      const serverData = await response.json() as Record<string, unknown> & { message?: string };
      if (!response.ok) throw new Error(serverData.message ?? "No pudimos preparar la descarga.");
      const deviceData = {
        app: window.localStorage.getItem(STORAGE_KEY),
        onboarding: window.localStorage.getItem(ONBOARDING_KEY),
      };
      const blob = new Blob([JSON.stringify({ ...serverData, device_data: deviceData }, null, 2)], { type: "application/json" });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `menu-low-carb-datos-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos preparar la descarga.");
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    if (demoMode || deleting || confirmation !== DELETE_CONFIRMATION) return;
    setDeleting(true);
    setError("");
    try {
      const response = await fetch("/api/privacy/delete", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }) });
      const body = await response.json() as { message?: string };
      if (!response.ok) throw new Error(body.message ?? "No pudimos eliminar la cuenta.");
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(ONBOARDING_KEY);
      window.location.assign("/?account=deleted");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No pudimos eliminar la cuenta.");
      setDeleting(false);
    }
  }

  async function signOut() {
    if (demoMode) { window.location.assign("/"); return; }
    await createSupabaseBrowserClient().auth.signOut();
    window.location.assign("/login");
  }

  async function sendSupport(event: FormEvent) {
    event.preventDefault();
    if (demoMode || supportStatus === "sending" || supportMessage.trim().length < 10) return;
    setSupportStatus("sending");
    setSupportReply("");
    const response = await fetch("/api/support", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: supportCategory, message: supportMessage }) });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    setSupportReply(body?.message ?? (response.ok ? "Solicitud recibida." : "No pudimos enviar la solicitud."));
    setSupportStatus(response.ok ? "success" : "error");
    if (response.ok) setSupportMessage("");
  }

  return <div className="internal-account">
    <p className="kicker">CUENTA Y PRIVACIDAD</p>
    <h2>Tú decides sobre tus datos.</h2>
    <p className="internal-sheet-intro">Descarga una copia, administra tu suscripción o elimina la cuenta sin buscar ayuda.</p>
    <div className="internal-account-actions">
      <button type="button" onClick={downloadData} disabled={demoMode || exporting}><Download/><span><b>{exporting ? "Preparando descarga…" : "Descargar mis datos"}</b><small>Incluye tu cuenta, preferencias, semana y actividad.</small></span><ArrowRight/></button>
      <a href="https://consumer.hotmart.com/purchase" target="_blank" rel="noreferrer"><ExternalLink/><span><b>Administrar mi suscripción</b><small>Cancela o cambia el pago en el portal seguro de Hotmart.</small></span><ArrowRight/></a>
      <button type="button" onClick={signOut}><LogOut/><span><b>Cerrar sesión</b><small>Tu cuenta y tu semana permanecen guardadas.</small></span><ArrowRight/></button>
    </div>
    <div className="internal-account-legal"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link><Link href="/reembolso">Cancelación y reembolsos</Link></div>
    <section className="internal-support-zone">
      <button type="button" className="internal-support-toggle" onClick={() => setSupportOpen((value) => !value)} aria-expanded={supportOpen}><MessageCircle/> {supportOpen ? "Cerrar ayuda" : "Necesito ayuda"}</button>
      {supportOpen && <form className="internal-support-form" onSubmit={sendSupport}>
        <p>Cuéntanos qué ocurrió. Tu solicitud queda privada y el propietario la revisará antes de 24 horas hábiles.</p>
        <label htmlFor="support-category">Tipo de ayuda</label>
        <select id="support-category" value={supportCategory} onChange={(event) => setSupportCategory(event.target.value)}><option value="access">No puedo entrar</option><option value="billing">Compra o suscripción</option><option value="product">Menú, receta o lista</option><option value="privacy">Mis datos o privacidad</option></select>
        <label htmlFor="support-message">¿Qué pasó?</label>
        <textarea id="support-message" rows={4} minLength={10} maxLength={1000} value={supportMessage} onChange={(event) => setSupportMessage(event.target.value)} placeholder="Ej.: mi compra fue aprobada, pero la app todavía muestra el paywall."/>
        {supportReply && <p className={`internal-support-reply ${supportStatus}`} role={supportStatus === "error" ? "alert" : "status"}>{supportReply}</p>}
        <button type="submit" disabled={demoMode || supportStatus === "sending" || supportMessage.trim().length < 10}>{supportStatus === "sending" ? "Enviando…" : "Enviar solicitud privada"}</button>
      </form>}
    </section>
    <section className="internal-danger-zone">
      <button type="button" className="internal-danger-toggle" onClick={() => { setShowDelete((value) => !value); setError(""); }}><Trash2/> Eliminar mi cuenta</button>
      {showDelete && <div className="internal-delete-confirm"><p>Esta acción borra tu cuenta, preferencias, semanas y actividad. No cancela por sí sola la suscripción de Hotmart.</p><label htmlFor="delete-confirmation">Escribe <b>{DELETE_CONFIRMATION}</b></label><input id="delete-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off"/><button type="button" disabled={demoMode || deleting || confirmation !== DELETE_CONFIRMATION} onClick={deleteAccount}>{deleting ? "Eliminando…" : "Eliminar definitivamente"}</button></div>}
    </section>
    {demoMode && <p className="internal-account-note">Las acciones de datos se activan con una cuenta real.</p>}
    {error && <p className="internal-account-error" role="alert">{error}</p>}
  </div>;
}
