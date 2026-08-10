"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  ShoppingBasket,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  HeartHandshake,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Utensils,
  WalletCards,
} from "lucide-react";

const screens = [
  { id: "hoy", label: "Hoy", title: "Pollo guisado con calabacín", meta: "25 min · rinde 4" },
  { id: "semana", label: "Semana", title: "Siete cenas, una decisión", meta: "Platos familiares y variados" },
  { id: "compras", label: "Compras", title: "18 productos por pasillos", meta: "Una lista, sin duplicados" },
  { id: "cambio", label: "Sustituir", title: "Cambia sin romper el plan", meta: "Alternativas compatibles" },
];

const faqs = [
  ["¿Cuánto tiempo necesito para usarla?", "Eliges tres cosas y recibes tu semana. Después, abres Hoy y cocinas."],
  ["¿Y si vuelvo a abandonar otra app?", "Esta reduce decisiones: no exige registrar macros ni planificar cada noche."],
  ["¿Las recetas las inventa una IA?", "No. El menú usa recetas curadas y reglas revisadas; puedes cambiar cualquier plato."],
  ["¿Mi familia tendrá que comer comida de dieta?", "Los platos son familiares y las porciones se ajustan al tamaño de tu hogar."],
  ["¿Usa ingredientes caros o difíciles?", "Prioriza ingredientes comunes y propone alternativas regionales cuando hacen falta."],
  ["¿Cuándo se cobra y cómo cancelo?", "Verás fecha y monto antes de empezar. Puedes cancelar antes del cobro."],
];

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AppPhone({ screen = 0 }: { screen?: number }) {
  const current = screens[screen];
  return (
    <div className="phone" aria-label={`Vista demostrativa: ${current.label}`}>
      <div className="phone-status"><span>9:41</span><span>•••</span></div>
      <div className="phone-body">
        <div className="phone-top"><span>Hola, Ana</span><span className="streak"><Sparkles size={13}/> 5 cenas resueltas</span></div>
        <p className="phone-kicker">{current.label} · Método Semana Resuelta</p>
        <h3>{current.title}</h3>
        <div className={`meal-art meal-art-${current.id} ${current.id === "hoy" ? "meal-art-real" : ""}`} aria-hidden="true">
          {current.id === "hoy" ? <Image src="/images/pollo-calabacin.jpeg" alt="" width={386} height={514}/> : <><span/><i/><b/></>}
        </div>
        <p className="phone-meta">{current.meta}</p>
        {current.id === "hoy" && <button className="phone-action">Ver receta <ArrowRight size={15}/></button>}
        {current.id === "semana" && <div className="week-list"><span>Mar · Pollo guisado</span><span>Mié · Picadillo low carb</span><span>Jue · Chuletas con repollo</span></div>}
        {current.id === "compras" && <div className="shop-list"><span><Check/> Aguacate y vegetales</span><span><Check/> Carnes y pescado</span><span><Check/> Despensa</span></div>}
        {current.id === "cambio" && <div className="swap-card"><RefreshCw/><span><b>¿No se te antoja?</b>Cambia por pescado al mojo.</span></div>}
      </div>
      <div className="phone-nav"><span className={screen===0?"active":""}><Utensils/>Hoy</span><span className={screen===1?"active":""}><CalendarDays/>Semana</span><span className={screen===2?"active":""}><ShoppingBasket/>Compras</span><span className={screen===3?"active":""}><RefreshCw/>Cambiar</span></div>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState(0);
  const [faq, setFaq] = useState(0);
  const [sticky, setSticky] = useState(false);
  const heroCta = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("code")) {
      window.location.replace(`/auth/callback?${params.toString()}`);
    }
  }, []);

  useEffect(() => {
    const node = heroCta.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setSticky(!entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <header className="site-nav">
        <a className="brand" href="#inicio"><Image className="brand-logo" src="/brand/isotipo-v2.png" alt="" width={64} height={64}/><span>Menú Low Carb Latino</span></a>
        <a className="nav-link" href="#oferta">Ver planes</a>
      </header>

      <section className="hero paper" id="inicio">
        <div className="hero-copy">
          <p className="kicker">MENOS DECISIONES · MÁS MESA</p>
          <h1>Tu menú y compra semanal, listos en <em>tres elecciones.</em></h1>
          <p className="subhead">Platos latinos familiares, menos carbohidratos y una sola compra organizada.</p>
          <a className="primary-cta" href="/onboarding" ref={heroCta}>Crear mi semana gratis <ArrowRight/></a>
          <p className="cta-note"><ShieldCheck/> Sin tarjeta ahora · Verás el plan antes de pagar</p>
        </div>
        <div className="hero-visual"><div className="plate-sun"/><AppPhone/></div>
      </section>

      <section className="section elevated" id="problema">
        <Reveal className="section-head"><p className="kicker">¿TE SUENA?</p><h2>No te faltan recetas. Te sobran decisiones.</h2></Reveal>
        <div className="pain-grid">
          {[
            [Clock3,"¿Llegas cansada y todavía debes decidir la cena?"],
            [RefreshCw,"¿Terminas repitiendo los mismos cuatro platos?"],
            [WalletCards,"¿Compras sin plan y vuelves a pedir comida?"],
            [ListChecks,"¿Guardas recetas que nunca vuelves a encontrar?"],
          ].map(([Icon,text],i)=><Reveal className="pain-card" key={i}><span className="icon-chip"><Icon/></span><p>{text as string}</p></Reveal>)}
        </div>
        <Reveal className="agitation"><span className="agitation-number">7</span><div><h3>decisiones nuevas cada semana</h3><p>Y cada noche empieza otra vez desde cero.</p></div></Reveal>
      </section>

      <section className="section solution" id="metodo">
        <Reveal className="section-head"><p className="kicker">EL MECANISMO</p><h2>El Método Semana Resuelta</h2><p>Tú marcas lo importante. La app organiza lo demás.</p></Reveal>
        <div className="steps">
          {[
            ["01","Elige tu hogar",HeartHandshake,"Porciones, preferencias y alimentos que evitas."],
            ["02","Recibe tu semana",CalendarDays,"Siete platos familiares con ingredientes que se reutilizan."],
            ["03","Cambia lo que quieras",RefreshCw,"Una alternativa compatible, sin rehacer todo el plan."],
          ].map(([n,t,Icon,d])=><Reveal className="step" key={n as string}><span className="step-number">{n as string}</span><span className="icon-chip"><Icon/></span><h3>{t as string}</h3><p>{d as string}</p></Reveal>)}
        </div>
        <div className="contrast"><span>Antes: buscar, comparar, anotar.</span><ArrowRight/><strong>Después: abrir Hoy y cocinar.</strong></div>
      </section>

      <section className="section product elevated" id="producto">
        <Reveal className="section-head"><p className="kicker">LA APP POR DENTRO</p><h2>Menos botones. Más respuestas.</h2><p>Una demostración honesta del producto que construiremos.</p></Reveal>
        <div className="product-showcase">
          <div className="screen-tabs" role="tablist" aria-label="Pantallas de la app">
            {screens.map((item,index)=><button role="tab" aria-selected={screen===index} onClick={()=>setScreen(index)} key={item.id}>{item.label}</button>)}
          </div>
          <AppPhone screen={screen}/>
          <div className="screen-copy"><span className="icon-chip"><Sparkles/></span><h3>{screens[screen].title}</h3><p>{screens[screen].meta}. Sin contar macros ni llenar diarios.</p><div className="dots">{screens.map((_,i)=><button aria-label={`Ver pantalla ${i+1}`} className={screen===i?"active":""} onClick={()=>setScreen(i)} key={i}/>)}</div></div>
        </div>
        <a className="secondary-cta" href="/onboarding">Crear mi semana gratis <ArrowRight/></a>
      </section>

      <section className="section pricing" id="oferta">
        <Reveal className="section-head"><p className="kicker">LA OFERTA</p><h2>Una compra organizada cuesta menos que improvisar.</h2><p>Empieza con siete días. Verás fecha y monto antes del cobro.</p></Reveal>
        <Reveal className="value-stack">
          <p className="stack-title">Todo lo que incluye tu plan</p>
          <div><Check/><span>12 meses de menús y compras organizadas</span></div>
          <div><Check/><span>Sustituciones y preferencias aprendidas</span></div>
          <div><Check/><span>Alternativas regionales de ingredientes</span></div>
        </Reveal>
        <div className="plans">
          <Reveal className="plan recommended"><span className="plan-badge">RECOMENDADO · 7 DÍAS GRATIS</span><h3>Anual</h3><div className="price"><b>US$5.83</b><span>/mes</span></div><p>US$69.90 al año · 2 meses gratis</p><ul><li><Check/>Semana completa</li><li><Check/>Lista de compras</li><li><Check/>Cambios y favoritos</li></ul><a className="primary-cta" href="/onboarding">Crear mi semana gratis</a></Reveal>
          <Reveal className="plan"><span className="plan-badge neutral">7 DÍAS GRATIS</span><h3>Mensual</h3><div className="price"><b>US$6.99</b><span>/mes</span></div><p>Flexibilidad mes a mes</p><ul><li><Check/>Mismas funciones</li><li><Check/>Cancela cuando quieras</li><li><Check/>Sin permanencia</li></ul><a className="plan-cta" href="/onboarding">Probar el plan mensual</a></Reveal>
        </div>
        <p className="price-disclaimer">Precios propuestos sujetos a validación. No se cobra en esta página.</p>
      </section>

      <section className="guarantee elevated">
        <Reveal className="guarantee-inner"><span className="seal"><ShieldCheck/></span><div><p className="kicker">SEMANA SIN SORPRESAS</p><h2>Sabrás cuánto y cuándo antes de empezar.</h2><p>Cancela antes del fin de la prueba y no habrá cobro.</p></div></Reveal>
      </section>

      <section className="section faq" id="preguntas">
        <Reveal className="section-head"><p className="kicker">PREGUNTAS REALES</p><h2>Lo que querrías saber antes de probar.</h2></Reveal>
        <div className="faq-list">{faqs.map(([q,a],i)=><div className="faq-item" key={q}><button aria-expanded={faq===i} onClick={()=>setFaq(faq===i?-1:i)}><span>{q}</span><ChevronDown/></button>{faq===i&&<motion.p initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}>{a}</motion.p>}</div>)}</div>
      </section>

      <section className="final-cta">
        <Reveal><div className="mini-plate"/><p className="kicker">TU PRÓXIMO LUNES</p><h2>Abre la app. Tu semana ya está resuelta.</h2><p>Menos búsqueda. Una sola compra. Cenas que tu familia reconoce.</p><a className="light-cta" href="/onboarding">Crear mi semana gratis <ArrowRight/></a><small>PS: prueba siete días y conoce el Método Semana Resuelta antes del primer cobro.</small></Reveal>
      </section>

      <footer><div><a href="/privacidad">Privacidad</a><a href="/terminos">Términos</a><a href="/reembolso">Reembolso</a><a href="/disclaimer">Disclaimer</a></div><p>© 2026 Menú Low Carb Latino</p></footer>

      <motion.div className="sticky-cta" initial={false} animate={{y:sticky?0:96}} transition={{duration:.25}}><a href="#oferta">Ver prueba y precios <ArrowRight/></a></motion.div>
    </main>
  );
}
