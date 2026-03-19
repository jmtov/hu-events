import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readPreferenceFields } from '../../_lib/preference-field-store.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { eventId } = req.query as { eventId: string }
  return res.status(200).json(readPreferenceFields().filter((f) => f.event_id === eventId))
}
