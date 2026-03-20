import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useGetPreferenceFields = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId],
    queryFn: () => eventService.getById(eventId),
    select: (data) => data.preference_fields,
    enabled: !!eventId,
  });
