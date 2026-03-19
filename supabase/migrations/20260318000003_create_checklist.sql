-- Checklist items: admin-defined tasks per event
create table if not exists checklist_items (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references events (id) on delete cascade,
  label               text not null,
  item_type           text not null default 'checkbox'
                        check (item_type in ('checkbox', 'document_upload', 'info_input')),
  required            boolean not null default false,
  -- When true, a notification trigger is auto-created for this item
  alert_if_incomplete boolean not null default false,
  sort_order          int     not null default 0
);

-- Completion state per participant per item
create table if not exists participant_checklist_items (
  id               uuid primary key default gen_random_uuid(),
  participant_id   uuid not null references participants (id) on delete cascade,
  checklist_item_id uuid not null references checklist_items (id) on delete cascade,
  completed        boolean     not null default false,
  completed_at     timestamptz,
  -- For item_type = 'document_upload': Supabase Storage URL
  document_url     text,
  -- For item_type = 'info_input': submitted text value
  value            text,
  unique (participant_id, checklist_item_id)
);
