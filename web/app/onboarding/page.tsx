"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  RefreshCw,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Users,
  Utensils,
  WifiOff,
} from "lucide-react";
import { derivePersonalizedPlan, RECIPES, validateAnswers } from "../app/recipe-catalog";

type Answers = { people: string; avoids: string[]; time: string };
const EMPTY: Answers = { people: "", avoids: [], time: "" };
const STORAGE_KEY = "menu-low-carb-onboarding-v1";

const questions = [
  {
    eyebrow: "Tu hogar",
    title: "¿Para cuántas personas cocinas?",
    help: "Ajustaremos las porciones para que compres lo necesario.",
    key: "people" as const,
    options: ["1 persona", "2 personas", "3 personas", "4 personas", "5 o más"],
    icon: Users,
  },
  {
    eyebrow: "Tus preferencias",
    title: "¿Qué ingredientes deben quedar fuera?",
    help: "Puedes elegir varios. Si hay una alergia grave, revisa siempre etiquetas y contaminación cruzada.",
    key: "avoids" as const,
    options: ["Ninguno", "Lácteos", "Huevo", "Frutos secos", "Mariscos"],
    icon: ShieldCheck,
  },
  {
    eyebrow: "Tu ritmo",
    title: "¿Cuánto tiempo tienes para la cena?",
    help: "Priorizaremos recetas que encajen en tus noches reales.",
    key: "time" as const,
    options: ["Hasta 20 min", "Hasta 30 min", "Hasta 45 min"],
    icon: Clock3,
  },
];

export default function OnboardingPage() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [online, setOnline] = useState(true);
  const [loadIndex, setLoadIndex] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [swapped, setSwapped] = useState<number[]>([]);

  useEffect(() => {
    const hydrate = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAnswers(parsed.answers ?? EMPTY);
          setStep(Math.min(Number(parsed.step) || 0, 5));
        }
      } catch { localStorage.removeItem(STORAGE_KEY); }
      setOnline(navigator.onLine);
      setHydrated(true);
    });
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.cancelAnimationFrame(hydrate); window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
  }, [answers, step, hydrated]);

  useEffect(() => {
    if (step !== 4 || loadError) return;
    const updates = [900, 1850, 2850].map((delay, index) => window.setTimeout(() => setLoadIndex(index + 1), delay));
    const finish = window.setTimeout(() => setStep(5), reduceMotion ? 1200 : 3900);
    return () => { updates.forEach(clearTimeout); clearTimeout(finish); };
  }, [step, loadError, reduceMotion]);

  const current = questions[step];
  const selected = step < 3 && (current.key === "avoids" ? answers.avoids.length > 0 : Boolean(answers[current.key]));
  const people = answers.people || "tu hogar";
  const loadingLines = useMemo(() => [
    `Ajustando porciones para ${people.toLowerCase()}`,
    answers.avoids.includes("Ninguno") ? "Priorizando ingredientes comunes" : "Quitando los ingredientes que elegiste",
    `Buscando cenas de ${answers.time.toLowerCase() || "preparación sencilla"}`,
    "Organizando tres días y una sola compra",
  ], [answers, people]);
  const previewPlan = useMemo(() => {
    const valid = validateAnswers(answers);
    return derivePersonalizedPlan(valid ?? { people: "4 personas", avoids: ["Ninguno"], time: "Hasta 30 min" });
  }, [answers]);
  const previewMeals = previewPlan.week.slice(0, 3).map((entry, index) => {
    const recipe = RECIPES.find((item) => item.id === entry.recipeId) ?? RECIPES[0];
    const alternativeEntry = previewPlan.week[index + 3] ?? previewPlan.week[0];
    const alternative = RECIPES.find((item) => item.id === alternativeEntry.recipeId) ?? RECIPES[0];
    const day = new Intl.DateTimeFormat("es", { weekday: "long" }).format(new Date(`${entry.date}T12:00:00`));
    return [day[0].toUpperCase() + day.slice(1), recipe.title, `${recipe.minutes} min · ${entry.servings} porciones`, alternative.title];
  });
  const avoidanceLabel = answers.avoids.includes("Ninguno") ? "Sin exclusiones indicadas" : `Sin ${answers.avoids.join(", ").toLowerCase()}`;

  function choose(option: string) {
    if (current.key === "avoids") {
      setAnswers((old) => {
        if (option === "Ninguno") return { ...old, avoids: ["Ninguno"] };
        const withoutNone = old.avoids.filter((item) => item !== "Ninguno");
        return { ...old, avoids: withoutNone.includes(option) ? withoutNone.filter((item) => item !== option) : [...withoutNone, option] };
      });
    } else setAnswers((old) => ({ ...old, [current.key]: option }));
  }

  function reset() {
    setAnswers(EMPTY); setStep(0); setSwapped([]); setLoadError(false);
    localStorage.removeItem(STORAGE_KEY);
  }

  if (!hydrated) {
    return <main className="onboarding-shell paper"><div className="onboarding-boot" role="status"><Utensils/><span>Preparando tus preferencias…</span></div></main>;
  }

  return (
    <main className="onboarding-shell paper">
      <header className="onboarding-nav">
        <Link className="brand" href="/" aria-label="Volver al inicio"><span className="brand-mark"><Utensils/></span><span>Menú Low Carb Latino</span></Link>
        {step < 5 && <span className="save-note"><Check/> Tus respuestas se guardan aquí</span>}
      </header>

      {!online && <div className="offline-banner" role="status"><WifiOff/> Estás sin conexión. Puedes continuar; guardamos todo en este dispositivo.</div>}

      <div className="onboarding-stage">
        {step < 3 && <div className="onboarding-progress" aria-label={`Paso ${step + 1} de 3`}><span>Paso {step + 1} de 3</span><div><i style={{ width: `${((step + 1) / 3) * 100}%` }}/></div></div>}

        <AnimatePresence mode="wait">
          {step < 3 && current && (
            <motion.section className="question-card" key={step} initial={{ opacity: 0, x: reduceMotion ? 0 : 22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reduceMotion ? 0 : -18 }}>
              <span className="question-icon"><current.icon/></span>
              <p className="kicker">{current.eyebrow}</p>
              <h1>{current.title}</h1>
              <p className="question-help">{current.help}</p>
              <div className="choice-grid" role="group" aria-label={current.title}>
                {current.options.map((option, index) => {
                  const active = current.key === "avoids" ? answers.avoids.includes(option) : answers[current.key] === option;
                  return <motion.button key={option} type="button" aria-pressed={active} onClick={() => choose(option)} initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : index * .045 }}><span>{option}</span>{active && <Check/>}</motion.button>;
                })}
              </div>
              <div className="onboarding-actions">
                <button className="back-action" type="button" onClick={() => step === 0 ? location.assign("/") : setStep(step - 1)}><ArrowLeft/> Atrás</button>
                <button className="continue-action" type="button" disabled={!selected} onClick={() => setStep(step + 1)}>Continuar <ArrowRight/></button>
              </div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section className="recognition-card" key="recognition" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="decision-visual" aria-hidden="true"><span>buscar</span><span>comparar</span><span>anotar</span><ArrowRight/><strong>abrir y cocinar</strong></div>
              <p className="kicker">YA HICISTE LO IMPORTANTE</p>
              <h1>No necesitas más disciplina. Necesitas menos decisiones.</h1>
              <p>Con estas tres respuestas podemos preparar una semana que se parezca a tu casa, no a una dieta genérica.</p>
              <button className="continue-action wide" onClick={() => { setLoadIndex(0); setStep(4); }}>Armar mi semana <Sparkles/></button>
              <button className="text-action" onClick={() => setStep(2)}><ArrowLeft/> Cambiar respuestas</button>
            </motion.section>
          )}

          {step === 4 && (
            <motion.section className="loading-card" key="loading" aria-live="polite" aria-busy={!loadError} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {loadError ? <><span className="question-icon error"><RefreshCw/></span><h1>No pudimos terminar tu plan.</h1><p>Tus respuestas están guardadas.</p><button className="continue-action wide" onClick={() => { setLoadIndex(0); setLoadError(false); }}>Intentar de nuevo <RefreshCw/></button></> : <>
                <div className="recipe-loader"><Utensils/></div>
                <p className="kicker">CONSTRUYENDO TU PLAN</p>
                <h1>Tu primera semana está tomando forma.</h1>
                <div className="loading-list">{loadingLines.map((line, index) => <div className={index <= loadIndex ? "done" : ""} key={line}><span>{index < loadIndex ? <Check/> : index === loadIndex ? <Sparkles/> : null}</span>{line}</div>)}</div>
              </>}
            </motion.section>
          )}

          {step === 5 && (
            <motion.section className="preview-card" key="preview" initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }}>
              <div className="preview-celebration"><Sparkles/><span>Tu muestra está preparada</span></div>
              <p className="kicker">TU PRIMERA VICTORIA</p>
              <h1>Tres cenas resueltas para {people.toLowerCase()}.</h1>
              <p className="preview-intro">Sin contar macros. Sin buscar recetas por separado. Y con una compra que reutiliza ingredientes.</p>
              <div className="preference-proof"><Check/> {answers.time} · {avoidanceLabel}</div>
              <div className="meal-preview-list">
                {previewMeals.map(([day, meal, note, alternative], index) => {
                  const isSwapped = swapped.includes(index);
                  return <article key={day}><div className={`meal-orbit orbit-${index}`}><span/></div><div><small>{day}</small><h2>{isSwapped ? alternative : meal}</h2><p>{isSwapped ? `${answers.time.replace("Hasta ", "")} · sustitución compatible` : note}</p></div><button onClick={() => setSwapped((old) => isSwapped ? old.filter((item) => item !== index) : [...old, index])}><RefreshCw/> {isSwapped ? "Deshacer" : "Cambiar"}</button></article>;
                })}
              </div>
              {swapped.length > 0 && <p className="swap-success" role="status"><Check/> Cambio hecho sin rehacer el resto de tu semana.</p>}
              <div className="shopping-summary"><span><ShoppingBasket/></span><div><small>COMPRA RESUMIDA</small><strong>{previewPlan.shoppingItems.length} productos, agrupados por pasillos</strong><p>Vegetales, proteínas y despensa, sin duplicados.</p></div></div>
              <Link className="continue-action wide" href="/paywall">Ver mi semana completa <ArrowRight/></Link>
              <button className="text-action" onClick={reset}>Cambiar mis respuestas</button>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
