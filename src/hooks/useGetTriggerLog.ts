import { useQuery } from '@tanstack/react-query';
import { triggerLogService } from '@/services/triggerLog';
import type { TriggerLogEntry } from '@/types/trigger-log';

export const useGetTriggerLog = (eventId: string) =>
  useQuery({
    queryKey: ['trigger-log', eventId],
    queryFn: () => triggerLogService.getByEvent(eventId),
    select: (data): TriggerLogEntry[] => (Array.isArray(data) ? data : []),
  });
