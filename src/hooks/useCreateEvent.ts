import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/events';
import type { CreateEventPayload, Event } from '@/types/event';

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventService.create(payload),
    onSuccess: (event: Event) => {
      // Seed the individual event cache so the detail page loads instantly
      queryClient.setQueryData(['events', event.id], event);
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
