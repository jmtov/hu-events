-- Notification triggers: configured by admin, fired by the backend via n8n
create table if not exists triggers (
  id                  uuid primary key default gen_random_uuid(),
  event_id            uuid not null references events (id) on delete cascade,
  -- 'checklist_item' triggers come from checklist items with alert_if_incomplete = true.
  -- 'milestone' triggers are fixed (rsvp_50, event_ended).
  source              text not null
                        check (source in ('checklist_item', 'milestone')),
  checklist_item_id   uuid references checklist_items (id) on delete cascade,
  milestone_type      text
                        check (milestone_type in ('rsvp_50', 'event_ended')),
  -- Timing: when to fire relative to the event or deadline
  timing_type         text not null default 'immediately'
                        check (timing_type in ('immediately', 'days_before', 'hours_after')),
  timing_value        int,
  channel             text not null default 'email'
                        check (channel in ('slack', 'email', 'whatsapp')),
  recipient           text not null default 'attendee'
                        check (recipient in ('attendee', 'hr_admin', 'both')),
  active              boolean not null default true,
  -- Checklist-sourced triggers must reference a checklist item
  constraint chk_source_checklist check (
    source != 'checklist_item' or checklist_item_id is not null
  ),
  -- Milestone triggers must have a milestone type
  constraint chk_source_milestone check (
    source != 'milestone' or milestone_type is not null
  )
);

-- Log of fired notifications for the admin dashboard
create table if not exists trigger_log (
  id                     uuid primary key default gen_random_uuid(),
  trigger_id             uuid not null references triggers (id) on delete cascade,
  fired_at               timestamptz not null default now(),
  recipient_participant_id uuid references participants (id) on delete set null,
  status                 text not null default 'sent'
                           check (status in ('sent', 'failed')),
  error                  text
);
