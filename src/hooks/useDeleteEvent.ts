import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => eventService.delete(eventId),
    onSuccess: (_data, eventId) => {
      queryClient.removeQueries({ queryKey: ['events', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};
