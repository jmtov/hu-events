import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { Event } from '../../src/types/event'
import { readEvents, writeEvents } from '../_lib/mock-store'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string }

  if (req.method === 'GET') {
    if (process.env.USE_MOCK_DATA === 'true') {
      const event = readEvents().find((e) => e.id === eventId)
      if (!event) return res.status(404).json({ message: 'Event not found' })
      return res.status(200).json(event)
    }
    // TODO: query Supabase
    return res.status(501).json({ message: 'Not implemented' })
  }

  if (req.method === 'PATCH') {
    const body = req.body as Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>

    if (process.env.USE_MOCK_DATA === 'true') {
      const all = readEvents()
      const index = all.findIndex((e) => e.id === eventId)
      if (index === -1) return res.status(404).json({ message: 'Event not found' })

      const updated: Event = {
        ...all[index],
        ...body,
        id: all[index].id,
        created_at: all[index].created_at,
        updated_at: new Date().toISOString(),
      }
      all[index] = updated
      writeEvents(all)
      return res.status(200).json(updated)
    }
    // TODO: update in Supabase
    return res.status(501).json({ message: 'Not implemented' })
  }

  return res.status(405).end()
}
