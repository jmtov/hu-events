import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistService } from '@/services/checklist';
import type { UpdateChecklistItemPayload } from '@/types/checklist';

export const useUpdateChecklistItem = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: UpdateChecklistItemPayload;
    }) => checklistService.updateItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist', eventId] });
    },
  });
};
