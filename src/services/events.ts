import { api } from '@/lib/api';
import type { Event } from '@/types/event';

export const eventService = {
  getById: (eventId: string): Promise<Event> =>
    api.get<Event>(`/events/${eventId}`).then((r) => r.data),
};
