-- Participants: attendees linked to an event
create table if not exists participants (
  id               uuid primary key default gen_random_uuid(),
  event_id         uuid not null references events (id) on delete cascade,
  email            text not null,
  full_name        text not null default '',
  google_uid       text,
  -- Location stored at city level for cost estimation and document detection
  location_city    text,
  location_region  text,
  location_country text,
  rsvp_status      text not null default 'pending'
                     check (rsvp_status in ('pending', 'confirmed', 'declined')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (event_id, email)
);

create trigger participants_updated_at
before update on participants
for each row execute function set_updated_at();

-- Preference fields: custom fields defined by the admin per event
create table if not exists preference_fields (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events (id) on delete cascade,
  label      text not null,
  field_type text not null default 'text'
               check (field_type in ('text', 'select', 'boolean')),
  -- Used when field_type = 'select'. Array of option strings.
  options    jsonb,
  required   boolean not null default false,
  sort_order int     not null default 0
);

-- Participant preference values: one row per participant per field
create table if not exists participant_preferences (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid not null references participants (id) on delete cascade,
  field_id       uuid not null references preference_fields (id) on delete cascade,
  value          text,
  unique (participant_id, field_id)
);
