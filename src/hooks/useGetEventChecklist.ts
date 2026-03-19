import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services/events';

export const useGetEventChecklist = (eventId: string) =>
  useQuery({
    queryKey: ['events', eventId, 'checklist'],
    queryFn: () => eventService.getEventChecklist(eventId),
    enabled: !!eventId,
  });
