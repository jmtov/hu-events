import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/events';
import type { CreateEventPayload } from '@/types/event';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
