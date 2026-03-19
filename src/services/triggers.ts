import { api } from '@/lib/api';
import type { Trigger, UpdateTriggerPayload } from '@/types/trigger';

export const triggersService = {
  getByEvent: (eventId: string): Promise<Trigger[]> =>
    api.get<Trigger[]>(`/events/${eventId}/triggers`).then((r) => r.data),

  update: (triggerId: string, payload: UpdateTriggerPayload): Promise<Trigger> =>
    api.patch<Trigger>(`/triggers/${triggerId}`, payload).then((r) => r.data),
};
