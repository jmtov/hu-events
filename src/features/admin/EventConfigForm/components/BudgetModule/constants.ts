import type { BudgetCategory } from '@/types/budget';

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    key: 'flights',
    label: 'Flights',
    enabled: false,
    ai_estimate: null,
    cap: null,
    is_custom: false,
  },
  {
    key: 'accommodation',
    label: 'Accommodation',
    enabled: false,
    ai_estimate: null,
    cap: null,
    is_custom: false,
  },
  {
    key: 'food',
    label: 'Food & Beverages',
    enabled: false,
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
];
