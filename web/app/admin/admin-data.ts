import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMIN_SECTIONS = ["profit", "sales", "users", "errors", "ai"] as const;
export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export type Notice = {
  level: "ok" | "info" | "warning" | "critical";
  title: string;
  detail: string;
  action: string;
};

export type TrendPoint = { label: string; value: number };
export type FunnelStep = { event: string; label: string; value: number | null };

export type AdminDashboardData = {
  generatedAt: string;
  currency: string | null;
  sourceReady: boolean;
  notices: Notice[];
  profit: {
    revenue: number | null;
    providerFees: number | null;
    affiliateFees: number | null;
    taxes: number | null;
    aiCost: number | null;
    infrastructure: number | null;
    email: number | null;
    netProfit: number | null;
    margin: number | null;
    reconciled: boolean;
    ltv: number | null;
    cac: number | null;
    ltvCacRatio: number | null;
    paybackMonths: number | null;
    byChannel: Array<{ channel: string; revenue: number; spend: number | null; profit: number | null }>;
  };
  sales: {
    mrr: number | null;
    purchases: number | null;
    trials: number | null;
    trialToPaid: number | null;
    cancellations: number | null;
    voluntaryChurn: number | null;
    involuntaryChurn: number | null;
    churnRate: number | null;
    trend: TrendPoint[];
  };
  users: {
    total: number | null;
    activeToday: number | null;
    active7d: number | null;
    active30d: number | null;
    activation: number | null;
    retentionD1: number | null;
    retentionD7: number | null;
    retentionD30: number | null;
    coreActions: number | null;
    funnel: FunnelStep[];
    manualAccess: Array<{
      id: string;
      email: string;
      reason: string;
      status: "active" | "expired" | "revoked";
      expiresAt: string | null;
      createdAt: string;
    }>;
  };
  errors: {
    open: number | null;
    affectedUsers: number | null;
    webhookFailures: number | null;
    lastWebhookAt: string | null;
    groups: Array<{ label: string; count: number; users: number; status: string; sentryUrl: string | null }>;
  };
  ai: {
    today: number | null;
    month: number | null;
    revenueShare: number | null;
    calls: number | null;
    failures: number | null;
    byFeature: Array<{ feature: string; cost: number; calls: number }>;
    costlyUsers: Array<{ user: string; cost: number }>;
  };
};

const FUNNEL: Array<[string, string]> = [
  ["landing_vista", "Visitó la página"],
  ["onboarding_iniciado", "Comenzó el onboarding"],
  ["resultado_visto", "Vio su menú"],
  ["paywall_visto", "Vio la oferta"],
  ["checkout_iniciado", "Fue al pago"],
  ["trial_iniciado", "Inició la prueba"],
  ["primer_cobro_confirmado", "Primer cobro"],
];

const emptyData = (): AdminDashboardData => ({
  generatedAt: new Date().toISOString(),
  currency: null,
  sourceReady: false,
  notices: [{
    level: "info",
    title: "Aún no hay datos reales para evaluar",
    detail: "El panel está preparado, pero todavía no recibe pagos, actividad, errores ni costos de IA.",
    action: "Conecta las fuentes operativas antes de tomar decisiones con estos indicadores.",
  }],
  profit: {
    revenue: null, providerFees: null, affiliateFees: null, taxes: null, aiCost: null,
    infrastructure: null, email: null, netProfit: null, margin: null, reconciled: false,
    ltv: null, cac: null, ltvCacRatio: null, paybackMonths: null, byChannel: [],
  },
  sales: {
    mrr: null, purchases: null, trials: null, trialToPaid: null, cancellations: null,
    voluntaryChurn: null, involuntaryChurn: null, churnRate: null, trend: [],
  },
  users: {
    total: null, activeToday: null, active7d: null, active30d: null, activation: null,
    retentionD1: null, retentionD7: null, retentionD30: null, coreActions: null,
    funnel: FUNNEL.map(([event, label]) => ({ event, label, value: null })),
    manualAccess: [],
  },
  errors: { open: null, affectedUsers: null, webhookFailures: null, lastWebhookAt: null, groups: [] },
  ai: { today: null, month: null, revenueShare: null, calls: null, failures: null, byFeature: [], costlyUsers: [] },
});

type Row = Record<string, unknown>;

async function readRows(query: PromiseLike<{ data: unknown; error: { message?: string } | null }>) {
  const { data, error } = await query;
  if (error || !Array.isArray(data)) return { rows: [] as Row[], ready: false };
  return { rows: data as Row[], ready: true };
}

const number = (value: unknown) => typeof value === "number" ? value : Number(value ?? 0);
const date = (value: unknown) => new Date(String(value));
const unique = (values: Array<unknown>) => new Set(values.filter(Boolean).map(String)).size;
const ratio = (part: number, total: number) => total > 0 ? part / total : null;

function within(value: unknown, start: Date) {
  const parsed = date(value);
  return !Number.isNaN(parsed.getTime()) && parsed >= start;
}

export async function loadAdminDashboard(supabase: SupabaseClient): Promise<AdminDashboardData> {
  const output = emptyData();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const [profilesResult, eventsResult, paymentsResult, spendResult, costsResult, aiResult, errorsResult, webhooksResult, manualAccessResult] = await Promise.all([
    readRows(supabase.from("profiles").select("id,status,source,created_at")),
    readRows(supabase.from("event_log").select("user_id,anonymous_session_id,type,source,is_qa,occurred_at").eq("is_qa", false)),
    readRows(supabase.from("payment_transactions").select("user_id,status,churn_type,billing_cycle,economic_kind,amount_minor,provider_fee_minor,affiliate_fee_minor,tax_minor,refund_minor,settlement_minor,currency,source,occurred_at,reconciled_at")),
    readRows(supabase.from("acquisition_spend").select("channel,amount_minor,currency,period_start,period_end")),
    readRows(supabase.from("operating_costs").select("category,amount_minor,currency,period_start,period_end,reconciled_at")),
    readRows(supabase.from("ai_calls").select("user_id,feature,cost_usd,status,created_at")),
    readRows(supabase.from("error_log").select("user_id,fingerprint,message,status,sentry_issue_url,created_at")),
    readRows(supabase.from("webhook_events").select("status,received_at,processed_at")),
    readRows(supabase.from("manual_access_grants").select("id,email,reason,expires_at,revoked_at,created_at").order("created_at", { ascending: false }).limit(50)),
  ]);

  const readiness = [profilesResult, eventsResult, paymentsResult, spendResult, costsResult, aiResult, errorsResult, webhooksResult, manualAccessResult];
  output.sourceReady = readiness.every((entry) => entry.ready);

  const profiles = profilesResult.rows;
  const events = eventsResult.rows;
  const payments = paymentsResult.rows.filter((row) => within(row.occurred_at, monthStart));
  const acquisition = spendResult.rows.filter((row) => date(row.period_end) >= monthStart);
  const costs = costsResult.rows.filter((row) => date(row.period_end) >= monthStart);
  const aiCalls = aiResult.rows.filter((row) => within(row.created_at, monthStart));
  const errors = errorsResult.rows;
  const webhooks = webhooksResult.rows;

  if (manualAccessResult.ready) {
    output.users.manualAccess = manualAccessResult.rows.map((row) => {
      const expired = row.expires_at != null && date(row.expires_at) <= now;
      return {
        id: String(row.id),
        email: String(row.email),
        reason: String(row.reason),
        status: row.revoked_at ? "revoked" as const : expired ? "expired" as const : "active" as const,
        expiresAt: row.expires_at ? String(row.expires_at) : null,
        createdAt: String(row.created_at),
      };
    });
  }

  const currencies = new Set([
    ...payments.map((row) => String(row.currency ?? "")),
    ...acquisition.map((row) => String(row.currency ?? "")),
    ...costs.map((row) => String(row.currency ?? "")),
  ].filter(Boolean));
  output.currency = currencies.size === 1 ? [...currencies][0] : null;
  const oneCurrency = currencies.size <= 1;

  if (profilesResult.ready) {
    output.users.total = profiles.length;
  }

  if (eventsResult.ready) {
    const eventKey = (row: Row) => String(row.user_id ?? row.anonymous_session_id ?? "");
    const daily = events.filter((row) => row.type === "sesion_iniciada");
    output.users.activeToday = unique(daily.filter((row) => within(row.occurred_at, dayStart)).map(eventKey));
    output.users.active7d = unique(daily.filter((row) => within(row.occurred_at, sevenDaysAgo)).map(eventKey));
    output.users.active30d = unique(daily.filter((row) => within(row.occurred_at, thirtyDaysAgo)).map(eventKey));
    output.users.coreActions = events.filter((row) => row.type === "cena_completada" || row.type === "menu_semanal_generado").length;

    const opened = unique(events.filter((row) => row.type === "app_abierta").map(eventKey));
    const activated = unique(events.filter((row) => row.type === "aha_alcanzado").map(eventKey));
    output.users.activation = ratio(activated, opened);
    output.users.funnel = FUNNEL.map(([event, label]) => ({
      event,
      label,
      value: unique(events.filter((row) => row.type === event).map(eventKey)),
    }));

    const profileCreated = new Map(profiles.map((row) => [String(row.id), date(row.created_at)]));
    const retention = (targetDay: number) => {
      const eligible = profiles.filter((row) => now.getTime() - date(row.created_at).getTime() >= targetDay * 86_400_000);
      if (!eligible.length) return null;
      const retained = eligible.filter((profile) => daily.some((entry) => {
        if (String(entry.user_id ?? "") !== String(profile.id)) return false;
        const created = profileCreated.get(String(profile.id));
        if (!created) return false;
        return Math.floor((date(entry.occurred_at).getTime() - created.getTime()) / 86_400_000) === targetDay;
      })).length;
      return ratio(retained, eligible.length);
    };
    output.users.retentionD1 = retention(1);
    output.users.retentionD7 = retention(7);
    output.users.retentionD30 = retention(30);
  }

  if (paymentsResult.ready) {
    const paid = payments.filter((row) => row.status === "paid" && row.economic_kind === "sale");
    const reversals = payments.filter((row) => row.economic_kind === "refund" || row.economic_kind === "chargeback");
    const cancelled = payments.filter((row) => row.status === "cancelled" || row.status === "past_due");
    output.sales.purchases = paid.length;
    output.sales.cancellations = cancelled.length;
    output.sales.voluntaryChurn = cancelled.filter((row) => row.churn_type === "voluntary").length;
    output.sales.involuntaryChurn = cancelled.filter((row) => row.churn_type === "involuntary").length;
    output.sales.churnRate = ratio(cancelled.length, paid.length + cancelled.length);

    const eventTrials = events.filter((row) => row.type === "trial_iniciado" && within(row.occurred_at, monthStart)).length;
    output.sales.trials = eventsResult.ready ? eventTrials : null;
    output.sales.trialToPaid = eventsResult.ready ? ratio(paid.length, eventTrials) : null;

    if (oneCurrency) {
      output.profit.revenue = paid.reduce((sum, row) => sum + number(row.amount_minor), 0)
        - reversals.reduce((sum, row) => sum + number(row.refund_minor || row.amount_minor), 0);
      output.sales.mrr = paid.reduce((sum, row) => sum + number(row.amount_minor) / (row.billing_cycle === "annual" ? 12 : 1), 0);
      output.profit.providerFees = paid.every((row) => row.provider_fee_minor != null)
        ? paid.reduce((sum, row) => sum + number(row.provider_fee_minor), 0) : null;
      output.profit.affiliateFees = paid.every((row) => row.affiliate_fee_minor != null)
        ? paid.reduce((sum, row) => sum + number(row.affiliate_fee_minor), 0) : null;
      output.profit.taxes = paid.every((row) => row.tax_minor != null)
        ? paid.reduce((sum, row) => sum + number(row.tax_minor), 0) : null;
      output.profit.reconciled = paid.length > 0 && [...paid, ...reversals].every((row) => row.reconciled_at != null);
    }

    const byMonth = new Map<string, number>();
    for (const row of paymentsResult.rows.filter((entry) => entry.economic_kind === "sale" || entry.economic_kind === "refund" || entry.economic_kind === "chargeback")) {
      const parsed = date(row.occurred_at);
      const key = `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
      const signedAmount = row.economic_kind === "sale"
        ? number(row.amount_minor)
        : -number(row.refund_minor || row.amount_minor);
      byMonth.set(key, (byMonth.get(key) ?? 0) + signedAmount);
    }
    output.sales.trend = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([label, value]) => ({ label, value }));
  }

  if (costsResult.ready && oneCurrency && costs.length) {
    output.profit.infrastructure = costs.filter((row) => row.category === "infrastructure").reduce((sum, row) => sum + number(row.amount_minor), 0);
    output.profit.email = costs.filter((row) => row.category === "email").reduce((sum, row) => sum + number(row.amount_minor), 0);
  }

  if (aiResult.ready) {
    output.ai.calls = aiCalls.length;
    output.ai.failures = aiCalls.filter((row) => row.status !== "ok").length;
    const measuredCosts = aiCalls.filter((row) => row.cost_usd != null);
    output.ai.month = measuredCosts.length ? measuredCosts.reduce((sum, row) => sum + number(row.cost_usd), 0) : null;
    const todayCalls = measuredCosts.filter((row) => within(row.created_at, dayStart));
    output.ai.today = todayCalls.length ? todayCalls.reduce((sum, row) => sum + number(row.cost_usd), 0) : null;

    const featureMap = new Map<string, { cost: number; calls: number }>();
    const userMap = new Map<string, number>();
    for (const row of measuredCosts) {
      const feature = String(row.feature);
      const featureValue = featureMap.get(feature) ?? { cost: 0, calls: 0 };
      featureValue.cost += number(row.cost_usd);
      featureValue.calls += 1;
      featureMap.set(feature, featureValue);
      if (row.user_id) userMap.set(String(row.user_id), (userMap.get(String(row.user_id)) ?? 0) + number(row.cost_usd));
    }
    output.ai.byFeature = [...featureMap.entries()].map(([feature, value]) => ({ feature, ...value })).sort((a, b) => b.cost - a.cost);
    output.ai.costlyUsers = [...userMap.entries()].map(([user, cost]) => ({ user: `${user.slice(0, 6)}…`, cost })).sort((a, b) => b.cost - a.cost).slice(0, 5);
  }

  if (output.ai.month != null && output.profit.revenue != null && output.currency === "USD") {
    output.profit.aiCost = Math.round(output.ai.month * 100);
    output.ai.revenueShare = ratio(output.profit.aiCost, output.profit.revenue);
  }

  if (errorsResult.ready) {
    const openErrors = errors.filter((row) => row.status === "open" || row.status === "investigating");
    output.errors.open = openErrors.length;
    output.errors.affectedUsers = unique(openErrors.map((row) => row.user_id));
    const groups = new Map<string, { label: string; count: number; users: Set<string>; status: string; sentryUrl: string | null }>();
    for (const row of openErrors) {
      const key = String(row.fingerprint ?? row.message);
      const current = groups.get(key) ?? { label: String(row.message), count: 0, users: new Set<string>(), status: String(row.status), sentryUrl: row.sentry_issue_url ? String(row.sentry_issue_url) : null };
      current.count += 1;
      if (row.user_id) current.users.add(String(row.user_id));
      groups.set(key, current);
    }
    output.errors.groups = [...groups.values()].map((group) => ({ ...group, users: group.users.size })).sort((a, b) => b.count - a.count);
  }

  if (webhooksResult.ready) {
    output.errors.webhookFailures = webhooks.filter((row) => row.status === "failed").length;
    const latest = [...webhooks].sort((a, b) => date(b.received_at).getTime() - date(a.received_at).getTime())[0];
    output.errors.lastWebhookAt = latest ? String(latest.received_at) : null;
  }

  if (acquisition.length && oneCurrency && output.profit.revenue != null) {
    const channels = new Set([
      ...payments.map((row) => String(row.source ?? "directo")),
      ...acquisition.map((row) => String(row.channel)),
    ]);
    output.profit.byChannel = [...channels].map((channel) => {
      const revenue = payments.filter((row) => String(row.source ?? "directo") === channel && row.status === "paid")
        .reduce((sum, row) => sum + number(row.amount_minor) - number(row.refund_minor), 0);
      const spendRows = acquisition.filter((row) => String(row.channel) === channel);
      const spend = spendRows.length ? spendRows.reduce((sum, row) => sum + number(row.amount_minor), 0) : null;
      return { channel, revenue, spend, profit: spend == null ? null : revenue - spend };
    });
    const totalSpend = acquisition.reduce((sum, row) => sum + number(row.amount_minor), 0);
    const newCustomers = payments.filter((row) => row.status === "paid").length;
    output.profit.cac = newCustomers > 0 ? totalSpend / newCustomers : null;
  }

  const allProfitCosts = [output.profit.providerFees, output.profit.affiliateFees, output.profit.taxes, output.profit.aiCost, output.profit.infrastructure, output.profit.email];
  if (output.profit.revenue != null && output.profit.reconciled && allProfitCosts.every((value) => value != null)) {
    output.profit.netProfit = output.profit.revenue - allProfitCosts.reduce<number>((sum, value) => sum + (value ?? 0), 0);
    output.profit.margin = ratio(output.profit.netProfit, output.profit.revenue);
    if (output.profit.cac != null && output.profit.netProfit > 0 && output.sales.purchases) {
      const marginPerCustomer = output.profit.netProfit / output.sales.purchases;
      output.profit.paybackMonths = output.profit.cac / marginPerCustomer;
    }
  }

  const warnings: Notice[] = [];
  if (output.ai.revenueShare != null && output.ai.revenueShare > 0.2) warnings.push({
    level: "warning", title: "La IA está consumiendo demasiado ingreso",
    detail: `La IA representa ${(output.ai.revenueShare * 100).toFixed(0)}% de lo cobrado este mes.`,
    action: "Revisa límites de uso, modelo y precio antes de aumentar tráfico.",
  });
  if ((output.errors.webhookFailures ?? 0) > 0) warnings.push({
    level: "critical", title: "Hay pagos que podrían no estar dando acceso",
    detail: `${output.errors.webhookFailures} eventos de Hotmart fallaron.`,
    action: "Revisa la conexión y reprocesa los eventos fallidos.",
  });
  if ((output.sales.involuntaryChurn ?? 0) > (output.sales.voluntaryChurn ?? 0) && (output.sales.involuntaryChurn ?? 0) > 0) warnings.push({
    level: "warning", title: "Se pierden clientes por pagos fallidos",
    detail: "Las bajas involuntarias superan a las cancelaciones elegidas por el cliente.",
    action: "Activa o ajusta la recuperación automática de pagos.",
  });
  if (output.profit.netProfit != null && output.profit.netProfit <= 0) warnings.push({
    level: "critical", title: "El margen del mes es negativo",
    detail: "Vender más con estos costos aumentaría la pérdida.",
    action: "Revisa precio, costos y canales antes de escalar.",
  });
  for (const channel of output.profit.byChannel.filter((entry) => entry.profit != null && entry.profit < 0)) warnings.push({
    level: "warning", title: `${channel.channel} está perdiendo dinero`,
    detail: "El gasto del canal supera el ingreso que produjo este mes.",
    action: "Pausa el gasto y revisa cuánto cuesta conseguir clientes y cuántos regresan.",
  });

  const anythingMeasured = output.profit.revenue != null || (output.users.total ?? 0) > 0 || (output.ai.calls ?? 0) > 0 || (output.errors.open ?? 0) > 0;
  output.notices = warnings.length ? warnings : anythingMeasured ? [{
    level: "ok", title: "Todo en orden este mes", detail: "No hay alertas críticas con los datos disponibles.", action: "Continúa revisando el panel cada semana.",
  }] : output.notices;

  return output;
}
