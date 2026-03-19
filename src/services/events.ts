import { api } from '@/lib/api';
import type {
  AdminEventSummary,
  CreateEventPayload,
  Event,
  EventModules,
} from '@/types/event';
import type { EventChecklistStat } from '@/types/checklist';
import type { Participant, PreferenceField } from '@/types/participant';

export const eventService = {
  getAdminEvents: () =>
    api.get<AdminEventSummary[]>('/admin/events').then((r) => r.data),

  getById: (eventId: string) =>
    api.get<Event>(`/events/${eventId}`).then((r) => r.data),

  create: (payload: CreateEventPayload) =>
    api.post<Event>('/events', payload).then((r) => r.data),

  updateModules: (eventId: string, modules: EventModules) =>
    api
      .patch<Event>(`/events/${eventId}/modules`, { modules })
      .then((r) => r.data),

  getPreferenceFields: (eventId: string) =>
    api
      .get<PreferenceField[]>(`/events/${eventId}/preference-fields`)
      .then((r) => r.data),

  getParticipants: (eventId: string) =>
    api
      .get<Participant[]>(`/events/${eventId}/participants`)
      .then((r) => r.data),

  getEventChecklist: (eventId: string) =>
    api
      .get<EventChecklistStat[]>(`/events/${eventId}/checklist`)
      .then((r) => r.data),
};
