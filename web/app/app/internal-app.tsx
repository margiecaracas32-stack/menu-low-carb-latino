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
  Heart,
  House,
  Plus,
  RefreshCw,
  Search,
  ShoppingBasket,
  Sparkles,
  Utensils,
  WifiOff,
  X,
} from "lucide-react";
import { buildWeek, RECIPES, SHOPPING_ITEMS, type Recipe, type ShoppingItem } from "./demo-data";

type TabId = "today" | "week" | "shopping" | "recipes";
type FilterId = "Todas" | "Familia" | "Rápida" | "Favoritas";
type ModalState = { type: "recipe"; recipe: Recipe } | { type: "swap" } | { type: "add-item" } | null;

const STORAGE_KEY = "menu-low-carb-demo-v1";
const WEEK = buildWeek();
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

function recipeById(id: string) {
  return RECIPES.find((recipe) => recipe.id === id) ?? RECIPES[0];
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
  return (
    <div className={`internal-plate-art ${compact ? "compact" : ""}`} aria-hidden="true">
      <span>{recipe.title.split(" ").slice(0, 2).join(" ")}</span>
      <i/><b/>
    </div>
  );
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

export default function InternalApp({ demoMode }: { demoMode: boolean }) {
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<TabId>("today");
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [todayRecipeId, setTodayRecipeId] = useState(WEEK[0].recipeId);
  const [completedMeals, setCompletedMeals] = useState<string[]>([WEEK[1].recipeId, WEEK[2].recipeId]);
  const [checkedItems, setCheckedItems] = useState<string[]>(SHOPPING_ITEMS.slice(0, 4).map((item) => item.id));
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(SHOPPING_ITEMS);
  const [favorites, setFavorites] = useState<string[]>(["pollo-calabacin", "picadillo-coliflor"]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [filter, setFilter] = useState<FilterId>("Todas");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [newItem, setNewItem] = useState("");
  const [message, setMessage] = useState("");

  const todayRecipe = recipeById(todayRecipeId);
  const selectedRecipe = recipeById(WEEK[selectedDay].recipeId);
  const completion = Math.round((completedMeals.length / WEEK.length) * 100);
  const shoppingCompletion = shoppingItems.length ? Math.round((checkedItems.length / shoppingItems.length) * 100) : 0;

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
          if (parsed.todayRecipeId && recipeById(parsed.todayRecipeId)) setTodayRecipeId(parsed.todayRecipeId);
          if (Array.isArray(parsed.completedMeals)) setCompletedMeals(parsed.completedMeals);
          if (Array.isArray(parsed.checkedItems)) setCheckedItems(parsed.checkedItems);
          if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
          if (Array.isArray(parsed.extraItems) && parsed.extraItems.length) setShoppingItems([...SHOPPING_ITEMS, ...parsed.extraItems]);
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
  }, [reduceMotion]);

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
    setMessage(completed ? "La cena volvió a quedar pendiente." : "Cena marcada. Tu semana avanza.");
  }

  function chooseSwap(recipe: Recipe) {
    setTodayRecipeId(recipe.id);
    setModal(null);
    setMessage(`Cena cambiada por ${recipe.title}.`);
  }

  function toggleShoppingItem(itemId: string) {
    setCheckedItems((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
    if (!checkedItems.includes(itemId) && checkedItems.length + 1 === shoppingItems.length) setMessage("Compra completa. La semana está abastecida.");
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
    return RECIPES.filter((recipe) => {
      const matchesFilter = filter === "Todas" || (filter === "Favoritas" ? favorites.includes(recipe.id) : recipe.tags.includes(filter));
      const matchesSearch = recipe.title.toLowerCase().includes(search.trim().toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [favorites, filter, search]);

  const dateLabel = new Intl.DateTimeFormat("es", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const rangeLabel = `${new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(`${WEEK[0].date}T12:00:00`))} – ${new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(`${WEEK[6].date}T12:00:00`))}`;

  return (
    <div className="internal-shell paper">
      <header className="internal-header">
        <Link className="internal-brand" href="/" aria-label="Volver a la página principal"><Image src="/brand/isotipo-v2.png" alt="" width={64} height={64}/><span>Menú Low Carb Latino</span></Link>
        <button className="internal-avatar" type="button" onClick={() => setMessage("Los ajustes de cuenta se habilitarán al publicar.")} aria-label="Abrir ajustes de cuenta">A</button>
      </header>

      {!online && <div className="internal-offline" role="status"><WifiOff/> Sin conexión. Puedes seguir marcando tu lista; guardaremos los cambios en este dispositivo.</div>}
      {demoMode && <div className="internal-demo" role="note"><Sparkles/> Vista local con datos de demostración. El acceso real seguirá protegido al publicar.</div>}
      {storageError && <div className="internal-error" role="alert"><CircleAlert/><span>No pudimos recuperar los cambios anteriores.</span><button onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setStorageError(false); }}>Empezar con la semana guardada</button></div>}

      <main className="internal-main">
        {loading ? <LoadingView/> : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} className="internal-content" variants={listVariants} initial="hidden" animate="visible" exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: 0.22, ease: EASE }}>
              {tab === "today" && <TodayView recipe={todayRecipe} dateLabel={dateLabel} completion={completion} completed={completedMeals.includes(todayRecipe.id)} onRecipe={() => setModal({ type: "recipe", recipe: todayRecipe })} onSwap={() => setModal({ type: "swap" })} onComplete={toggleTodayComplete}/>} 
              {tab === "week" && <WeekView rangeLabel={rangeLabel} selectedDay={selectedDay} onSelectDay={setSelectedDay} selectedRecipe={selectedRecipe} completion={completion} onToday={() => changeTab("today")} onRecipe={() => setModal({ type: "recipe", recipe: selectedRecipe })}/>} 
              {tab === "shopping" && <ShoppingView items={shoppingItems} checkedItems={checkedItems} progress={shoppingCompletion} onToggle={toggleShoppingItem} onAdd={() => setModal({ type: "add-item" })}/>} 
              {tab === "recipes" && <RecipesView recipes={filteredRecipes} favorites={favorites} filter={filter} search={search} onFilter={setFilter} onSearch={setSearch} onFavorite={toggleFavorite} onRecipe={(recipe) => setModal({ type: "recipe", recipe })}/>} 
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
      <AnimatePresence>{modal && <InternalModal modal={modal} todayRecipe={todayRecipe} newItem={newItem} setNewItem={setNewItem} onClose={() => setModal(null)} onSwap={chooseSwap} onAddItem={addShoppingItem}/>}</AnimatePresence>
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

function WeekView({ rangeLabel, selectedDay, onSelectDay, selectedRecipe, completion, onToday, onRecipe }: { rangeLabel: string; selectedDay: number; onSelectDay: (index: number) => void; selectedRecipe: Recipe; completion: number; onToday: () => void; onRecipe: () => void }) {
  return <>
    <motion.header className="internal-period-heading" variants={itemVariants}><div><p>PLAN FAMILIAR</p><h1>Siete cenas, una sola decisión.</h1><span>{rangeLabel}</span></div><div><button type="button" aria-label="Semana anterior"><ChevronLeft/></button><button type="button" aria-label="Semana siguiente" disabled><ChevronRight/></button></div></motion.header>
    <motion.section className="internal-week-strip" variants={itemVariants} aria-label="Días de la semana">
      {WEEK.map((entry, index) => { const date = new Date(`${entry.date}T12:00:00`); const selected = selectedDay === index; return <button key={entry.date} type="button" aria-pressed={selected} onClick={() => onSelectDay(index)}><span>{new Intl.DateTimeFormat("es", { weekday: "short" }).format(date).slice(0, 2)}</span><b>{date.getDate()}</b>{index < 2 && <Check/>}</button>; })}
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

function InternalModal({ modal, todayRecipe, newItem, setNewItem, onClose, onSwap, onAddItem }: { modal: Exclude<ModalState, null>; todayRecipe: Recipe; newItem: string; setNewItem: (value: string) => void; onClose: () => void; onSwap: (recipe: Recipe) => void; onAddItem: (event: FormEvent) => void }) {
  return <motion.div className="internal-overlay" role="dialog" aria-modal="true" aria-label={modal.type === "recipe" ? modal.recipe.title : modal.type === "swap" ? "Sustituir cena" : "Añadir producto"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <motion.section className="internal-sheet" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3, ease: EASE }}>
      <button className="internal-close" type="button" onClick={onClose} aria-label="Cerrar"><X/></button>
      {modal.type === "recipe" && <><p className="kicker">RECETA PASO A PASO</p><h2>{modal.recipe.title}</h2><div className="internal-sheet-meta"><span><Clock3/>{modal.recipe.minutes} min</span><span><Utensils/>{modal.recipe.servings} porciones</span></div><h3>Ingredientes</h3><ul>{modal.recipe.ingredients.map((ingredient) => <li key={ingredient}><Check/>{ingredient}</li>)}</ul><h3>Preparación</h3><ol>{modal.recipe.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></>}
      {modal.type === "swap" && <><p className="kicker">CAMBIO COMPATIBLE</p><h2>Otra cena, la semana intacta.</h2><p className="internal-sheet-intro">Conservamos cuatro porciones y priorizamos ingredientes que ya están en tu compra.</p><div className="internal-swap-list">{RECIPES.filter((recipe) => recipe.id !== todayRecipe.id).slice(0, 3).map((recipe) => <button key={recipe.id} type="button" onClick={() => onSwap(recipe)}><RecipeVisual recipe={recipe} compact/><span><b>{recipe.title}</b><small>{recipe.minutes} min · {recipe.tags.join(" · ")}</small></span><ArrowRight/></button>)}</div></>}
      {modal.type === "add-item" && <><p className="kicker">EXTRA PARA TU CASA</p><h2>Añade lo que falta.</h2><p className="internal-sheet-intro">Este producto quedará en Despensa y podrás marcarlo como el resto.</p><form className="internal-add-form" onSubmit={onAddItem}><label htmlFor="new-shopping-item">Producto</label><input id="new-shopping-item" autoFocus value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Ej. café molido"/><button className="internal-primary" type="submit" disabled={!newItem.trim()}>Añadir a mi lista <Plus/></button></form></>}
    </motion.section>
  </motion.div>;
}
