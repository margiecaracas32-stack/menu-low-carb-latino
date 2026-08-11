-- Product analytics idempotency. Existing rows remain valid; new writes use a
-- server-derived key so retries and React remounts cannot inflate metrics.

alter table public.event_log
  add column if not exists event_key text;

create unique index if not exists event_log_event_key_unique
  on public.event_log(event_key);

create index if not exists event_log_session_occurred_idx
  on public.event_log(anonymous_session_id, occurred_at desc)
  where anonymous_session_id is not null;

comment on column public.event_log.event_key is
  'Server-derived idempotency key. Never contains email, name or user content.';
