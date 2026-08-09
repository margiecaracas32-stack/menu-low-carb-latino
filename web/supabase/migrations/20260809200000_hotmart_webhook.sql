-- Production Hotmart webhook ledger and recoverable entitlement state.

begin;

alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check check (
  status in ('pending', 'trialing', 'active', 'past_due', 'cancelled', 'expired', 'refunded', 'chargeback')
);
alter table public.profiles add column if not exists anon_id text;
create unique index if not exists profiles_anon_id_unique
  on public.profiles(anon_id)
  where anon_id is not null;

alter table public.subscriptions
  add column if not exists hotmart_subscription_id text,
  add column if not exists subscriber_code text,
  add column if not exists product_id text,
  add column if not exists plan_id text,
  add column if not exists billing_cycle text check (billing_cycle is null or billing_cycle in ('monthly', 'annual')),
  add column if not exists grace_ends_at timestamptz,
  add column if not exists first_paid_at timestamptz,
  add column if not exists source text,
  add column if not exists last_event_at timestamptz;

create unique index if not exists subscriptions_hotmart_subscription_unique
  on public.subscriptions(provider, hotmart_subscription_id)
  where hotmart_subscription_id is not null;
create unique index if not exists subscriptions_subscriber_code_unique
  on public.subscriptions(provider, subscriber_code)
  where subscriber_code is not null;

alter table public.payment_transactions
  add column if not exists transaction_id text,
  add column if not exists economic_kind text check (economic_kind is null or economic_kind in ('sale', 'refund', 'chargeback')),
  add column if not exists product_id text,
  add column if not exists offer_id text,
  add column if not exists plan_id text,
  add column if not exists payload_hash text;

create unique index if not exists payment_transactions_economic_unique
  on public.payment_transactions(provider, transaction_id, economic_kind)
  where transaction_id is not null and economic_kind is not null;

alter table public.webhook_events drop constraint if exists webhook_events_status_check;
alter table public.webhook_events add constraint webhook_events_status_check check (
  status in ('received', 'processed', 'failed', 'ignored', 'duplicate', 'illegal', 'unauthorized')
);
alter table public.webhook_events
  add column if not exists payload_hash text,
  add column if not exists product_id text,
  add column if not exists transaction_id text;

alter table public.event_log add column if not exists provider_event_id text;
create unique index if not exists event_log_provider_event_unique
  on public.event_log(provider_event_id)
  where provider_event_id is not null;

create or replace function public.apply_hotmart_event(
  p_event_id text,
  p_event_type text,
  p_payload_hash text,
  p_user_id uuid,
  p_email text,
  p_display_name text,
  p_product_id text,
  p_offer_id text,
  p_plan_id text,
  p_billing_cycle text,
  p_transaction_id text,
  p_economic_kind text,
  p_amount_minor bigint,
  p_currency text,
  p_payment_status text,
  p_membership_status text,
  p_occurred_at timestamptz,
  p_subscriber_code text,
  p_hotmart_subscription_id text,
  p_trial_ends_at timestamptz,
  p_current_period_end timestamptz,
  p_access_until timestamptz,
  p_grace_ends_at timestamptz,
  p_cancel_at_period_end boolean,
  p_source text,
  p_anon_id text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_current_status text;
  v_current_event_at timestamptz;
  v_current_subscription_id text;
  v_new_subscription boolean := false;
  v_plan text;
  v_event_name text;
begin
  if p_membership_status not in ('trialing','active','past_due','cancelled','expired','refunded','chargeback') then
    raise exception 'invalid membership status';
  end if;

  select status, last_event_at, hotmart_subscription_id
    into v_current_status, v_current_event_at, v_current_subscription_id
  from public.subscriptions
  where user_id = p_user_id
  for update;

  v_new_subscription := p_hotmart_subscription_id is not null
    and v_current_subscription_id is distinct from p_hotmart_subscription_id;

  if p_economic_kind is not null then
    insert into public.payment_transactions (
      provider, provider_event_id, user_id, event_type, status, billing_cycle,
      amount_minor, refund_minor, currency, source, occurred_at, transaction_id,
      economic_kind, product_id, offer_id, plan_id, payload_hash
    ) values (
      'hotmart', p_event_id, p_user_id, p_event_type, p_payment_status, p_billing_cycle,
      p_amount_minor,
      case when p_economic_kind in ('refund','chargeback') then p_amount_minor else null end,
      p_currency, p_source, p_occurred_at, p_transaction_id, p_economic_kind,
      p_product_id, p_offer_id, p_plan_id, p_payload_hash
    ) on conflict do nothing;
  else
    insert into public.payment_transactions (
      provider, provider_event_id, user_id, event_type, status, churn_type, billing_cycle,
      amount_minor, currency, source, occurred_at, transaction_id, product_id, offer_id,
      plan_id, payload_hash
    ) values (
      'hotmart', p_event_id, p_user_id, p_event_type, p_payment_status,
      case when p_payment_status = 'cancelled' then 'voluntary'
           when p_payment_status in ('past_due','failed') then 'involuntary' else null end,
      p_billing_cycle, 0, p_currency, p_source, p_occurred_at, p_transaction_id,
      p_product_id, p_offer_id, p_plan_id, p_payload_hash
    ) on conflict do nothing;
  end if;

  if v_current_status in ('refunded','chargeback')
     and p_membership_status in ('trialing','active')
     and not v_new_subscription then
    return jsonb_build_object('status','illegal_transition','previous_status',v_current_status);
  end if;

  if v_current_event_at is not null and p_occurred_at < v_current_event_at and not v_new_subscription then
    return jsonb_build_object('status','stale_transition','previous_status',v_current_status);
  end if;

  v_plan := case when p_membership_status in ('trialing','active','past_due','cancelled') then 'pro' else 'free' end;

  insert into public.subscriptions (
    user_id, provider, status, trial_ends_at, current_period_end, access_until,
    cancel_at_period_end, hotmart_subscription_id, subscriber_code, product_id,
    plan_id, billing_cycle, grace_ends_at, first_paid_at, source, last_event_at
  ) values (
    p_user_id, 'hotmart', p_membership_status, p_trial_ends_at, p_current_period_end,
    p_access_until, p_cancel_at_period_end, p_hotmart_subscription_id, p_subscriber_code,
    p_product_id, p_plan_id, p_billing_cycle, p_grace_ends_at,
    case when p_membership_status = 'active' and p_amount_minor > 0 then p_occurred_at else null end,
    p_source, p_occurred_at
  ) on conflict (user_id) do update set
    status = excluded.status,
    trial_ends_at = coalesce(excluded.trial_ends_at, public.subscriptions.trial_ends_at),
    current_period_end = coalesce(excluded.current_period_end, public.subscriptions.current_period_end),
    access_until = case when excluded.status in ('expired','refunded','chargeback') then excluded.access_until
                        else coalesce(excluded.access_until, public.subscriptions.access_until) end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    hotmart_subscription_id = coalesce(excluded.hotmart_subscription_id, public.subscriptions.hotmart_subscription_id),
    subscriber_code = coalesce(excluded.subscriber_code, public.subscriptions.subscriber_code),
    product_id = excluded.product_id,
    plan_id = excluded.plan_id,
    billing_cycle = excluded.billing_cycle,
    grace_ends_at = excluded.grace_ends_at,
    first_paid_at = coalesce(public.subscriptions.first_paid_at, excluded.first_paid_at),
    source = coalesce(public.subscriptions.source, excluded.source),
    last_event_at = excluded.last_event_at;

  update public.profiles set
    email = p_email,
    display_name = coalesce(nullif(p_display_name, ''), display_name),
    plan = v_plan,
    status = p_membership_status,
    source = coalesce(source, p_source),
    anon_id = coalesce(anon_id, p_anon_id)
  where id = p_user_id;

  v_event_name := case p_membership_status
    when 'trialing' then 'trial_iniciado'
    when 'active' then 'pago_confirmado'
    when 'past_due' then 'pago_atrasado'
    when 'cancelled' then 'suscripcion_cancelada'
    when 'expired' then 'suscripcion_expirada'
    when 'refunded' then 'pago_reembolsado'
    when 'chargeback' then 'contracargo_recibido'
  end;

  insert into public.event_log (user_id, type, metadata, source, occurred_at, provider_event_id)
  values (
    p_user_id,
    v_event_name,
    jsonb_build_object('provider','hotmart','event_type',p_event_type,'billing_cycle',p_billing_cycle),
    p_source,
    p_occurred_at,
    p_event_id
  ) on conflict do nothing;

  return jsonb_build_object('status','applied','previous_status',v_current_status,'new_status',p_membership_status);
end;
$$;

revoke all on function public.apply_hotmart_event(
  text,text,text,uuid,text,text,text,text,text,text,text,text,bigint,text,text,text,
  timestamptz,text,text,timestamptz,timestamptz,timestamptz,timestamptz,boolean,text,text
) from public, anon, authenticated;

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
        and (
          (s.status = 'trialing' and s.trial_ends_at > now())
          or (s.status = 'active' and coalesce(s.access_until, s.current_period_end) > now())
          or (s.status = 'past_due' and s.grace_ends_at > now())
          or (s.status = 'cancelled' and s.access_until > now())
        )
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

commit;
