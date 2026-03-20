import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../_lib/supabase.js'
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
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { email } = req.query as { email?: string }
  if (!email) return res.status(400).json({ message: 'email query param is required' })

  try {
    if (process.env.USE_MOCK_DATA === 'true') {
      const participants = readParticipants()
      const events = readEvents()
      const checklistItems = readChecklistItems()

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

    // ── Supabase path ──────────────────────────────────────────────────────────
    const { data: myParticipations, error } = await supabase
      .from('participants')
      .select('id, event_id, rsvp_status')
      .eq('email', email)
    if (error) return res.status(500).json({ message: error.message })
    if (!myParticipations?.length) return res.status(200).json([])

    const eventIds = myParticipations.map((p: { event_id: string }) => p.event_id)

    const [{ data: events }, { data: checklistItems }, { data: completions }] = await Promise.all([
      supabase.from('events').select('id, title, event_type, date_start, date_end, location').in('id', eventIds),
      supabase.from('checklist_items').select('id, event_id').in('event_id', eventIds),
      supabase
        .from('participant_checklist_items')
        .select('participant_id, checklist_item_id')
        .in('participant_id', myParticipations.map((p: { id: string }) => p.id))
        .eq('completed', true),
    ])

    const checklistCountMap: Record<string, number> = {}
    for (const item of checklistItems ?? []) {
      const i = item as { event_id: string }
      checklistCountMap[i.event_id] = (checklistCountMap[i.event_id] ?? 0) + 1
    }

    const completionCountMap: Record<string, number> = {}
    for (const c of completions ?? []) {
      const completion = c as { participant_id: string }
      completionCountMap[completion.participant_id] = (completionCountMap[completion.participant_id] ?? 0) + 1
    }

    const result: AttendeeEventSummary[] = myParticipations
      .map((participant: { id: string; event_id: string; rsvp_status: string }) => {
        const event = (events ?? []).find((e: { id: string }) => e.id === participant.event_id) as {
          id: string; title: string; event_type: string; date_start: string
          date_end: string | null; location: string | null
        } | undefined
        if (!event) return null
        return {
          id: event.id,
          title: event.title,
          event_type: event.event_type,
          date_start: event.date_start,
          date_end: event.date_end ?? null,
          location: event.location ?? null,
          rsvp_status: participant.rsvp_status as 'pending' | 'confirmed' | 'declined',
          checklist_total: checklistCountMap[event.id] ?? 0,
          checklist_completed: completionCountMap[participant.id] ?? 0,
        } satisfies AttendeeEventSummary
      })
      .filter((e): e is AttendeeEventSummary => e !== null)
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime())

    return res.status(200).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
