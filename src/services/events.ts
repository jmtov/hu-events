import { api } from '@/lib/api';
import type { AdminEventSummary, CreateEventPayload, Event, EventDetail } from '@/types/event';
import type { EventChecklistStat } from '@/types/checklist';
import type { PreferenceField } from '@/types/participant';

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

  // Read-only — data is written via the full event save payload
  getEventChecklist: (eventId: string) =>
    api.get<EventChecklistStat[]>(`/events/${eventId}/checklist`).then((r) => r.data),

  getPreferenceFields: (eventId: string) =>
    api.get<PreferenceField[]>(`/events/${eventId}/preference-fields`).then((r) => r.data),

  getParticipants: (eventId: string) =>
    api.get(`/events/${eventId}/participants`).then((r) => r.data),
};
