import { api } from '@/lib/api';
import type { AdminEventSummary, CreateEventPayload, Event } from '@/types/event';
import type { PreferenceField } from '@/types/participant';

export const eventService = {
  getAdminEvents: () =>
    api.get<AdminEventSummary[]>('/admin/events').then((r) => r.data),

  getById: (eventId: string) =>
    api.get<Event>(`/events/${eventId}`).then((r) => r.data),

  create: (payload: CreateEventPayload) =>
    api.post<Event>('/events', payload).then((r) => r.data),

  getPreferenceFields: (eventId: string) =>
    api
      .get<PreferenceField[]>(`/events/${eventId}/preference-fields`)
      .then((r) => r.data),
};
