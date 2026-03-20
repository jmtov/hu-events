import { api } from '@/lib/api';
import type { AdminEventSummary, CreateEventPayload, Event, EventDetail } from '@/types/event';
import type { Participant } from '@/types/participant';
import type { EventChecklistStat } from '@/types/checklist';

export const eventService = {
  getAdminEvents: () =>
    api.get<AdminEventSummary[]>('/admin/events').then((r) => r.data),

  getById: (eventId: string) =>
    api.get<EventDetail>(`/events/${eventId}`).then((r) => r.data),

  create: (payload: CreateEventPayload) =>
    api.post<Event>('/events', payload).then((r) => r.data),

  update: (eventId: string, payload: CreateEventPayload) =>
    api.put<Event>(`/events/${eventId}`, payload).then((r) => r.data),

  delete: (eventId: string) =>
    api.delete(`/events/${eventId}`).then((r) => r.data),

  getParticipants: (eventId: string) =>
    api
      .get<Participant[]>(`/events/${eventId}/participants`)
      .then((r) => r.data),

  getEventChecklist: (eventId: string) =>
    api
      .get<EventChecklistStat[]>(`/events/${eventId}/checklist`)
      .then((r) => r.data),
};
