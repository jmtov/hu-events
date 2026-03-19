import { api } from '@/lib/api';
import type { Participant, UpdateParticipantPayload } from '@/types/participant';

type AddParticipantPayload = { email: string };

export const participantService = {
  // Read — used by active hooks and components
  getByEvent: (eventId: string) =>
    api
      .get<Participant[]>(`/events/${eventId}/participants`)
      .then((r) => r.data),

  // Write — participants are now managed via the full event save payload (POST/PUT /events/:id).
  // These methods are kept for backward compatibility with existing components.
  add: (eventId: string, payload: AddParticipantPayload) =>
    api
      .post<Participant>(`/events/${eventId}/participants`, payload)
      .then((r) => r.data),

  update: (participantId: string, payload: UpdateParticipantPayload) =>
    api
      .patch<Participant>(`/participants/${participantId}`, payload)
      .then((r) => r.data),

  remove: (participantId: string) =>
    api.delete(`/participants/${participantId}`).then((r) => r.data),
};
