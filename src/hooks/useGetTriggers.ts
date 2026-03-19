import { useQuery } from '@tanstack/react-query';
import { triggersService } from '@/services/triggers';
import type { Trigger } from '@/types/trigger';

export const useGetTriggers = (eventId: string) =>
  useQuery({
    queryKey: ['triggers', eventId],
    queryFn: () => triggersService.getByEvent(eventId),
    select: (data): Trigger[] => (Array.isArray(data) ? data : []),
  });
