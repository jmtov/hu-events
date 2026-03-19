import { api } from '@/lib/api';
import type { TriggerLogEntry } from '@/types/trigger-log';

export const triggerLogService = {
  getByEvent: (eventId: string): Promise<TriggerLogEntry[]> =>
    api
      .get<TriggerLogEntry[]>(`/events/${eventId}/trigger-log`)
      .then((r) => r.data),
};
