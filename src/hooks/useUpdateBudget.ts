import { useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '@/services/budget';
import type { UpdateBudgetPayload } from '@/types/budget';

export const useUpdateBudget = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateBudgetPayload) =>
      budgetService.updateBudget(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
};
