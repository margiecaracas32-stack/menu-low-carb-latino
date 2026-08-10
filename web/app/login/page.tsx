"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Utensils,
  WifiOff,
} from "lucide-react";
import { createSupabaseBrowserClient } from "../../lib/supabase/client";

type Status = "idle" | "sending" | "sent" | "verified" | "error";

export default function LoginPage() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verified") === "1") setStatus("verified");
      if (params.get("access_error") === "1") {
        setStatus("error");
        setMessage("El enlace ya no es válido. Solicita uno nuevo para continuar.");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOnline(navigator.onLine));
    const onOnline = () => {
      setOnline(true);
      if (status === "error") {
        setStatus("idle");
        setMessage("");
      }
    };
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [status]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  async function requestMagicLink() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });

    if (error && (error.status === 429 || (error.status ?? 500) >= 500)) throw error;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!validEmail || status === "sending") return;
    if (!online) {
      setStatus("error");
      setMessage("No pudimos enviar el enlace. Recupera tu conexión e intenta de nuevo; tu semana sigue guardada.");
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      await requestMagicLink();
      setStatus("sent");
      setCountdown(60);
    } catch {
      setStatus("error");
      setMessage("No pudimos enviar el enlace ahora. Espera un momento e inténtalo de nuevo.");
    }
  }

  async function resend() {
    if (countdown > 0 || !online) return;
    setStatus("sending");
    try {
      await requestMagicLink();
      setStatus("sent");
      setCountdown(60);
    } catch {
      setStatus("error");
      setMessage("No pudimos reenviar el enlace. Espera un momento e inténtalo de nuevo.");
    }
  }

  return (
    <main className="login-shell paper">
      <header className="login-nav">
        <Link className="brand" href="/"><span className="brand-mark"><Utensils/></span><span>Menú Low Carb Latino</span></Link>
        <Link className="login-back" href="/paywall"><ArrowLeft/> Volver a los planes</Link>
      </header>

      {!online && <div className="offline-banner" role="status"><WifiOff/> Estás sin conexión. Tu formulario y tu semana permanecen aquí.</div>}

      <div className="login-layout">
        <motion.aside className="login-keepsake" initial={{ opacity: 0, x: reduceMotion ? 0 : -12 }} animate={{ opacity: 1, x: 0 }}>
          <div className="keepsake-plate"><CalendarCheck/></div>
          <p className="kicker">TU SEMANA TE ESPERA</p>
          <h2>Lo que elegiste no vuelve a empezar de cero.</h2>
          <div className="saved-week" aria-label="Siete días guardados">
            {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <span key={`${day}-${index}`}><Check/><b>{day}</b></span>)}
          </div>
          <ul><li><Check/> Tus siete cenas</li><li><Check/> Tu lista de compras</li><li><Check/> Tus cambios y preferencias</li></ul>
        </motion.aside>

        <AnimatePresence mode="wait">
          {status === "verified" ? (
            <motion.section className="login-card sent-card" key="verified" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="sent-icon"><ShieldCheck/><Check/></span>
              <p className="kicker">ACCESO VERIFICADO</p>
              <h1>Tu sesión está protegida.</h1>
              <p className="login-intro">Confirmamos tu correo y guardamos la sesión de forma segura. Tu semana estará disponible al entrar al producto.</p>
              <Link className="login-primary" href="/app">Entrar a mi menú <ArrowRight/></Link>
            </motion.section>
          ) : status !== "sent" ? (
            <motion.section className="login-card" key="form" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="login-icon"><LockKeyhole/></span>
              <p className="kicker">ACCESO SIN CONTRASEÑA</p>
              <h1>Entra a tu semana resuelta.</h1>
              <p className="login-intro">Usa el correo de tu compra para guardar el plan y verlo en cualquier dispositivo.</p>

              <form onSubmit={submit} noValidate>
                <label htmlFor="access-email">Correo electrónico</label>
                <div className={`email-field ${status === "error" ? "has-error" : ""}`}><Mail/><input id="access-email" type="email" inputMode="email" autoComplete="email" autoFocus value={email} onChange={(event) => { setEmail(event.target.value); if (status === "error") { setStatus("idle"); setMessage(""); } }} placeholder="tu@correo.com" aria-describedby="email-help login-error" aria-invalid={status === "error"}/></div>
                <p id="email-help" className="field-help">Debe ser el mismo correo que usaste en Hotmart.</p>
                {status === "error" && <p id="login-error" className="login-error" role="alert">{message}</p>}
                <button className="login-primary" disabled={!validEmail || status === "sending"} type="submit">{status === "sending" ? <><span className="button-loader"/> Enviando enlace…</> : <>Enviarme mi enlace de acceso <ArrowRight/></>}</button>
              </form>

              <p className="passwordless-note"><ShieldCheck/> Sin contraseñas: recibirás un enlace de un solo uso.</p>
            </motion.section>
          ) : (
            <motion.section className="login-card sent-card" key="sent" initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}>
              <span className="sent-icon"><Mail/><Check/></span>
              <p className="kicker">ENLACE SOLICITADO</p>
              <h1>Revisa tu correo.</h1>
              <p className="login-intro">Si existe una compra asociada, recibirás un enlace de acceso en:</p>
              <strong className="sent-email">{email}</strong>
              <div className="sent-instructions"><span>1</span><p><b>Abre el mensaje</b>Busca “Tu acceso a Menú Low Carb Latino”.</p><span>2</span><p><b>Toca el enlace</b>Es de un solo uso y abre tu semana guardada.</p></div>
              <button className="resend-button" type="button" disabled={countdown > 0 || !online} onClick={resend}>{countdown > 0 ? `Reenviar en ${countdown}s` : <><RefreshCw/> Reenviar enlace</>}</button>
              <button className="change-email" type="button" onClick={() => { setStatus("idle"); setCountdown(0); }}>Usar otro correo</button>
              <p className="demo-auth-note">Por seguridad, mostramos esta misma confirmación exista o no una cuenta asociada.</p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
