export const BUDGET_CATEGORY_KEYS = [
  'flights',
  'accommodation',
  'food',
  'comms',
  'misc',
] as const;

export type BudgetCategoryKey = (typeof BUDGET_CATEGORY_KEYS)[number];

export type BudgetCategory = {
  key: string; // BudgetCategoryKey for built-ins, arbitrary string for custom
  label: string;
  enabled: boolean;
  ai_estimate: number | null; // USD per person, populated by AI
  cap: number | null; // admin override cap per person, USD
  is_custom: boolean;
};

export type Budget = {
  event_id: string;
  currency: string;
  categories: BudgetCategory[];
  updated_at: string;
};

export type UpdateBudgetPayload = {
  categories: BudgetCategory[];
};

export type EstimateBudgetPayload = {
  event_type: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  destination: string | null;
  participants: Array<{
    location_city: string;
    location_country: string;
  }>;
  category_keys: string[];
};

export type BudgetEstimateResult = {
  estimates: Record<string, number>; // category key → USD per person
};
