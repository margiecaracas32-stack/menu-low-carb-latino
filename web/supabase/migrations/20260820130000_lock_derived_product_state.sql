-- Keep derived product value behind the validated personalization RPC.
-- Authenticated clients may read their own generated plan, but they cannot
-- forge or directly rewrite meals, shopping lists, or progress records.

drop policy if exists "weekly_plans_own_all" on public.weekly_plans;
drop policy if exists "plan_meals_own_all" on public.plan_meals;
drop policy if exists "shopping_lists_own_all" on public.shopping_lists;
drop policy if exists "shopping_items_own_all" on public.shopping_items;
drop policy if exists "user_progress_insert_own" on public.user_progress;
drop policy if exists "weekly_plans_select_own" on public.weekly_plans;
drop policy if exists "plan_meals_select_own" on public.plan_meals;
drop policy if exists "shopping_lists_select_own" on public.shopping_lists;
drop policy if exists "shopping_items_select_own" on public.shopping_items;

create policy "weekly_plans_select_own" on public.weekly_plans
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "plan_meals_select_own" on public.plan_meals
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = plan_meals.plan_id
        and weekly_plans.user_id = (select auth.uid())
    )
  );

create policy "shopping_lists_select_own" on public.shopping_lists
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.weekly_plans
      where weekly_plans.id = shopping_lists.plan_id
        and weekly_plans.user_id = (select auth.uid())
    )
  );

create policy "shopping_items_select_own" on public.shopping_items
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.shopping_lists
      where shopping_lists.id = shopping_items.list_id
        and shopping_lists.user_id = (select auth.uid())
    )
  );

revoke insert, update, delete on public.weekly_plans from authenticated;
revoke insert, update, delete on public.plan_meals from authenticated;
revoke insert, update, delete on public.shopping_lists from authenticated;
revoke insert, update, delete on public.shopping_items from authenticated;
revoke insert, update, delete on public.user_progress from authenticated;
