import type { Budget } from '../../src/types/budget.js';

// Seed budget for event 001 (Q2 Sales Kickoff — budget module enabled)
export const budgets: Budget[] = [
  {
    event_id: 'a1b2c3d4-0001-0000-0000-000000000001',
    currency: 'USD',
    categories: [
      {
        key: 'flights',
        label: 'Flights',
        enabled: true,
        ai_estimate: null,
        cap: null,
        is_custom: false,
      },
      {
        key: 'accommodation',
        label: 'Accommodation',
        enabled: true,
        ai_estimate: null,
        cap: null,
        is_custom: false,
      },
      {
        key: 'food',
        label: 'Food & Beverages',
        enabled: true,
        ai_estimate: null,
        cap: null,
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
        enabled: false,
        ai_estimate: null,
        cap: null,
        is_custom: false,
      },
    ],
    updated_at: '2026-03-10T09:30:00Z',
  },
];
