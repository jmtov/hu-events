import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useGetParticipants = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId, 'participants'],
    queryFn: () => eventService.getParticipants(eventId),
    enabled: !!eventId,
  });
