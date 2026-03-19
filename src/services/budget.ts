import { api } from '@/lib/api';
import type {
  Budget,
  BudgetEstimateResult,
  EstimateBudgetPayload,
  UpdateBudgetPayload,
} from '@/types/budget';

export const budgetService = {
  getBudget: (eventId: string): Promise<Budget> =>
    api.get<Budget>(`/events/${eventId}/budget`).then((r) => r.data),

  updateBudget: (eventId: string, payload: UpdateBudgetPayload): Promise<Budget> =>
    api.patch<Budget>(`/events/${eventId}`, payload).then((r) => r.data),

  estimateBudget: (payload: EstimateBudgetPayload): Promise<BudgetEstimateResult> =>
    api.post<BudgetEstimateResult>('/ai/estimate-budget', payload).then((r) => r.data),
};
