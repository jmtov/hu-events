import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readEvents } from '../_lib/mock-store.js'
import { readParticipants } from '../_lib/participant-store.js'
import { readChecklistItems } from '../_lib/checklist-store.js'
import { participantChecklistItems } from '../_fixtures/index.js'

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

/**
 * GET /api/attendee/events?email=...
 *
 * Returns all events where the given email is registered as a participant,
 * along with the attendee's RSVP status and checklist completion count.
 *
 * TODO: replace email query param with a session token once attendee auth is implemented.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { email } = req.query as { email?: string }
  if (!email) return res.status(400).json({ message: 'email query param is required' })

  try {
    if (process.env.USE_MOCK_DATA === 'true') {
      const participants = readParticipants()
      const events = readEvents()
      const checklistItems = readChecklistItems()

      // Find all participant records for this email
      const myParticipations = participants.filter((p) => p.email === email)

      const result: AttendeeEventSummary[] = myParticipations
        .map((participant) => {
          const event = events.find((e) => e.id === participant.event_id)
          if (!event) return null

          const eventChecklistItems = checklistItems.filter(
            (item) => item.event_id === event.id,
          )

          const myCompletions = participantChecklistItems.filter(
            (c) => c.participant_id === participant.id && c.completed,
          )

          return {
            id: event.id,
            title: event.title,
            event_type: event.event_type,
            date_start: event.date_start,
            date_end: event.date_end ?? null,
            location: event.location ?? null,
            rsvp_status: participant.rsvp_status,
            checklist_total: eventChecklistItems.length,
            checklist_completed: myCompletions.length,
          } satisfies AttendeeEventSummary
        })
        .filter((e): e is AttendeeEventSummary => e !== null)
        .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

      return res.status(200).json(result)
    }

    // TODO: Supabase implementation
    return res.status(501).json({ message: 'Not implemented without mock data' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
