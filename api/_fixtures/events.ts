export const events = [
  // ─── Q3 Sales Kickoff (event 001) ────────────────────────────────────────
  {
    id: '00000001-0000-0001-0000-000000000001',
    title: 'Q3 Sales Kickoff',
    description:
      'Quarterly gathering for the entire sales team. Includes product updates, pipeline review, goal-setting sessions, and team-building activities.',
    event_type: 'bdr_call',
    date_start: '2026-04-14T09:00:00Z',
    date_end: '2026-04-15T18:00:00Z',
    location: 'Buenos Aires, Argentina',
    expected_attendees: 8,
    event_day_info: null,
    modules: {
      participantList: true,
      checklist: true,
      budget: true,
      notifications: true,
      contacts: true,
    },
    created_at: '2026-03-01T12:00:00Z',
    updated_at: '2026-03-10T09:30:00Z',
  },

  // ─── Engineering Hackathon 2026 (event 002) ───────────────────────────────
  {
    id: '00000001-0000-0001-0000-000000000002',
    title: 'Engineering Hackathon 2026',
    description:
      '48-hour hackathon for the engineering org. Teams of 4 build a working prototype around the theme of AI-assisted internal workflows.',
    event_type: 'hackathon',
    date_start: '2026-05-02T08:00:00Z',
    date_end: '2026-05-04T20:00:00Z',
    location: 'Montevideo, Uruguay',
    expected_attendees: 12,
    event_day_info: null,
    modules: {
      participantList: true,
      checklist: true,
      budget: true,
      notifications: true,
      contacts: true,
    },
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-12T14:00:00Z',
  },
];
