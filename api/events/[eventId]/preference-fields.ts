import type { VercelRequest, VercelResponse } from '@vercel/node'
import { preferenceFields } from '../../_fixtures/index.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { eventId } = req.query as { eventId: string }

  if (process.env.USE_MOCK_DATA === 'true') {
    const fields = preferenceFields.filter((f) => f.event_id === eventId)
    return res.status(200).json(fields)
  }

  // TODO: query Supabase
  return res.status(501).json({ message: 'Not implemented' })
}
