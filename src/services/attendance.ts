import { api } from '@/lib/api'

export type ParticipantChecklistEntry = {
  id: string
  label: string
  item_type: 'checkbox' | 'document_upload' | 'info_input'
  required: boolean
  sort_order: number
  completed: boolean
  completed_at: string | null
  document_url: string | null
  value: string | null
}

export type ParticipantProfile = {
  id: string
  email: string
  full_name: string
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  location_city: string | null
  location_region: string | null
  location_country: string | null
}

export type ParticipantData = {
  participant: ParticipantProfile
  checklist: ParticipantChecklistEntry[]
}

type ProfilePayload = {
  email: string
  full_name: string
  location_city: string
  location_region: string
  location_country: string
  role?: string
}

export const attendanceService = {
  profile: (eventId: string, payload: ProfilePayload) =>
    api
      .patch(`/events/${eventId}/attendance`, { action: 'profile', ...payload })
      .then((r) => r.data),

  rsvp: (eventId: string, email: string, status: 'confirmed' | 'declined') =>
    api
      .patch(`/events/${eventId}/attendance`, { action: 'rsvp', email, status })
      .then((r) => r.data),

  checklistItem: (
    eventId: string,
    payload: { email: string; checklist_item_id: string; completed: boolean; value?: string },
  ) =>
    api
      .patch(`/events/${eventId}/attendance`, { action: 'checklist_item', ...payload })
      .then((r) => r.data),

  getParticipantData: (eventId: string, email: string) =>
    api
      .get<ParticipantData>(`/events/${eventId}/participant`, { params: { email } })
      .then((r) => r.data),

  deleteParticipant: (eventId: string, email: string) =>
    api
      .delete(`/events/${eventId}/attendance`, { params: { email } })
      .then((r) => r.data),

  getSignedUploadUrl: (payload: { path: string; contentType: string }) =>
    api
      .post<{ signedUrl: string | null; path: string }>('/upload/sign', payload)
      .then((r) => r.data),

  uploadDocument: (
    eventId: string,
    payload: { email: string; checklist_item_id: string; file_path: string },
  ) =>
    api
      .patch(`/events/${eventId}/attendance`, { action: 'upload', ...payload })
      .then((r) => r.data),
}
