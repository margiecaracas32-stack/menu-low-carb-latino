-- Durable product data for the internal Menu Low Carb Latino experience.
-- Recipe content remains versioned in the application; user-specific plans and
-- progress live in Supabase and are isolated with row-level security.

create table if not exists public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  algorithm_version text not null default 'curated-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_plans_user_week_idx
  on public.weekly_plans(user_id, week_start desc);

create table if not exists public.plan_meals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.weekly_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  meal_date date not null,
  recipe_key text not null check (length(recipe_key) between 1 and 120),
  servings smallint not null default 2 check (servings between 1 and 12),
  status text not null default 'planned' check (status in ('planned', 'completed', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (plan_id, meal_date)
);

create index if not exists plan_meals_user_date_idx
  on public.plan_meals(user_id, meal_date desc);

create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null unique references public.weekly_plans(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopping_lists_user_idx
  on public.shopping_lists(user_id);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.shopping_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null check (length(label) between 1 and 160),
  amount text check (amount is null or length(amount) <= 80),
  aisle text not null default 'Otros' check (length(aisle) between 1 and 80),
  checked boolean not null default false,
  position smallint not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopping_items_list_position_idx
  on public.shopping_items(list_id, position, created_at);

create table if not exists public.recipe_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_key text not null check (length(recipe_key) between 1 and 120),
  favorite boolean not null default false,
  sentiment text check (sentiment is null or sentiment in ('liked', 'neutral', 'disliked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recipe_key)
);

create index if not exists recipe_feedback_user_idx
  on public.recipe_feedback(user_id);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_meals integer not null default 0 check (completed_meals >= 0),
  completed_weeks integer not null default 0 check (completed_weeks >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_activity_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.weekly_plans enable row level security;
alter table public.plan_meals enable row level security;
alter table public.shopping_lists enable row level security;
alter table public.shopping_items enable row level security;
alter table public.recipe_feedback enable row level security;
alter table public.user_progress enable row level security;

create policy "weekly_plans_own_all" on public.weekly_plans
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "plan_meals_own_all" on public.plan_meals
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = plan_meals.plan_id
        and weekly_plans.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = plan_meals.plan_id
        and weekly_plans.user_id = (select auth.uid())
    )
  );

create policy "shopping_lists_own_all" on public.shopping_lists
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = shopping_lists.plan_id
        and weekly_plans.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = shopping_lists.plan_id
        and weekly_plans.user_id = (select auth.uid())
    )
  );

create policy "shopping_items_own_all" on public.shopping_items
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_items.list_id
        and shopping_lists.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_items.list_id
        and shopping_lists.user_id = (select auth.uid())
    )
  );

create policy "recipe_feedback_own_all" on public.recipe_feedback
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "user_progress_select_own" on public.user_progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_progress_insert_own" on public.user_progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create trigger weekly_plans_set_updated_at
before update on public.weekly_plans
for each row execute function public.set_updated_at();

create trigger plan_meals_set_updated_at
before update on public.plan_meals
for each row execute function public.set_updated_at();

create trigger shopping_lists_set_updated_at
before update on public.shopping_lists
for each row execute function public.set_updated_at();

create trigger shopping_items_set_updated_at
before update on public.shopping_items
for each row execute function public.set_updated_at();

create trigger recipe_feedback_set_updated_at
before update on public.recipe_feedback
for each row execute function public.set_updated_at();

create trigger user_progress_set_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();
