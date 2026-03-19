-- Budget config: one row per event
-- Categories stored as JSONB array to allow dynamic category names and ordering.
-- Shape: [{ name: string, enabled: boolean, cap: number | null, ai_estimate: number | null }]
create table if not exists budget_config (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events (id) on delete cascade,
  categories jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  unique (event_id)
);

create trigger budget_config_updated_at
before update on budget_config
for each row execute function set_updated_at();
