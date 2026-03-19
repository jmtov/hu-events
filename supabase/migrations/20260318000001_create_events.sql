-- Events: core entity
create table if not exists events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  event_type  text not null default 'other'
                check (event_type in ('hr_retreat', 'bdr_call', 'hackathon', 'workshop', 'other')),
  date_start  timestamptz not null,
  date_end    timestamptz,
  location    text,
  -- Which modules are enabled. Each key maps to a boolean.
  modules     jsonb not null default '{
    "participantList": false,
    "checklist": false,
    "budget": false,
    "notifications": false,
    "contacts": false
  }',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on every write
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
before update on events
for each row execute function set_updated_at();
