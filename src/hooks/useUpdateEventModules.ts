import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/events';
import type { EventModules } from '@/types/event';

export const useUpdateEventModules = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modules: EventModules) =>
      eventService.updateModules(eventId, modules),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(['events', eventId], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ['events', eventId] });
    },
  });
};
