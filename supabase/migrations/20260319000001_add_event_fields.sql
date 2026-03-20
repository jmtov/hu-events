-- Add expected_attendees and event_day_info to events table
alter table events add column if not exists expected_attendees int;
alter table events add column if not exists event_day_info text;
