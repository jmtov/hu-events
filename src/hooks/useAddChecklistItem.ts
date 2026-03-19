import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistService } from '@/services/checklist';
import type { CreateChecklistItemPayload } from '@/types/checklist';

export const useAddChecklistItem = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateChecklistItemPayload) =>
      checklistService.addItem(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', eventId] });
    },
  });
};
