import { api } from '@/lib/api'

export type AttendeeEventSummary = {
  id: string
  title: string
  event_type: string
  date_start: string
  date_end: string | null
  location: string | null
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  checklist_total: number
  checklist_completed: number
}

export const attendeeService = {
  getEvents: (email: string) =>
    api
      .get<AttendeeEventSummary[]>('/attendee/events', { params: { email } })
      .then((r) => r.data),
}
