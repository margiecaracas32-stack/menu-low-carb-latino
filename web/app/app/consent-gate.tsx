"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

export default function ConsentGate() {
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function continueToApp() {
    if (!accepted || status === "saving") return;
    setStatus("saving");
    const response = await fetch("/api/privacy/consent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accepted: true }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      setMessage(body?.message ?? "No pudimos guardar tu decisión. Inténtalo otra vez.");
      setStatus("error");
      return;
    }
    window.location.reload();
  }

  return <main className="privacy-gate paper">
    <section className="privacy-gate-card">
      <span className="privacy-gate-icon"><ShieldCheck/><Check/></span>
      <p className="kicker">TU INFORMACIÓN, BAJO TU CONTROL</p>
      <h1>Antes de guardar tu semana.</h1>
      <p>Usaremos tu correo, preferencias y actividad necesaria para darte acceso, preparar tus cenas y mantener la app segura.</p>
      <ul><li><Check/> Hotmart gestiona el pago.</li><li><Check/> Supabase guarda tu cuenta y tu semana.</li><li><Check/> Puedes descargar o eliminar tus datos desde la app.</li></ul>
      <label className="privacy-consent"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}/><span>Autorizo el tratamiento necesario de mis datos según la <Link href="/privacidad">Política de privacidad</Link> y acepto los <Link href="/terminos">Términos de servicio</Link>.</span></label>
      {status === "error" && <p className="privacy-gate-error" role="alert">{message}</p>}
      <button className="internal-primary" type="button" disabled={!accepted || status === "saving"} onClick={continueToApp}>{status === "saving" ? "Guardando…" : <>Continuar a mi menú <ArrowRight/></>}</button>
      <Link className="privacy-gate-exit" href="/">Volver sin autorizar</Link>
    </section>
  </main>;
}
