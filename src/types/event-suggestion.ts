import type { ChecklistSuggestion } from './checklist';
import type { BudgetCategoryKey } from './budget';

export type SuggestEventPayload = {
  title: string;
  description: string;
};

export type EventSuggestion = {
  event_type: string;
  date_start: string | null;
  date_end: string | null;
  location: string | null;
  expected_attendees: number | null;
  checklist: ChecklistSuggestion[];
  budget_estimates: Partial<Record<BudgetCategoryKey, number>>;
};
