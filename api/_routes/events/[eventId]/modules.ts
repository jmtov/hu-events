import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Event, EventModules } from '../../../../src/types/event'
import { readEvents, writeEvents } from '../../../_lib/mock-store.js'

/**
 * PATCH /api/events/:eventId/modules — update which modules are enabled
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string }

  if (req.method !== 'PATCH') return res.status(405).end()

  const { modules } = req.body as { modules?: Partial<EventModules> }

  if (!modules || typeof modules !== 'object') {
    return res.status(400).json({ message: 'modules object is required' })
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    const all = readEvents()
    const index = all.findIndex((e) => e.id === eventId)
    if (index === -1) return res.status(404).json({ message: 'Event not found' })

    const updated: Event = {
      ...all[index],
      modules: { ...all[index].modules, ...modules },
      updated_at: new Date().toISOString(),
    }
    all[index] = updated
    writeEvents(all)
    return res.status(200).json(updated)
  }

  // TODO: update in Supabase
  return res.status(501).json({ message: 'Not implemented' })
}
