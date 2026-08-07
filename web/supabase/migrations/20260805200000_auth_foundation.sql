-- Authentication foundation for Menu Low Carb Latino.
-- Every client-readable table is protected with row-level security.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  timezone text not null default 'America/New_York',
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'pending' check (
    status in ('pending', 'trialing', 'active', 'past_due', 'cancelled', 'refunded', 'chargeback')
  ),
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  size smallint not null default 1 check (size between 1 and 12),
  available_minutes smallint check (available_minutes between 10 and 180),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.dietary_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('avoid', 'allergy', 'dislike', 'favorite')),
  value text not null check (length(value) between 1 and 120),
  strict boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind, value)
);

create index if not exists dietary_preferences_user_id_idx
  on public.dietary_preferences(user_id);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text not null default 'hotmart' check (provider = 'hotmart'),
  status text not null default 'pending' check (
    status in ('pending', 'trialing', 'active', 'past_due', 'cancelled', 'refunded', 'chargeback', 'expired')
  ),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  access_until timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.dietary_preferences enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "households_select_own" on public.households
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "households_insert_own" on public.households
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "households_update_own" on public.households
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "households_delete_own" on public.households
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "dietary_preferences_select_own" on public.dietary_preferences
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "dietary_preferences_insert_own" on public.dietary_preferences
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "dietary_preferences_update_own" on public.dietary_preferences
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "dietary_preferences_delete_own" on public.dietary_preferences
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger households_set_updated_at
before update on public.households
for each row execute function public.set_updated_at();

create trigger dietary_preferences_set_updated_at
before update on public.dietary_preferences
for each row execute function public.set_updated_at();

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, new.id::text || '@invalid.local'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

