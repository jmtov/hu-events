export const checklistItems = [
  // ─── Q3 Sales Kickoff (event 001) ────────────────────────────────────────
  {
    id: 'chk-0001-0000-0000-000000000001',
    event_id: 'evt-0001-0000-0000-000000000001',
    label: 'Confirm RSVP',
    item_type: 'checkbox',
    required: true,
    alert_if_incomplete: true,
    sort_order: 0,
  },
  {
    id: 'chk-0001-0000-0000-000000000002',
    event_id: 'evt-0001-0000-0000-000000000001',
    label: 'Upload national ID or passport',
    item_type: 'document_upload',
    required: true,
    alert_if_incomplete: true,
    sort_order: 1,
  },
  {
    id: 'chk-0001-0000-0000-000000000003',
    event_id: 'evt-0001-0000-0000-000000000001',
    label: 'Submit dietary restrictions',
    item_type: 'info_input',
    required: false,
    alert_if_incomplete: false,
    sort_order: 2,
  },

  // ─── Engineering Hackathon 2026 (event 002) ───────────────────────────────
  {
    id: 'chk-0002-0000-0000-000000000001',
    event_id: 'evt-0002-0000-0000-000000000002',
    label: 'Sign code of conduct',
    item_type: 'checkbox',
    required: true,
    alert_if_incomplete: true,
    sort_order: 0,
  },
  {
    id: 'chk-0002-0000-0000-000000000002',
    event_id: 'evt-0002-0000-0000-000000000002',
    label: 'Submit GitHub username',
    item_type: 'info_input',
    required: true,
    alert_if_incomplete: true,
    sort_order: 1,
  },
  {
    id: 'chk-0002-0000-0000-000000000003',
    event_id: 'evt-0002-0000-0000-000000000002',
    label: 'Upload employee ID',
    item_type: 'document_upload',
    required: false,
    alert_if_incomplete: false,
    sort_order: 2,
  },
];

export const participantChecklistItems = [
  // ─── Q3 Sales Kickoff ────────────────────────────────────────────────────
  // Ana Garcia — all done
  {
    id: 'pci-0001-0000-0000-000000000001',
    participant_id: 'par-0001-0000-0000-000000000001',
    checklist_item_id: 'chk-0001-0000-0000-000000000001',
    completed: true,
    completed_at: '2026-03-08T10:00:00Z',
    document_url: null,
    value: null,
  },
  {
    id: 'pci-0001-0000-0000-000000000002',
    participant_id: 'par-0001-0000-0000-000000000001',
    checklist_item_id: 'chk-0001-0000-0000-000000000002',
    completed: true,
    completed_at: '2026-03-08T10:05:00Z',
    document_url: 'https://storage.example.com/docs/ana-passport.pdf',
    value: null,
  },
  {
    id: 'pci-0001-0000-0000-000000000003',
    participant_id: 'par-0001-0000-0000-000000000001',
    checklist_item_id: 'chk-0001-0000-0000-000000000003',
    completed: true,
    completed_at: '2026-03-08T10:10:00Z',
    document_url: null,
    value: 'Vegetarian',
  },
  // Carlos Mendez — nothing done
  {
    id: 'pci-0001-0000-0000-000000000004',
    participant_id: 'par-0001-0000-0000-000000000002',
    checklist_item_id: 'chk-0001-0000-0000-000000000001',
    completed: false,
    completed_at: null,
    document_url: null,
    value: null,
  },
  // Laura Silva — partially done
  {
    id: 'pci-0001-0000-0000-000000000005',
    participant_id: 'par-0001-0000-0000-000000000003',
    checklist_item_id: 'chk-0001-0000-0000-000000000001',
    completed: true,
    completed_at: '2026-03-09T11:00:00Z',
    document_url: null,
    value: null,
  },
  {
    id: 'pci-0001-0000-0000-000000000006',
    participant_id: 'par-0001-0000-0000-000000000003',
    checklist_item_id: 'chk-0001-0000-0000-000000000002',
    completed: false,
    completed_at: null,
    document_url: null,
    value: null,
  },
  // Sofia Lima — all done
  {
    id: 'pci-0001-0000-0000-000000000007',
    participant_id: 'par-0001-0000-0000-000000000005',
    checklist_item_id: 'chk-0001-0000-0000-000000000001',
    completed: true,
    completed_at: '2026-03-10T09:00:00Z',
    document_url: null,
    value: null,
  },
  {
    id: 'pci-0001-0000-0000-000000000008',
    participant_id: 'par-0001-0000-0000-000000000005',
    checklist_item_id: 'chk-0001-0000-0000-000000000002',
    completed: true,
    completed_at: '2026-03-10T09:05:00Z',
    document_url: 'https://storage.example.com/docs/sofia-passport.pdf',
    value: null,
  },

  // ─── Engineering Hackathon 2026 ───────────────────────────────────────────
  // Pedro Alves — all done
  {
    id: 'pci-0002-0000-0000-000000000001',
    participant_id: 'par-0002-0000-0000-000000000001',
    checklist_item_id: 'chk-0002-0000-0000-000000000001',
    completed: true,
    completed_at: '2026-03-11T10:00:00Z',
    document_url: null,
    value: null,
  },
  {
    id: 'pci-0002-0000-0000-000000000002',
    participant_id: 'par-0002-0000-0000-000000000001',
    checklist_item_id: 'chk-0002-0000-0000-000000000002',
    completed: true,
    completed_at: '2026-03-11T10:05:00Z',
    document_url: null,
    value: 'pedroalves-dev',
  },
  // Julia Santos — partially done
  {
    id: 'pci-0002-0000-0000-000000000003',
    participant_id: 'par-0002-0000-0000-000000000002',
    checklist_item_id: 'chk-0002-0000-0000-000000000001',
    completed: true,
    completed_at: '2026-03-11T11:00:00Z',
    document_url: null,
    value: null,
  },
  {
    id: 'pci-0002-0000-0000-000000000004',
    participant_id: 'par-0002-0000-0000-000000000002',
    checklist_item_id: 'chk-0002-0000-0000-000000000002',
    completed: false,
    completed_at: null,
    document_url: null,
    value: null,
  },
];
