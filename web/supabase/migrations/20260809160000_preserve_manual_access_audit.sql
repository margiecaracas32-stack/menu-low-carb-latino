begin;

-- Support history must survive deletion of the target Auth account. The email,
-- reason, timestamps and actor remain in these append-only business records.
alter table public.manual_access_events
  drop constraint if exists manual_access_events_target_user_id_fkey;

alter table public.manual_access_events
  alter column target_user_id drop not null;

alter table public.manual_access_events
  add constraint manual_access_events_target_user_id_fkey
  foreign key (target_user_id) references auth.users(id) on delete set null;

alter table public.manual_access_grants
  drop constraint if exists manual_access_grants_user_id_fkey;

alter table public.manual_access_grants
  alter column user_id drop not null;

alter table public.manual_access_grants
  add constraint manual_access_grants_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;

commit;
