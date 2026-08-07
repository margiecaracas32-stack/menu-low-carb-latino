-- Owner backoffice: business ledger, product analytics, AI costs and operations.
-- Every table is deny-by-default. Only a verified admin may read aggregate data.

alter table public.profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin')),
  add column if not exists source text;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_source_idx on public.profiles(source);

-- Prevent a normal user from promoting their own role or changing plan/payment
-- state through the existing own-profile UPDATE policy.
revoke update on public.profiles from authenticated;
grant update (display_name, timezone, marketing_opt_in) on public.profiles to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "profiles_admin_select_all" on public.profiles
  for select to authenticated
  using ((select public.is_admin()));

create table if not exists public.event_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_id text,
  type text not null check (type ~ '^[a-z][a-z0-9_]{2,79}$'),
  metadata jsonb not null default '{}'::jsonb,
  source text,
  is_qa boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (user_id is not null or anonymous_session_id is not null),
  check (jsonb_typeof(metadata) = 'object')
);

create index if not exists event_log_type_occurred_idx
  on public.event_log(type, occurred_at desc);
create index if not exists event_log_user_occurred_idx
  on public.event_log(user_id, occurred_at desc);
create index if not exists event_log_source_occurred_idx
  on public.event_log(source, occurred_at desc);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'hotmart' check (provider = 'hotmart'),
  provider_event_id text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  status text not null check (
    status in ('pending', 'trialing', 'paid', 'cancelled', 'refunded', 'chargeback', 'past_due', 'failed')
  ),
  churn_type text check (churn_type is null or churn_type in ('voluntary', 'involuntary')),
  billing_cycle text check (billing_cycle is null or billing_cycle in ('monthly', 'annual')),
  amount_minor bigint not null default 0 check (amount_minor >= 0),
  provider_fee_minor bigint check (provider_fee_minor is null or provider_fee_minor >= 0),
  affiliate_fee_minor bigint check (affiliate_fee_minor is null or affiliate_fee_minor >= 0),
  tax_minor bigint check (tax_minor is null or tax_minor >= 0),
  refund_minor bigint check (refund_minor is null or refund_minor >= 0),
  settlement_minor bigint check (settlement_minor is null or settlement_minor >= 0),
  currency char(3) not null,
  settlement_currency char(3),
  source text,
  occurred_at timestamptz not null,
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_transactions_occurred_idx
  on public.payment_transactions(occurred_at desc);
create index if not exists payment_transactions_status_idx
  on public.payment_transactions(status, occurred_at desc);
create index if not exists payment_transactions_source_idx
  on public.payment_transactions(source, occurred_at desc);

create table if not exists public.acquisition_spend (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (length(channel) between 1 and 80),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null,
  period_start date not null,
  period_end date not null,
  notes text check (notes is null or length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create index if not exists acquisition_spend_channel_period_idx
  on public.acquisition_spend(channel, period_start desc);

create table if not exists public.operating_costs (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('infrastructure', 'email', 'other')),
  provider text not null check (length(provider) between 1 and 80),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null,
  period_start date not null,
  period_end date not null,
  source text not null default 'manual' check (source in ('manual', 'invoice', 'api')),
  reconciled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create index if not exists operating_costs_period_idx
  on public.operating_costs(period_start desc, category);

create table if not exists public.ai_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feature text not null check (length(feature) between 1 and 100),
  model text not null check (length(model) between 1 and 120),
  tokens_in integer check (tokens_in is null or tokens_in >= 0),
  tokens_out integer check (tokens_out is null or tokens_out >= 0),
  cost_usd numeric(12, 6) check (cost_usd is null or cost_usd >= 0),
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  status text not null check (status in ('ok', 'error', 'timeout', 'moderated')),
  error_code text,
  prompt_hash text,
  trace_id uuid,
  span_name text,
  parent_span uuid,
  created_at timestamptz not null default now()
);

create index if not exists ai_calls_user_created_idx
  on public.ai_calls(user_id, created_at desc);
create index if not exists ai_calls_feature_created_idx
  on public.ai_calls(feature, created_at desc);
create index if not exists ai_calls_trace_idx
  on public.ai_calls(trace_id, created_at);

create table if not exists public.error_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  fingerprint text,
  message text not null check (length(message) between 1 and 1000),
  context text not null check (length(context) between 1 and 160),
  route text,
  severity text not null default 'error' check (severity in ('warning', 'error', 'fatal')),
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'ignored')),
  sentry_issue_url text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists error_log_status_created_idx
  on public.error_log(status, created_at desc);
create index if not exists error_log_fingerprint_idx
  on public.error_log(fingerprint, created_at desc);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'hotmart' check (provider = 'hotmart'),
  provider_event_id text not null unique,
  event_type text not null,
  status text not null check (status in ('received', 'processed', 'failed', 'ignored')),
  attempts smallint not null default 1 check (attempts between 1 and 50),
  last_error_code text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists webhook_events_status_received_idx
  on public.webhook_events(status, received_at desc);

-- Emergency/manual access granted by the owner. This is separate from paid
-- subscriptions so a support action never rewrites Hotmart's source of truth.
create table if not exists public.manual_access_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 320),
  reason text not null check (char_length(reason) between 5 and 240),
  duration_days smallint check (duration_days in (7, 30) or duration_days is null),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  granted_by uuid not null references auth.users(id),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id),
  revoke_reason text check (revoke_reason is null or char_length(revoke_reason) between 3 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at is null or expires_at > starts_at),
  check ((revoked_at is null and revoked_by is null) or (revoked_at is not null and revoked_by is not null))
);

create index if not exists manual_access_grants_user_active_idx
  on public.manual_access_grants(user_id, revoked_at, expires_at desc);
create index if not exists manual_access_grants_created_idx
  on public.manual_access_grants(created_at desc);

create table if not exists public.manual_access_events (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.manual_access_grants(id) on delete restrict,
  action text not null check (action in ('granted', 'revoked')),
  actor_user_id uuid not null references auth.users(id),
  target_user_id uuid not null references auth.users(id) on delete cascade,
  target_email text not null check (char_length(target_email) between 3 and 320),
  detail text not null check (char_length(detail) between 3 and 240),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists manual_access_events_created_idx
  on public.manual_access_events(created_at desc);

alter table public.event_log enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.acquisition_spend enable row level security;
alter table public.operating_costs enable row level security;
alter table public.ai_calls enable row level security;
alter table public.error_log enable row level security;
alter table public.webhook_events enable row level security;
alter table public.manual_access_grants enable row level security;
alter table public.manual_access_events enable row level security;

create policy "event_log_admin_select" on public.event_log
  for select to authenticated using ((select public.is_admin()));

create policy "payment_transactions_admin_select" on public.payment_transactions
  for select to authenticated using ((select public.is_admin()));

create policy "acquisition_spend_admin_all" on public.acquisition_spend
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "operating_costs_admin_all" on public.operating_costs
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "ai_calls_admin_select" on public.ai_calls
  for select to authenticated using ((select public.is_admin()));

create policy "error_log_admin_select" on public.error_log
  for select to authenticated using ((select public.is_admin()));
create policy "error_log_admin_update" on public.error_log
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "webhook_events_admin_select" on public.webhook_events
  for select to authenticated using ((select public.is_admin()));

create policy "manual_access_grants_admin_select" on public.manual_access_grants
  for select to authenticated using ((select public.is_admin()));

create policy "manual_access_events_admin_select" on public.manual_access_events
  for select to authenticated using ((select public.is_admin()));

create trigger payment_transactions_set_updated_at
before update on public.payment_transactions
for each row execute function public.set_updated_at();

create trigger acquisition_spend_set_updated_at
before update on public.acquisition_spend
for each row execute function public.set_updated_at();

create trigger operating_costs_set_updated_at
before update on public.operating_costs
for each row execute function public.set_updated_at();

create trigger webhook_events_set_updated_at
before update on public.webhook_events
for each row execute function public.set_updated_at();

create trigger manual_access_grants_set_updated_at
before update on public.manual_access_grants
for each row execute function public.set_updated_at();

-- Single server-side entitlement decision. Paid access remains authoritative;
-- an active manual grant is an additional, revocable path for support cases.
create or replace function public.has_app_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.subscriptions s
      where s.user_id = (select auth.uid())
        and s.status in ('trialing', 'active')
        and coalesce(s.access_until, s.current_period_end, s.trial_ends_at, 'infinity'::timestamptz) > now()
    )
    or exists (
      select 1
      from public.manual_access_grants g
      where g.user_id = (select auth.uid())
        and g.revoked_at is null
        and (g.expires_at is null or g.expires_at > now())
    );
$$;

revoke all on function public.has_app_access() from public, anon;
grant execute on function public.has_app_access() to authenticated;

-- No client INSERT policies are exposed for business, analytics, AI, error or
-- webhook data. Those writes must come from validated, rate-limited server
-- handlers using the provider's secret credential.
