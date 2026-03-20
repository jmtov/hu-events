// triggers is kept here for legacy mock-API compatibility but is not exported from index.ts
export const triggers = [];

// triggerLog — frontend shape (TriggerLogEntry), used by the mock API.
// generate-seed.ts and db-push.ts strip fields that don't exist in the DB
// (event_id, trigger_name, channel, recipient_name) and only persist the DB columns.
export const triggerLog = [
  {
    id: '0000000a-0000-0001-0000-000000000001',
    event_id: '00000001-0000-0001-0000-000000000001',
    trigger_id: '00000009-0000-0001-0000-000000000003',
    trigger_name: 'RSVP milestone',
    fired_at: '2026-03-09T15:30:00Z',
    channel: 'slack',
    recipient_name: 'HR Admin',
    status: 'sent',
    error: null,
  },
  {
    id: '0000000a-0000-0001-0000-000000000002',
    event_id: '00000001-0000-0001-0000-000000000001',
    trigger_id: '00000009-0000-0001-0000-000000000002',
    trigger_name: 'Checklist incomplete — Passport upload',
    fired_at: '2026-03-11T09:15:00Z',
    channel: 'email',
    recipient_name: 'Gabriel Gouveia',
    status: 'sent',
    error: null,
  },
  {
    id: '0000000a-0000-0001-0000-000000000003',
    event_id: '00000001-0000-0001-0000-000000000001',
    trigger_id: '00000009-0000-0001-0000-000000000001',
    trigger_name: 'Deadline approaching',
    fired_at: '2026-03-12T08:00:00Z',
    channel: 'whatsapp',
    recipient_name: 'Marcos Cestaro',
    status: 'failed',
    error: 'WhatsApp delivery timeout',
  },
  {
    id: '0000000a-0000-0001-0000-000000000004',
    event_id: '00000001-0000-0001-0000-000000000001',
    trigger_id: '00000009-0000-0001-0000-000000000004',
    trigger_name: 'Event ended — Post-event survey',
    fired_at: '2026-04-15T20:05:00Z',
    channel: 'email',
    recipient_name: 'All attendees',
    status: 'sent',
    error: null,
  },
];
