import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistService } from '@/services/checklist';

export const useDeleteChecklistItem = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => checklistService.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', eventId] });
    },
  });
};
