import type { Budget } from '../../src/types/budget.js';

export const budgets: Budget[] = [
  // ─── Q3 Sales Kickoff (event 001) ────────────────────────────────────────
  {
    event_id: '00000001-0000-0001-0000-000000000001',
    currency: 'USD',
    categories: [
      {
        key: 'flights',
        label: 'Flights',
        enabled: true,
        ai_estimate: 420,
        cap: 500,
        is_custom: false,
      },
      {
        key: 'accommodation',
        label: 'Accommodation',
        enabled: true,
        ai_estimate: 180,
        cap: 200,
        is_custom: false,
      },
      {
        key: 'food',
        label: 'Food & Beverages',
        enabled: true,
        ai_estimate: 90,
        cap: 100,
        is_custom: false,
      },
      {
        key: 'comms',
        label: 'Communications & Equipment',
        enabled: false,
        ai_estimate: null,
        cap: null,
        is_custom: false,
      },
      {
        key: 'misc',
        label: 'Miscellaneous',
        enabled: true,
        ai_estimate: 40,
        cap: 50,
        is_custom: false,
      },
    ],
    updated_at: '2026-03-10T09:30:00Z',
  },

  // ─── Engineering Hackathon 2026 (event 002) ───────────────────────────────
  {
    event_id: '00000001-0000-0001-0000-000000000002',
    currency: 'USD',
    categories: [
      {
        key: 'flights',
        label: 'Flights',
        enabled: true,
        ai_estimate: 380,
        cap: 400,
        is_custom: false,
      },
      {
        key: 'accommodation',
        label: 'Accommodation',
        enabled: true,
        ai_estimate: 210,
        cap: 250,
        is_custom: false,
      },
      {
        key: 'food',
        label: 'Food & Beverages',
        enabled: true,
        ai_estimate: 120,
        cap: 150,
        is_custom: false,
      },
      {
        key: 'comms',
        label: 'Communications & Equipment',
        enabled: true,
        ai_estimate: 60,
        cap: 80,
        is_custom: false,
      },
      {
        key: 'misc',
        label: 'Miscellaneous',
        enabled: false,
        ai_estimate: null,
        cap: null,
        is_custom: false,
      },
    ],
    updated_at: '2026-03-12T14:00:00Z',
  },
];
