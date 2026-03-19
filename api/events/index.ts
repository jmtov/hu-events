import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { CreateEventPayload, Event } from '../../src/types/event'

function generateId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const body = req.body as Partial<CreateEventPayload>

  if (!body.title?.trim()) {
    return res.status(400).json({ message: 'title is required' })
  }
  if (!body.description?.trim()) {
    return res.status(400).json({ message: 'description is required' })
  }
  if (!body.event_type) {
    return res.status(400).json({ message: 'event_type is required' })
  }
  if (!body.date_start?.trim()) {
    return res.status(400).json({ message: 'date_start is required' })
  }

  if (process.env.USE_MOCK_DATA === 'true') {
    const now = new Date().toISOString()
    const event: Event = {
      id: generateId(),
      title: body.title,
      description: body.description,
      event_type: body.event_type,
      date_start: body.date_start,
      date_end: body.date_end ?? null,
      location: body.location ?? null,
      modules: {
        participantList: true,
        checklist: true,
        budget: false,
        notifications: true,
        contacts: false,
      },
      created_at: now,
      updated_at: now,
    }
    return res.status(201).json(event)
  }

  // TODO: insert into Supabase
  return res.status(501).json({ message: 'Not implemented' })
}
