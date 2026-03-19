import type { VercelRequest, VercelResponse } from '@vercel/node'
import { participants } from '../../_fixtures'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { eventId } = req.query as { eventId: string }

  if (process.env.USE_MOCK_DATA === 'true') {
    const eventParticipants = participants.filter((p) => p.event_id === eventId)
    return res.status(200).json(eventParticipants)
  }

  // TODO: query Supabase
  return res.status(501).json({ message: 'Not implemented' })
}
