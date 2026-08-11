-- Save onboarding preferences, a seven-day plan and its shopping list atomically.
-- The application derives the curated plan, while this boundary verifies that
-- only known recipe keys and safe values can enter durable product tables.

create or replace function public.save_personalized_week(
  p_household_size smallint,
  p_available_minutes smallint,
  p_avoids text[],
  p_week_start date,
  p_meals jsonb,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_plan_id uuid;
  v_list_id uuid;
  v_allowed_recipes constant text[] := array[
    'pollo-calabacin', 'pollo-limon', 'carne-pimientos', 'chuletas-aguacate',
    'pavo-repollo', 'atun-aguacate', 'cerdo-brocoli', 'pollo-aguacate',
    'ropa-vieja', 'pescado-coco', 'picadillo-coliflor', 'pernil-repollo',
    'tortilla-espinaca', 'albondigas-criollas'
  ];
begin
  if v_user_id is null then raise exception 'authentication_required' using errcode = '42501'; end if;
  if not public.has_app_access() then raise exception 'access_required' using errcode = '42501'; end if;
  if p_household_size not between 1 and 12 then raise exception 'invalid_household_size' using errcode = '22023'; end if;
  if p_available_minutes not in (20, 30, 45) then raise exception 'invalid_available_minutes' using errcode = '22023'; end if;
  if p_avoids is null or not p_avoids <@ array['dairy', 'egg', 'nuts', 'shellfish']::text[] then
    raise exception 'invalid_avoids' using errcode = '22023';
  end if;
  if p_week_start < current_date - 1 or p_week_start > current_date + 1 then
    raise exception 'invalid_week_start' using errcode = '22023';
  end if;
  if jsonb_typeof(p_meals) <> 'array' or jsonb_array_length(p_meals) <> 7 then
    raise exception 'invalid_meals' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > 80 then
    raise exception 'invalid_items' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_meals) as m(meal_date date, recipe_key text, servings smallint)
    where m.meal_date is null or m.recipe_key is null or m.recipe_key <> all(v_allowed_recipes)
      or m.servings <> p_household_size
  ) then raise exception 'invalid_meal_entry' using errcode = '22023'; end if;
  if (select count(distinct m.meal_date) from jsonb_to_recordset(p_meals) as m(meal_date date)) <> 7
    or (select min(m.meal_date) from jsonb_to_recordset(p_meals) as m(meal_date date)) <> p_week_start
    or (select max(m.meal_date) from jsonb_to_recordset(p_meals) as m(meal_date date)) <> p_week_start + 6
  then raise exception 'invalid_meal_dates' using errcode = '22023'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as i(label text, amount text, aisle text, position integer)
    where i.label is null or length(i.label) not between 1 and 160
      or i.amount is null or length(i.amount) > 80
      or i.aisle not in ('Vegetales', 'Proteínas', 'Despensa')
      or i.position is null or i.position not between 0 and 79
  ) then raise exception 'invalid_shopping_entry' using errcode = '22023'; end if;

  insert into public.households (user_id, size, available_minutes)
  values (v_user_id, p_household_size, p_available_minutes)
  on conflict (user_id) do update set size = excluded.size, available_minutes = excluded.available_minutes;

  delete from public.dietary_preferences where user_id = v_user_id and kind = 'avoid';
  insert into public.dietary_preferences (user_id, kind, value, strict)
  select v_user_id, 'avoid', value, true from unnest(p_avoids) as value;

  insert into public.weekly_plans (user_id, week_start, status, algorithm_version)
  values (v_user_id, p_week_start, 'active', 'curated-v2')
  on conflict (user_id, week_start) do update
    set status = 'active', algorithm_version = 'curated-v2'
  returning id into v_plan_id;

  delete from public.plan_meals where plan_id = v_plan_id;
  insert into public.plan_meals (plan_id, user_id, meal_date, recipe_key, servings)
  select v_plan_id, v_user_id, meal_date, recipe_key, servings
  from jsonb_to_recordset(p_meals) as m(meal_date date, recipe_key text, servings smallint)
  order by meal_date;

  insert into public.shopping_lists (plan_id, user_id)
  values (v_plan_id, v_user_id)
  on conflict (plan_id) do update set user_id = excluded.user_id
  returning id into v_list_id;

  delete from public.shopping_items where list_id = v_list_id;
  insert into public.shopping_items (list_id, user_id, label, amount, aisle, position)
  select v_list_id, v_user_id, label, amount, aisle, position::smallint
  from jsonb_to_recordset(p_items) as i(label text, amount text, aisle text, position integer)
  order by position;

  return v_plan_id;
end;
$$;

revoke all on function public.save_personalized_week(smallint, smallint, text[], date, jsonb, jsonb) from public, anon;
grant execute on function public.save_personalized_week(smallint, smallint, text[], date, jsonb, jsonb) to authenticated;

