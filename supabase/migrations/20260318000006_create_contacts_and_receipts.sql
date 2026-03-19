-- Event contact persons: visible to attendees
create table if not exists contacts (
  id       uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  name     text not null,
  role     text not null default '',
  email    text not null,
  phone    text
);

-- Receipts: expense uploads submitted by attendees during or after the event
create table if not exists receipts (
  id             uuid primary key default gen_random_uuid(),
  participant_id uuid     not null references participants (id) on delete cascade,
  amount         numeric  not null check (amount > 0),
  category       text     not null,
  -- Supabase Storage URL for the uploaded file
  file_url       text     not null,
  submitted_at   timestamptz not null default now()
);
