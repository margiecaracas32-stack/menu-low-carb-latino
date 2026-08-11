"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  LockKeyhole,
  RefreshCw,
  ShoppingBasket,
  Utensils,
  WifiOff,
  X,
} from "lucide-react";
import { currentAnalyticsSource, isAnalyticsQaSession, track } from "../../lib/analytics";

type Plan = "annual" | "monthly";
type CheckoutState = "idle" | "loading" | "error";
type SavedAnswers = { people?: string; avoids?: string[]; time?: string };

const CHECKOUT_URLS: Record<Plan, string> = {
  monthly: "https://pay.hotmart.com/R107087996E?off=2yk1rcvg",
  annual: "https://pay.hotmart.com/R107087996E?off=1x7js0ul",
};
const ANONYMOUS_ID_KEY = "menu-low-carb-anonymous-id-v1";
const CHECKOUT_ATTEMPT_KEY = "menu-low-carb-checkout-attempt-v1";

const benefits = [
  [CalendarDays, "Siete cenas familiares", "Tu semana completa, no recetas sueltas."],
  [ShoppingBasket, "Una compra organizada", "Cantidades para tu hogar, sin duplicados."],
  [RefreshCw, "Cambios sin empezar de cero", "Sustituye un plato y conserva el plan."],
] as const;

export default function PaywallPage() {
  const reduceMotion = useReducedMotion();
  const [plan, setPlan] = useState<Plan>("annual");
  const [answers, setAnswers] = useState<SavedAnswers>({});
  const [hydrated, setHydrated] = useState(false);
  const [online, setOnline] = useState(true);
  const [checkout, setCheckout] = useState<CheckoutState>("idle");
  const [restoreMessage, setRestoreMessage] = useState("");
  const offerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hydrationFrame = window.requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem("menu-low-carb-onboarding-v1");
        if (saved) setAnswers(JSON.parse(saved).answers ?? {});
      } catch { setAnswers({}); }
      setOnline(navigator.onLine);
      setHydrated(true);
    });
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onPageShow = () => {
      setCheckout("idle");
      const saved = sessionStorage.getItem(CHECKOUT_ATTEMPT_KEY);
      if (!saved) return;
      try {
        const attempt = JSON.parse(saved) as { plan?: Plan; startedAt?: number };
        if (attempt.plan && Number(attempt.startedAt) > Date.now() - 2 * 60 * 60 * 1000) {
          track("checkout_regresado", { plan_elegido: attempt.plan }, `checkout-returned:${attempt.startedAt}`);
        }
      } catch { /* Invalid local state is ignored. */ }
      sessionStorage.removeItem(CHECKOUT_ATTEMPT_KEY);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.cancelAnimationFrame(hydrationFrame);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    track("paywall_renderizado", { plan_elegido: plan }, "paywall-rendered");
    const node = offerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      track("paywall_visto", { plan_elegido: plan }, "paywall-viewed");
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hydrated, plan]);

  const chargeDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "long", year: "numeric" }).format(date);
  }, []);
  const reminderDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 6);
    return new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(date);
  }, []);

  const household = answers.people ? `para ${answers.people.toLowerCase()}` : "para tu hogar";
  const time = answers.time?.replace("Hasta ", "cenas de ") ?? "cenas sencillas";
  const chargeAmount = plan === "annual" ? "US$69.90 al año" : "US$6.99 al mes";

  function startCheckout() {
    if (!online) { setCheckout("error"); return; }
    setCheckout("loading");
    try {
      let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
      if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
      }
      const checkoutUrl = new URL(CHECKOUT_URLS[plan]);
      const source = isAnalyticsQaSession() ? "qa" : currentAnalyticsSource();
      checkoutUrl.searchParams.set("src", source);
      checkoutUrl.searchParams.set("sck", anonymousId);
      const startedAt = Date.now();
      sessionStorage.setItem(CHECKOUT_ATTEMPT_KEY, JSON.stringify({ plan, startedAt }));
      track("checkout_iniciado", { plan_elegido: plan }, `checkout:${startedAt}`);
      window.location.assign(checkoutUrl.toString());
    } catch {
      setCheckout("error");
    }
  }

  if (!hydrated) return <main className="paywall-shell paper"><div className="onboarding-boot" role="status"><Utensils/><span>Preparando tus planes…</span></div></main>;

  return (
    <main className="paywall-shell paper">
      <header className="paywall-nav">
        <Link className="brand" href="/"><span className="brand-mark"><Utensils/></span><span>Menú Low Carb Latino</span></Link>
        <Link className="paywall-close" href="/onboarding" aria-label="Cerrar y volver a mi muestra"><X/></Link>
      </header>

      {!online && <div className="offline-banner" role="status"><WifiOff/> Necesitas conexión para abrir el pago. Tu muestra sigue guardada.</div>}

      <section className="paywall-layout">
        <motion.div className="paywall-story" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="kicker">TU SEMANA COMPLETA</p>
          <h1>De tres cenas a una semana <em>sin improvisar.</em></h1>
          <p className="paywall-subhead">Desbloquea siete cenas {household}, {time} y una sola compra organizada.</p>

          <div className="unlock-visual" aria-label="Tres días visibles y cuatro días que se desbloquean con el plan">
            <div className="unlock-days">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <span className={index < 3 ? "visible" : "locked"} key={`${day}-${index}`}>{index < 3 ? <Check/> : <LockKeyhole/>}<b>{day}</b></span>)}
            </div>
            <div className="unlock-copy"><strong>Ya resolviste 3 cenas.</strong><span>Pro abre los otros 4 días y completa la compra.</span></div>
          </div>

          <div className="paywall-benefits">
            {benefits.map(([Icon, title, copy], index) => <motion.div key={title} initial={{ opacity: 0, x: reduceMotion ? 0 : -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduceMotion ? 0 : .08 + index * .06 }}><span><Icon/></span><p><strong>{title}</strong>{copy}</p></motion.div>)}
          </div>
        </motion.div>

        <motion.aside ref={offerRef} className="offer-card" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduceMotion ? 0 : .18 }}>
          <p className="offer-eyebrow">ELIGE CÓMO CONTINUAR</p>
          <div className="plan-options" role="radiogroup" aria-label="Duración del plan">
            <button type="button" role="radio" aria-checked={plan === "annual"} onClick={() => { setPlan("annual"); track("paywall_plan_elegido", { plan_elegido: "annual" }, "plan:annual"); }}>
              <span className="saving-badge">2 MESES GRATIS</span>
              <span className="plan-name"><b>Anual</b><small>Mejor valor</small></span>
              <span className="plan-price"><b>US$5.83</b><small>/mes</small></span>
              <span className="plan-total">Después de la prueba: US$69.90 al año</span>
            </button>
            <button type="button" role="radio" aria-checked={plan === "monthly"} onClick={() => { setPlan("monthly"); track("paywall_plan_elegido", { plan_elegido: "monthly" }, "plan:monthly"); }}>
              <span className="plan-name"><b>Mensual</b><small>Flexibilidad mes a mes</small></span>
              <span className="plan-price"><b>US$6.99</b><small>/mes</small></span>
              <span className="plan-total">Después de la prueba: US$6.99 al mes</span>
            </button>
          </div>

          <button className="checkout-cta" type="button" onClick={startCheckout} disabled={checkout === "loading"}>{checkout === "loading" ? <><span className="button-loader"/> Abriendo Hotmart…</> : <>Empezar mis 7 días gratis <ArrowRight/></>}</button>
          <p className="checkout-truth">Hoy no pagas nada · Cancela antes del cobro sin costo</p>

          <div className="trial-timeline" aria-label="Cómo funcionan los siete días de prueba">
            <div><i/><p><strong>Hoy — acceso completo</strong><span>No pagas nada y abres los siete días.</span></p></div>
            <div><i/><p><strong>{reminderDate} — te avisamos</strong><span>Un día antes de cualquier cobro.</span></p></div>
            <div><i/><p><strong>{chargeDate} — primer cobro</strong><span>{chargeAmount}. Cancela antes sin costo.</span></p></div>
          </div>

          <Link className="not-now" href="/onboarding">Ahora no, volver a mi muestra</Link>
          <button className="restore-purchase" type="button" onClick={() => setRestoreMessage("Usa el mismo correo de tu compra para recuperar el acceso.")}>Restaurar compra</button>
          {restoreMessage && <p className="restore-message" role="status">{restoreMessage}</p>}
        </motion.aside>
      </section>

      <AnimatePresence>
        {checkout === "error" && <motion.div className="checkout-overlay" role="dialog" aria-modal="true" aria-labelledby="checkout-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="checkout-dialog" initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }} animate={{ opacity: 1, y: 0 }}>
            <button className="dialog-close" onClick={() => setCheckout("idle")} aria-label="Cerrar"><X/></button>
            <span className="dialog-icon error"><WifiOff/></span><h2 id="checkout-title">No pudimos abrir el pago.</h2><p>Comprueba tu conexión. No se realizó ningún cobro y tu plan sigue guardado.</p><button className="checkout-cta" onClick={() => { setOnline(navigator.onLine); startCheckout(); }}>Intentar de nuevo <RefreshCw/></button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
