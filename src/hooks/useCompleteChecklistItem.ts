import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

type CompleteChecklistItemPayload = {
  email: string;
  checklist_item_id: string;
  completed: boolean;
  value?: string;
};

export const useCompleteChecklistItem = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompleteChecklistItemPayload) =>
      api
        .patch(`/events/${eventId}/attendance`, { action: 'checklist_item', ...payload })
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participant', eventId] });
    },
  });
};
