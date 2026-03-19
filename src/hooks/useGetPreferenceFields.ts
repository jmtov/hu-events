import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useGetPreferenceFields = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId, 'preference-fields'],
    queryFn: () => eventService.getPreferenceFields(eventId),
    enabled: !!eventId,
  });
