import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { AdminEventSummary } from '../../src/types/event.js'
import { readParticipants } from '../_lib/participant-store.js'
import { readEvents } from '../_lib/mock-store.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

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
