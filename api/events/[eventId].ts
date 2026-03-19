import type { VercelRequest, VercelResponse } from '@vercel/node'
import { events } from '../_fixtures'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { eventId } = req.query as { eventId: string }

  if (process.env.USE_MOCK_DATA === 'true') {
    const event = events.find((e) => e.id === eventId)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    return res.status(200).json(event)
  }

  // TODO: query Supabase
  return res.status(501).json({ message: 'Not implemented' })
}
