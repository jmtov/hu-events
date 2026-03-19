export const triggers = [
  // Auto-created from checklist item "Confirm RSVP" (alert_if_incomplete: true)
  {
    id: 'a7b8c9d0-0007-0000-0000-000000000001',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    source: 'checklist_item',
    checklist_item_id: 'e5f6a7b8-0005-0000-0000-000000000001',
    milestone_type: null,
    timing_type: 'days_before',
    timing_value: 3,
    channel: 'email',
    recipient: 'attendee',
    active: true,
  },
  // Auto-created from checklist item "Upload national ID" (alert_if_incomplete: true)
  {
    id: 'a7b8c9d0-0007-0000-0000-000000000002',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    source: 'checklist_item',
    checklist_item_id: 'e5f6a7b8-0005-0000-0000-000000000002',
    milestone_type: null,
    timing_type: 'days_before',
    timing_value: 5,
    channel: 'whatsapp',
    recipient: 'attendee',
    active: true,
  },
  // Fixed milestone: RSVP hits 50%
  {
    id: 'a7b8c9d0-0007-0000-0000-000000000003',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    source: 'milestone',
    checklist_item_id: null,
    milestone_type: 'rsvp_50',
    timing_type: 'immediately',
    timing_value: null,
    channel: 'slack',
    recipient: 'hr_admin',
    active: true,
  },
  // Fixed milestone: event ended
  {
    id: 'a7b8c9d0-0007-0000-0000-000000000004',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    source: 'milestone',
    checklist_item_id: null,
    milestone_type: 'event_ended',
    timing_type: 'immediately',
    timing_value: null,
    channel: 'email',
    recipient: 'both',
    active: true,
  },
];

export const triggerLog = [
  {
    id: 'b8c9d0e1-0008-0000-0000-000000000001',
    trigger_id: 'a7b8c9d0-0007-0000-0000-000000000003',
    fired_at: '2026-03-09T15:30:00Z',
    recipient_participant_id: null,
    status: 'sent',
    error: null,
  },
];
