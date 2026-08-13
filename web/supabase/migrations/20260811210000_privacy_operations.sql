-- Privacy operations: attributable consent and non-PII audit evidence.

begin;

create table if not exists public.data_consents (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null check (purpose in ('service', 'marketing')),
  policy_version text not null check (char_length(policy_version) between 1 and 40),
  locale text not null default 'es' check (char_length(locale) between 2 and 12),
  origin text not null check (char_length(origin) between 1 and 80),
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  check (withdrawn_at is null or withdrawn_at >= granted_at)
);

create index if not exists data_consents_subject_purpose_idx
  on public.data_consents(subject_id, purpose, granted_at desc);

create unique index if not exists data_consents_version_unique
  on public.data_consents(subject_id, purpose, policy_version);

create table if not exists public.privacy_audit (
  id uuid primary key default gen_random_uuid(),
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  action text not null check (action in ('exported', 'deleted')),
  status text not null check (status in ('completed', 'failed')),
  occurred_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('access', 'billing', 'product', 'privacy')),
  message text not null check (char_length(message) between 10 and 1000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  check ((status = 'open' and resolved_at is null) or (status = 'resolved' and resolved_at is not null))
);

create index if not exists support_tickets_status_created_idx
  on public.support_tickets(status, created_at desc);
create index if not exists support_tickets_subject_created_idx
  on public.support_tickets(subject_id, created_at desc);

create index if not exists privacy_audit_occurred_idx
  on public.privacy_audit(occurred_at desc, action);

alter table public.data_consents enable row level security;
alter table public.privacy_audit enable row level security;
alter table public.support_tickets enable row level security;

create policy "data_consents_select_own" on public.data_consents
  for select to authenticated
  using ((select auth.uid()) = subject_id);

create policy "privacy_audit_admin_select" on public.privacy_audit
  for select to authenticated
  using ((select public.is_admin()));

create policy "support_tickets_select_own" on public.support_tickets
  for select to authenticated
  using ((select auth.uid()) = subject_id);
create policy "support_tickets_admin_select" on public.support_tickets
  for select to authenticated
  using ((select public.is_admin()));
create policy "support_tickets_admin_update" on public.support_tickets
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on public.data_consents from anon, authenticated;
grant select on public.data_consents to authenticated;
revoke all on public.privacy_audit from anon, authenticated;
grant select on public.privacy_audit to authenticated;
revoke all on public.support_tickets from anon, authenticated;
grant select, update on public.support_tickets to authenticated;

commit;
