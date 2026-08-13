"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Image from "next/image";
import {
  AlertTriangle, ArrowDownRight, ArrowRight, Bot, BrainCircuit, CheckCircle2,
  CircleDollarSign, Clock3, CreditCard, DollarSign, ExternalLink, HeartPulse,
  Ban, CalendarDays, Menu, MessageCircle, ReceiptText, RefreshCw, Send, ShieldCheck, Sparkles,
  TriangleAlert, UserCheck, UserPlus, Users, WalletCards, X, Zap,
} from "lucide-react";
import type { AdminDashboardData, AdminSection, Notice } from "./admin-data";

type Props = {
  data: AdminDashboardData;
  initialSection: AdminSection;
  previewMode?: boolean;
  manualAccessConfigured?: boolean;
};

const NAV: Array<{ id: AdminSection; label: string; short: string; icon: typeof DollarSign }> = [
  { id: "profit", label: "Ganancia real", short: "Ganancia", icon: CircleDollarSign },
  { id: "sales", label: "Ventas", short: "Ventas", icon: CreditCard },
  { id: "users", label: "Usuarios", short: "Usuarios", icon: Users },
  { id: "errors", label: "Errores", short: "Errores", icon: HeartPulse },
  { id: "ai", label: "Costo de IA", short: "IA", icon: BrainCircuit },
];

const SECTION_COPY: Record<AdminSection, { eyebrow: string; title: string; description: string }> = {
  profit: { eyebrow: "1 · DINERO QUE QUEDA", title: "Ganancia real", description: "Lo cobrado, lo gastado y lo que realmente queda en el negocio." },
  sales: { eyebrow: "2 · INGRESOS RECURRENTES", title: "Ventas", description: "Compras, pruebas, cancelaciones y señales de crecimiento saludable." },
  users: { eyebrow: "3 · PERSONAS Y VALOR", title: "Usuarios", description: "Quién llega, quién obtiene valor y quién vuelve después." },
  errors: { eyebrow: "4 · SALUD DEL PRODUCTO", title: "Errores", description: "Problemas que afectan clientes, pagos o el funcionamiento de la app." },
  ai: { eyebrow: "5 · COSTO VARIABLE", title: "Costo de IA", description: "Cuánto cuesta cada función inteligente y si sigue siendo rentable." },
};

function formatMoney(value: number | null, currency: string | null, minor = true) {
  if (value == null || !currency) return "No medido";
  return new Intl.NumberFormat("es-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(minor ? value / 100 : value);
}

function formatNumber(value: number | null) {
  return value == null ? "No medido" : new Intl.NumberFormat("es-US").format(value);
}

function formatPercent(value: number | null) {
  return value == null ? "No medido" : `${new Intl.NumberFormat("es-US", { maximumFractionDigits: 1 }).format(value * 100)}%`;
}

function formatMonths(value: number | null) {
  return value == null ? "No medido" : `${value.toFixed(1)} meses`;
}

export default function AdminDashboard({ data, initialSection, previewMode = false, manualAccessConfigured = false }: Props) {
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [mobileMenu, setMobileMenu] = useState(false);
  const copy = SECTION_COPY[section];

  function changeSection(next: AdminSection) {
    setSection(next);
    setMobileMenu(false);
    const url = new URL(window.location.href);
    url.searchParams.set("section", next);
    window.history.replaceState({}, "", url);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileMenu ? "is-open" : ""}`}>
        <div className="admin-brand">
          <Image src="/brand/isotipo-v2.png" alt="" width={64} height={64}/>
          <div><strong>Menú Low Carb</strong><span>Centro de control</span></div>
          <button type="button" className="admin-menu-close" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú"><X/></button>
        </div>
        <nav aria-label="Secciones administrativas">
          {NAV.map(({ id, label, icon: Icon }, index) => <button key={id} type="button" aria-current={section === id ? "page" : undefined} onClick={() => changeSection(id)}>
            <span>{index + 1}</span><Icon aria-hidden="true"/><b>{label}</b>{section === id && <ArrowRight aria-hidden="true"/>}
          </button>)}
        </nav>
        <div className="admin-owner-lock"><ShieldCheck/><div><strong>Solo propietario</strong><span>Identidad y rol verificados en el servidor.</span></div></div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <button className="admin-menu-open" type="button" onClick={() => setMobileMenu(true)} aria-label="Abrir menú"><Menu/></button>
          <div><span>Panel privado</span><b>Este mes</b></div>
          <a href="/app" className="admin-back-link">Volver a la app <ArrowRight/></a>
        </header>

        <main className="admin-main">
          {previewMode && <div className="admin-preview-note"><Sparkles/><span><b>Vista local segura.</b> En producción esta ruta exige una cuenta con rol de administrador.</span></div>}
          <NoticeStack notices={data.notices}/>
          <header className="admin-page-heading">
            <div><p>{copy.eyebrow}</p><h1>{copy.title}</h1><span>{copy.description}</span></div>
            <div className="admin-data-state"><span className={data.sourceReady ? "ready" : "pending"}/><div><b>{data.sourceReady ? "Fuentes conectadas" : "Fuentes pendientes"}</b><small>Actualizado {new Intl.DateTimeFormat("es", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(new Date(data.generatedAt))}</small></div></div>
          </header>

          <div key={section} className="admin-section">
              {section === "profit" && <ProfitSection data={data}/>} 
              {section === "sales" && <SalesSection data={data}/>} 
              {section === "users" && <UsersSection data={data} manualAccessConfigured={manualAccessConfigured}/>} 
              {section === "errors" && <ErrorsSection data={data}/>} 
              {section === "ai" && <AiSection data={data}/>} 
          </div>
        </main>

        <nav className="admin-mobile-nav" aria-label="Secciones administrativas móviles">
          {NAV.map(({ id, short, icon: Icon }) => <button key={id} type="button" aria-current={section === id ? "page" : undefined} onClick={() => changeSection(id)}><Icon/><span>{short}</span></button>)}
        </nav>
      </div>
    </div>
  );
}

function NoticeStack({ notices }: { notices: Notice[] }) {
  return <section className="admin-notices" aria-label="Avisos importantes">{notices.map((notice, index) => {
    const Icon = notice.level === "ok" ? CheckCircle2 : notice.level === "info" ? Clock3 : notice.level === "critical" ? TriangleAlert : AlertTriangle;
    return <article key={`${notice.title}-${index}`} data-level={notice.level}><Icon/><div><strong>{notice.title}</strong><p>{notice.detail}</p><span>{notice.action}</span></div></article>;
  })}</section>;
}

function MetricCard({ label, value, detail, icon: Icon, tone = "neutral", featured = false }: { label: string; value: string; detail: string; icon?: typeof DollarSign; tone?: "neutral" | "positive" | "warning"; featured?: boolean }) {
  const missing = value === "No medido";
  return <article className="admin-metric" data-tone={tone} data-missing={missing} data-featured={featured}><header><span>{label}</span>{Icon && <Icon/>}</header><strong>{value}</strong><p>{detail}</p></article>;
}

function EmptyData({ title, children }: { title: string; children: ReactNode }) {
  return <div className="admin-empty"><Clock3/><div><strong>{title}</strong><p>{children}</p></div></div>;
}

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return <header className="admin-block-title"><div><p>{eyebrow}</p><h2>{title}</h2></div>{action}</header>;
}

function ProfitSection({ data }: { data: AdminDashboardData }) {
  const profit = data.profit;
  const real = profit.netProfit != null && profit.reconciled;
  return <>
    <section className="admin-profit-hero" data-measured={real}>
      <div><p>{real ? "RESULTADO CONCILIADO" : "RESULTADO PENDIENTE"}</p><h2>{real ? <>Facturaste <b>{formatMoney(profit.revenue, data.currency)}</b> y te quedaron <em>{formatMoney(profit.netProfit, data.currency)}</em> limpios.</> : <>La ganancia aparecerá cuando existan cobros y costos conciliados.</>}</h2><span>{real ? `Margen real de ${formatPercent(profit.margin)} este mes.` : "No mostraremos una estimación como si fuera dinero real."}</span></div>
      <div className="admin-profit-stamp"><WalletCards/><span>{real ? "GANANCIA REAL" : "NO MEDIDO"}</span></div>
    </section>

    <div className="admin-metric-grid four">
      <MetricCard label="Ingresos" value={formatMoney(profit.revenue, data.currency)} detail="Cobros menos reembolsos." icon={ReceiptText}/>
      <MetricCard label="Dinero que queda" value={formatMoney(profit.netProfit, data.currency)} detail="Después de todos los costos." icon={DollarSign} tone="positive"/>
      <MetricCard label="Margen" value={formatPercent(profit.margin)} detail="Qué porcentaje realmente queda." icon={Sparkles}/>
      <MetricCard label="Recuperar la inversión" value={formatMonths(profit.paybackMonths)} detail="Tiempo para recuperar el costo de conseguir cada cliente." icon={Clock3}/>
    </div>

    <section className="admin-card admin-breakdown">
      <SectionTitle eyebrow="DE BRUTO A LIMPIO" title="Cada dólar explicado"/>
      <div className="admin-breakdown-row hero"><span>Ingresos del mes</span><b>{formatMoney(profit.revenue, data.currency)}</b></div>
      {[
        ["Tarifa de Hotmart", profit.providerFees], ["Comisiones de afiliados", profit.affiliateFees],
        ["Impuestos y retenciones", profit.taxes], ["Costo de IA", profit.aiCost],
        ["Infraestructura", profit.infrastructure], ["Email", profit.email],
      ].map(([label, value]) => <div className="admin-breakdown-row" key={String(label)}><span><ArrowDownRight/>{label}</span><b>{formatMoney(value as number | null, data.currency)}</b></div>)}
      <div className="admin-breakdown-row total"><span>Lo que queda</span><b>{formatMoney(profit.netProfit, data.currency)}</b></div>
    </section>

    <section>
      <SectionTitle eyebrow="CRECIMIENTO RENTABLE" title="Economía por cliente y canal"/>
      <div className="admin-metric-grid four compact">
        <MetricCard label="Valor total por cliente" value={formatMoney(profit.ltv, data.currency)} detail="Lo que aporta durante toda su suscripción."/>
        <MetricCard label="Costo por nuevo cliente" value={formatMoney(profit.cac, data.currency)} detail="Lo invertido para conseguirlo."/>
        <MetricCard label="Valor por cada $1 invertido" value={profit.ltvCacRatio == null ? "No medido" : `${profit.ltvCacRatio.toFixed(1)} : 1`} detail="Umbral configurado: 3 : 1 o más."/>
        <MetricCard label="Tiempo para recuperar" value={formatMonths(profit.paybackMonths)} detail="Meta configurada: menos de 6 meses."/>
      </div>
      <div className="admin-card admin-table-card">
        {profit.byChannel.length ? <table><caption>Ganancia por canal</caption><thead><tr><th>Canal</th><th>Ingresos</th><th>Gasto</th><th>Resultado</th></tr></thead><tbody>{profit.byChannel.map((row) => <tr key={row.channel}><th>{row.channel}</th><td>{formatMoney(row.revenue, data.currency)}</td><td>{formatMoney(row.spend, data.currency)}</td><td>{formatMoney(row.profit, data.currency)}</td></tr>)}</tbody></table> : <EmptyData title="Ganancia por canal no medida">Necesitamos el origen de las ventas y el gasto de adquisición para saber qué canal conviene escalar.</EmptyData>}
      </div>
    </section>
  </>;
}

function SalesSection({ data }: { data: AdminDashboardData }) {
  const sales = data.sales;
  return <>
    <div className="admin-metric-grid four decision">
      <MetricCard label="Ingreso mensual de suscripciones" value={formatMoney(sales.mrr, data.currency)} detail="Planes mensuales y parte mensual de los anuales." icon={RefreshCw} featured/>
      <MetricCard label="Compras" value={formatNumber(sales.purchases)} detail="Cobros confirmados este mes." icon={CreditCard}/>
      <MetricCard label="Pruebas iniciadas" value={formatNumber(sales.trials)} detail="Confirmadas por el proveedor de pago." icon={Clock3}/>
      <MetricCard label="Prueba → pago" value={formatPercent(sales.trialToPaid)} detail="Conversión después del período gratuito." icon={Zap}/>
    </div>
    <section className="admin-card">
      <SectionTitle eyebrow="EVOLUCIÓN" title="Ingresos de los últimos meses"/>
      {sales.trend.length ? <BarChart points={sales.trend} currency={data.currency}/> : <EmptyData title="Todavía no hay una tendencia">El gráfico comenzará con el primer cobro real y nunca usará datos de demostración.</EmptyData>}
    </section>
    <section className="admin-churn-grid">
      <article className="admin-card admin-churn-total"><p>CANCELACIONES</p><strong>{formatNumber(sales.cancellations)}</strong><span>Porcentaje que canceló: <b>{formatPercent(sales.churnRate)}</b></span></article>
      <article className="admin-card"><div className="admin-churn-icon voluntary"><UserCheck/></div><p>Decidieron cancelar</p><strong>{formatNumber(sales.voluntaryChurn)}</strong><span>Se mejora aumentando el valor y las razones para volver.</span></article>
      <article className="admin-card"><div className="admin-churn-icon involuntary"><AlertTriangle/></div><p>Pago fallido</p><strong>{formatNumber(sales.involuntaryChurn)}</strong><span>Se mejora avisando y recuperando el cobro.</span></article>
    </section>
  </>;
}

function BarChart({ points, currency }: { points: Array<{ label: string; value: number }>; currency: string | null }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return <div className="admin-chart" role="img" aria-label="Ingresos mensuales"><div className="admin-bars">{points.map((point) => <div className="admin-bar" key={point.label}><span>{formatMoney(point.value, currency)}</span><i style={{ height: `${Math.max(8, point.value / max * 100)}%` }}/><b>{point.label}</b></div>)}</div><table className="sr-only"><caption>Ingresos mensuales</caption><thead><tr><th>Mes</th><th>Ingresos</th></tr></thead><tbody>{points.map((point) => <tr key={point.label}><th>{point.label}</th><td>{formatMoney(point.value, currency)}</td></tr>)}</tbody></table></div>;
}

function UsersSection({ data, manualAccessConfigured }: { data: AdminDashboardData; manualAccessConfigured: boolean }) {
  const users = data.users;
  const measuredFunnel = users.funnel.some((step) => step.value != null && step.value > 0);
  const maxFunnel = Math.max(...users.funnel.map((step) => step.value ?? 0), 1);
  return <>
    <div className="admin-metric-grid four decision">
      <MetricCard label="Personas que obtuvieron valor" value={formatPercent(users.activation)} detail="Completaron su primera acción importante." icon={Zap} featured/>
      <MetricCard label="Usuarios totales" value={formatNumber(users.total)} detail="Cuentas creadas en la app." icon={Users}/>
      <MetricCard label="Activos hoy" value={formatNumber(users.activeToday)} detail="Personas que volvieron hoy." icon={UserCheck}/>
      <MetricCard label="Acciones principales" value={formatNumber(users.coreActions)} detail="Cenas completadas o semanas generadas." icon={CheckCircle2}/>
    </div>
    <section>
      <SectionTitle eyebrow="¿VUELVEN?" title="Personas que regresan"/>
      <div className="admin-retention-grid">
        <MetricCard label="Día 1" value={formatPercent(users.retentionD1)} detail="Volvieron al día siguiente."/>
        <MetricCard label="Día 7" value={formatPercent(users.retentionD7)} detail="Regresaron una semana después."/>
        <MetricCard label="Día 30" value={formatPercent(users.retentionD30)} detail="Siguen activos después de un mes."/>
        <article className="admin-card admin-active-window"><p>ACTIVIDAD RECIENTE</p><div><span>7 días <b>{formatNumber(users.active7d)}</b></span><span>30 días <b>{formatNumber(users.active30d)}</b></span></div></article>
      </div>
    </section>
    <section className="admin-card admin-funnel-card">
      <SectionTitle eyebrow="DE VISITA A CLIENTE" title="Camino hasta la compra"/>
      <p className="admin-data-health">Medición limpia · Sesiones de prueba excluidas: {formatNumber(users.qaSessionsExcluded)}</p>
      {measuredFunnel ? <div className="admin-funnel" role="img" aria-label="Pasos hasta la compra">{users.funnel.map((step, index) => <div key={step.event}><span>{index + 1}</span><div><b>{step.label}</b><i><em style={{ width: `${(step.value ?? 0) / maxFunnel * 100}%` }}/></i></div><strong>{formatNumber(step.value)}</strong></div>)}</div> : <EmptyData title="Camino de compra aún no medido">El registro de actividad separará quién vio la oferta, fue a Hotmart, inició la prueba y confirmó el primer cobro.</EmptyData>}
      <table className="sr-only"><caption>Pasos hasta la compra</caption><thead><tr><th>Paso</th><th>Personas</th></tr></thead><tbody>{users.funnel.map((step) => <tr key={step.event}><th>{step.label}</th><td>{formatNumber(step.value)}</td></tr>)}</tbody></table>
    </section>
    <ManualAccessManager grants={users.manualAccess} configured={manualAccessConfigured}/>
  </>;
}

type ManualGrant = AdminDashboardData["users"]["manualAccess"][number];

function ManualAccessManager({ grants, configured }: { grants: ManualGrant[]; configured: boolean }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("30");
  const [permanentConfirmed, setPermanentConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const active = grants.filter((grant) => grant.status === "active");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!configured || status === "sending") return;
    setStatus("sending");
    setMessage("");
    try {
      const result = await fetch("/api/admin/manual-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason, duration, confirmPermanent: permanentConfirmed }),
      });
      const payload = await result.json() as { message?: string };
      if (!result.ok) throw new Error(payload.message || "No se pudo conceder el acceso.");
      setStatus("success");
      setMessage(payload.message || "Acceso concedido.");
      window.setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo conceder el acceso.");
    }
  }

  async function revoke(grantId: string) {
    if (!configured || status === "sending") return;
    if (!window.confirm("¿Retirar el acceso de esta persona? Ya no podrá entrar cuando cierre su sesión.")) return;
    setStatus("sending");
    setMessage("");
    try {
      const result = await fetch("/api/admin/manual-access", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantId }),
      });
      const payload = await result.json() as { message?: string };
      if (!result.ok) throw new Error(payload.message || "No se pudo retirar el acceso.");
      setStatus("success");
      setMessage(payload.message || "Acceso retirado.");
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo retirar el acceso.");
    }
  }

  return <section className="admin-card admin-manual-access">
    <header className="admin-manual-heading">
      <div><p>RESPALDO PARA SOPORTE</p><h2>Acceso manual</h2><span>Concede entrada temporal cuando una compra o invitación tenga un problema.</span></div>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>{open ? <X/> : <UserPlus/>}{open ? "Cerrar formulario" : "Dar acceso manual"}</button>
    </header>

    {open && <form className="admin-manual-form" onSubmit={submit}>
      <label><span>Correo de la persona</span><input type="email" required maxLength={320} autoComplete="email" placeholder="persona@correo.com" value={email} onChange={(event) => setEmail(event.target.value)}/></label>
      <label><span>Duración</span><select value={duration} onChange={(event) => { setDuration(event.target.value); setPermanentConfirmed(false); }}><option value="7">7 días</option><option value="30">30 días — recomendado</option><option value="permanent">Permanente</option></select></label>
      <label className="admin-manual-reason"><span>Motivo</span><textarea required minLength={5} maxLength={240} rows={3} placeholder="Ej.: su pago fue aprobado, pero el acceso no llegó." value={reason} onChange={(event) => setReason(event.target.value)}/><small>{reason.length}/240</small></label>
      {duration === "permanent" && <label className="admin-permanent-confirm"><input type="checkbox" checked={permanentConfirmed} onChange={(event) => setPermanentConfirmed(event.target.checked)}/><span><b>Confirmo el acceso permanente.</b> No vencerá automáticamente; deberás retirarlo manualmente.</span></label>}
      {!configured && <div className="admin-manual-pending"><CalendarDays/><span><b>Activación pendiente.</b> El formulario funcionará al conectar la clave privada del sistema.</span></div>}
      {message && <p className={`admin-manual-message ${status}`} role={status === "error" ? "alert" : "status"}>{message}</p>}
      <button className="admin-manual-submit" type="submit" disabled={!configured || status === "sending" || (duration === "permanent" && !permanentConfirmed)}><Send/>{status === "sending" ? "Enviando…" : "Conceder acceso y enviar enlace"}</button>
    </form>}

    <div className="admin-manual-list">
      <div><strong>Accesos vigentes</strong><span>{active.length}</span></div>
      {active.length ? active.map((grant) => <article key={grant.id}>
        <div><b>{grant.email}</b><span>{grant.expiresAt ? `Hasta ${new Intl.DateTimeFormat("es", { dateStyle: "medium", timeZone: "America/New_York" }).format(new Date(grant.expiresAt))}` : "Sin vencimiento"}</span><small>{grant.reason}</small></div>
        <button type="button" disabled={!configured || status === "sending"} onClick={() => revoke(grant.id)} aria-label={`Retirar acceso de ${grant.email}`}><Ban/>Retirar</button>
      </article>) : <EmptyData title="No hay accesos manuales vigentes">Cuando concedas uno, aparecerá aquí con su fecha de vencimiento y el motivo.</EmptyData>}
    </div>
  </section>;
}

function ErrorsSection({ data }: { data: AdminDashboardData }) {
  const errors = data.errors;
  const [resolvingError, setResolvingError] = useState<string | null>(null);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const healthy = errors.open === 0 && errors.webhookFailures === 0 && errors.supportOpen === 0;

  async function resolveErrorGroup(group: AdminDashboardData["errors"]["groups"][number]) {
    const groupKey = group.fingerprint ?? group.label;
    setResolvingError(groupKey);
    setResolutionMessage("");
    try {
      const result = await fetch("/api/errors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint: group.fingerprint, message: group.label }),
      });
      const payload = await result.json() as { message?: string };
      if (!result.ok) throw new Error(payload.message || "No se pudo cerrar el aviso.");
      setResolutionMessage(payload.message || "Aviso cerrado.");
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      setResolutionMessage(error instanceof Error ? error.message : "No se pudo cerrar el aviso.");
      setResolvingError(null);
    }
  }
  return <>
    <section className="admin-health-hero" data-healthy={healthy && errors.open != null}>
      <div className="admin-health-icon">{healthy && errors.open != null ? <CheckCircle2/> : errors.open == null ? <Clock3/> : <TriangleAlert/>}</div>
      <div><p>ESTADO GENERAL</p><h2>{errors.open == null ? "Salud todavía no medida" : healthy ? "Todo funciona con normalidad" : "Hay incidencias que necesitan atención"}</h2><span>{errors.open == null ? "Sentry y los registros se conectarán antes de publicar." : healthy ? "No hay errores abiertos ni fallos de pago registrados." : "Revisa primero los problemas que afectan más usuarios."}</span></div>
    </section>
    <div className="admin-metric-grid four">
      <MetricCard label="Alertas abiertas" value={formatNumber(errors.open)} detail="Problemas sin resolver." icon={TriangleAlert}/>
      <MetricCard label="Usuarios afectados" value={formatNumber(errors.affectedUsers)} detail="Personas distintas con errores." icon={Users}/>
      <MetricCard label="Confirmaciones de pago fallidas" value={formatNumber(errors.webhookFailures)} detail={errors.lastWebhookAt ? `Último aviso: ${new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(errors.lastWebhookAt))}` : "Conexión de Hotmart no medida."} icon={RefreshCw}/>
      <MetricCard label="Solicitudes de ayuda" value={formatNumber(errors.supportOpen)} detail="Clientes esperando respuesta." icon={MessageCircle}/>
    </div>
    <section className="admin-card admin-issues">
      <SectionTitle eyebrow="PRIORIDAD POR IMPACTO" title="Problemas agrupados"/>
      {resolutionMessage && <p className="admin-support-message" role="status">{resolutionMessage}</p>}
      {errors.groups.length ? <div>{errors.groups.map((group) => <article key={group.fingerprint ?? group.label}><div><TriangleAlert/><span><b>{group.label}</b><small>{group.users} usuarios · {group.count} veces</small></span></div><div className="admin-issue-actions">{group.sentryUrl && <a href={group.sentryUrl} target="_blank" rel="noreferrer">Ver detalle técnico <ExternalLink/></a>}<button type="button" disabled={resolvingError != null} onClick={() => resolveErrorGroup(group)}><CheckCircle2/>{resolvingError === (group.fingerprint ?? group.label) ? "Cerrando…" : "Marcar resuelto"}</button></div></article>)}</div> : <EmptyData title="No hay errores registrados">Cuando se conecte Sentry y el registro del servidor, aquí aparecerán agrupados por impacto.</EmptyData>}
    </section>
    <SupportTickets tickets={errors.supportTickets}/>
  </>;
}

type SupportTicket = AdminDashboardData["errors"]["supportTickets"][number];

function SupportTickets({ tickets }: { tickets: SupportTicket[] }) {
  const [resolving, setResolving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const openTickets = tickets.filter((ticket) => ticket.status === "open");
  const categoryLabel: Record<string, string> = { access: "Acceso", billing: "Pago", product: "Producto", privacy: "Privacidad" };

  async function resolve(ticketId: string) {
    setResolving(ticketId);
    setMessage("");
    try {
      const result = await fetch("/api/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const payload = await result.json() as { message?: string };
      if (!result.ok) throw new Error(payload.message || "No se pudo cerrar la solicitud.");
      setMessage("Solicitud marcada como resuelta.");
      window.setTimeout(() => window.location.reload(), 650);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo cerrar la solicitud.");
      setResolving(null);
    }
  }

  return <section className="admin-card admin-support-tickets">
    <SectionTitle eyebrow="RESPONDER EN 24 HORAS HÁBILES" title="Solicitudes privadas de ayuda"/>
    {message && <p className="admin-support-message" role="status">{message}</p>}
    {openTickets.length ? <div className="admin-support-list">{openTickets.map((ticket) => <article key={ticket.id}>
      <div className="admin-support-meta"><span>{categoryLabel[ticket.category] ?? ticket.category}</span><time dateTime={ticket.createdAt}>{new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(ticket.createdAt))}</time></div>
      <h3>{ticket.email}</h3>
      <p>{ticket.message}</p>
      <button type="button" disabled={resolving != null} onClick={() => resolve(ticket.id)}><CheckCircle2/>{resolving === ticket.id ? "Cerrando…" : "Marcar como resuelta"}</button>
    </article>)}</div> : <EmptyData title="Nadie está esperando respuesta">Cuando una persona pida ayuda desde su cuenta, aparecerá aquí de forma privada.</EmptyData>}
  </section>;
}

function AiSection({ data }: { data: AdminDashboardData }) {
  const ai = data.ai;
  return <>
    <div className="admin-metric-grid four decision">
      <MetricCard label="Gasto de IA del mes" value={formatMoney(ai.month, "USD", false)} detail="Costo de todas las funciones inteligentes." icon={Bot} featured/>
      <MetricCard label="Gasto de hoy" value={formatMoney(ai.today, "USD", false)} detail="Costo real registrado hoy." icon={DollarSign}/>
      <MetricCard label="Porcentaje de los ingresos" value={formatPercent(ai.revenueShare)} detail="Umbral de aviso configurado: 20%." icon={ReceiptText} tone={(ai.revenueShare ?? 0) > 0.2 ? "warning" : "neutral"}/>
      <MetricCard label="Llamadas fallidas" value={formatNumber(ai.failures)} detail={ai.calls == null ? "Llamadas aún no registradas." : `${ai.calls} llamadas totales.`} icon={AlertTriangle}/>
    </div>
    <section className="admin-ai-explainer"><BrainCircuit/><div><p>REGLA DE RENTABILIDAD</p><h2>La IA debe aportar valor sin comerse el precio.</h2><span>El panel avisará si supera 20% de lo cobrado y mostrará exactamente qué función lo provoca.</span></div></section>
    <div className="admin-split-grid">
      <section className="admin-card admin-table-card"><SectionTitle eyebrow="POR FUNCIÓN" title="Dónde se gasta"/>{ai.byFeature.length ? <table><thead><tr><th>Función</th><th>Usos</th><th>Costo</th></tr></thead><tbody>{ai.byFeature.map((row) => <tr key={row.feature}><th>{row.feature}</th><td>{row.calls}</td><td>{formatMoney(row.cost, "USD", false)}</td></tr>)}</tbody></table> : <EmptyData title="Costo por función no medido">La app todavía no tiene usos de IA registrados.</EmptyData>}</section>
      <section className="admin-card admin-table-card"><SectionTitle eyebrow="POR USUARIO" title="Uso más costoso"/>{ai.costlyUsers.length ? <table><thead><tr><th>Usuario</th><th>Costo</th></tr></thead><tbody>{ai.costlyUsers.map((row) => <tr key={row.user}><th>{row.user}</th><td>{formatMoney(row.cost, "USD", false)}</td></tr>)}</tbody></table> : <EmptyData title="Costo por usuario no medido">Aquí se detectará abuso o uso intensivo sin mostrar datos personales.</EmptyData>}</section>
    </div>
  </>;
}
