import { api } from '@/lib/api';
import type { Contact, CreateContactPayload, UpdateContactPayload } from '@/types/contact';

export const contactService = {
  getByEvent: (eventId: string) =>
    api.get<Contact[]>(`/events/${eventId}/contacts`).then((r) => r.data),

  create: (eventId: string, payload: CreateContactPayload) =>
    api.post<Contact>(`/events/${eventId}/contacts`, payload).then((r) => r.data),

  update: (contactId: string, payload: UpdateContactPayload) =>
    api.patch<Contact>(`/contacts/${contactId}`, payload).then((r) => r.data),

  delete: (contactId: string) =>
    api.delete(`/contacts/${contactId}`).then((r) => r.data),
};
