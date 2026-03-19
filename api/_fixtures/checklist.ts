export const checklistItems = [
  {
    id: 'e5f6a7b8-0005-0000-0000-000000000001',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    label: 'Confirm RSVP',
    item_type: 'checkbox',
    required: true,
    alert_if_incomplete: true,
    sort_order: 0,
  },
  {
    id: 'e5f6a7b8-0005-0000-0000-000000000002',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    label: 'Upload national ID or passport',
    item_type: 'document_upload',
    required: true,
    alert_if_incomplete: true,
    sort_order: 1,
  },
  {
    id: 'e5f6a7b8-0005-0000-0000-000000000003',
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    label: 'Submit dietary restrictions',
    item_type: 'info_input',
    required: false,
    alert_if_incomplete: false,
    sort_order: 2,
  },
]

export const participantChecklistItems = [
  // Ana Garcia — all done
  {
    id: 'f6a7b8c9-0006-0000-0000-000000000001',
    participant_id: 'b2c3d4e5-0002-0000-0000-000000000001',
    checklist_item_id: 'e5f6a7b8-0005-0000-0000-000000000001',
    completed: true,
    completed_at: '2026-03-08T10:00:00Z',
    document_url: null,
    value: null,
  },
  {
    id: 'f6a7b8c9-0006-0000-0000-000000000002',
    participant_id: 'b2c3d4e5-0002-0000-0000-000000000001',
    checklist_item_id: 'e5f6a7b8-0005-0000-0000-000000000002',
    completed: true,
    completed_at: '2026-03-08T10:05:00Z',
    document_url: 'https://storage.example.com/docs/ana-passport.pdf',
    value: null,
  },
  // Carlos Mendez — nothing done yet
  {
    id: 'f6a7b8c9-0006-0000-0000-000000000003',
    participant_id: 'b2c3d4e5-0002-0000-0000-000000000002',
    checklist_item_id: 'e5f6a7b8-0005-0000-0000-000000000001',
    completed: false,
    completed_at: null,
    document_url: null,
    value: null,
  },
]
