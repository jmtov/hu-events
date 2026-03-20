import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { AdminEventSummary } from '../../src/types/event.js'
import { readEvents } from '../_lib/mock-store.js'
import { readParticipants } from '../_lib/participant-store.js'
import { supabase } from '../_lib/supabase.js'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  if (USE_MOCK) {
    const events = readEvents()
    const participants = readParticipants()

    const result: AdminEventSummary[] = events.map((event) => ({
      ...event,
      rsvp_count: participants.filter(
        (p) => p.event_id === event.id && p.rsvp_status === 'confirmed',
      ).length,
    }))

    return res.status(200).json(result)
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .order('date_start', { ascending: true })
  if (error) return res.status(500).json({ message: error.message })

  const { data: confirmed } = await supabase
    .from('participants')
    .select('event_id')
    .eq('rsvp_status', 'confirmed')

  const rsvpMap: Record<string, number> = {}
  for (const { event_id } of confirmed ?? []) {
    rsvpMap[event_id] = (rsvpMap[event_id] ?? 0) + 1
  }

  const result: AdminEventSummary[] = (events ?? []).map((e) => ({ ...e, rsvp_count: rsvpMap[e.id] ?? 0 }))
  return res.status(200).json(result)
}
