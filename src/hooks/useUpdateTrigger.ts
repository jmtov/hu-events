import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggersService } from '@/services/triggers';
import type { UpdateTriggerPayload } from '@/types/trigger';

export const useUpdateTrigger = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      triggerId,
      payload,
    }: {
      triggerId: string;
      payload: UpdateTriggerPayload;
    }) => triggersService.update(triggerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers', eventId] });
    },
  });
};
