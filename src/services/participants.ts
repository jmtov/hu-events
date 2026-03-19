import { api } from '@/lib/api';
import type { Participant, UpdateParticipantPayload } from '@/types/participant';

type AddParticipantPayload = { email: string };

export const participantService = {
  getByEvent: (eventId: string) =>
    api
      .get<Participant[]>(`/events/${eventId}/participants`)
      .then((r) => r.data),

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
