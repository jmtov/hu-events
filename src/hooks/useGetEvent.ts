import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useGetEvent = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventService.getById(eventId),
    enabled: !!eventId,
  });
