import { useMutation } from '@tanstack/react-query';
import { budgetService } from '@/services/budget';
import type { EstimateBudgetPayload } from '@/types/budget';

export const useEstimateBudget = () =>
  useMutation({
    mutationFn: (payload: EstimateBudgetPayload) =>
      budgetService.estimateBudget(payload),
  });
