export const events = [
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    title: 'Q2 Sales Kickoff',
    description:
      'Quarterly gathering for the entire sales team. Includes product updates, pipeline review, and team-building activities.',
    event_type: 'bdr_call',
    date_start: '2026-04-14T09:00:00Z',
    date_end: '2026-04-15T18:00:00Z',
    location: 'Buenos Aires, Argentina',
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
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000002',
    title: 'Engineering Hackathon 2026',
    description:
      '48-hour hackathon for the engineering org. Teams of 4 build a working prototype around the theme of AI-assisted workflows.',
    event_type: 'hackathon',
    date_start: '2026-05-02T08:00:00Z',
    date_end: '2026-05-04T20:00:00Z',
    location: 'Montevideo, Uruguay',
    modules: {
      participantList: true,
      checklist: true,
      budget: false,
      notifications: true,
      contacts: false,
    },
    created_at: '2026-03-05T10:00:00Z',
    updated_at: '2026-03-05T10:00:00Z',
  },

  // ─── Leadership Summit 2026 (event 003) — full-module test event ─────────
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000003',
    title: 'Leadership Summit 2026',
    description:
      'Annual offsite for people managers across all regions. Agenda includes strategy alignment sessions, leadership workshops, and an evening networking dinner.',
    event_type: 'hr_retreat',
    date_start: '2026-06-18T08:00:00Z',
    date_end: '2026-06-19T20:00:00Z',
    location: 'Cartagena, Colombia',
    expected_attendees: 40,
    event_day_info: 'Hotel Santa Clara, Sala Bolívar. Dress code: smart casual.',
    modules: {
      participantList: true,
      checklist: true,
      budget: true,
      notifications: true,
      contacts: true,
    },
    created_at: '2026-03-15T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
];
