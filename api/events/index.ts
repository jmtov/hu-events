import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { CreateEventPayload, Event } from '../../src/types/event.js'
import { readEvents, writeEvents } from '../_lib/mock-store.js'
import { readParticipants, writeParticipants } from '../_lib/participant-store.js'
import { readChecklistItems, writeChecklistItems } from '../_lib/checklist-store.js'
import { readPreferenceFields, writePreferenceFields } from '../_lib/preference-field-store.js'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(readEvents())
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<CreateEventPayload>

    if (!body.title?.trim()) return res.status(400).json({ message: 'title is required' })
    if (!body.description?.trim()) return res.status(400).json({ message: 'description is required' })
    if (!body.event_type) return res.status(400).json({ message: 'event_type is required' })
    if (!body.date_start?.trim()) return res.status(400).json({ message: 'date_start is required' })

    const now = new Date().toISOString()
    const eventId = generateId('evt')

    const event: Event = {
      id: eventId,
      title: body.title,
      description: body.description,
      event_type: body.event_type,
      date_start: body.date_start,
      date_end: body.date_end ?? null,
      location: body.location ?? null,
      expected_attendees: body.expected_attendees ?? null,
      event_day_info: body.event_day_info ?? null,
      modules: {
        participantList: body.modules?.participantList ?? true,
        checklist: body.modules?.checklist ?? true,
        budget: body.modules?.budget ?? false,
        notifications: body.modules?.notifications ?? true,
        contacts: body.modules?.contacts ?? false,
      },
      created_at: now,
      updated_at: now,
    }

    writeEvents([...readEvents(), event])

    if (body.modules?.participantList && body.participants?.length) {
      const newParticipants = body.participants.map((p, i) => ({
        id: generateId('part'),
        event_id: eventId,
        email: p.email.trim(),
        full_name: '',
        google_uid: null,
        location_city: null,
        location_region: null,
        location_country: null,
        rsvp_status: 'pending' as const,
        created_at: now,
        updated_at: now,
        sort_order: i,
      }))
      writeParticipants([...readParticipants(), ...newParticipants])
    }

    if (body.modules?.checklist && body.checklist?.length) {
      const newItems = body.checklist.map((item, i) => ({
        id: generateId('item'),
        event_id: eventId,
        label: item.label,
        item_type: item.item_type,
        required: item.required,
        alert_if_incomplete: item.alert_if_incomplete,
        sort_order: i,
      }))
      writeChecklistItems([...readChecklistItems(), ...newItems])
    }

    if (body.modules?.participantList && body.preferenceFields?.length) {
      const newFields = body.preferenceFields.map((field, i) => ({
        id: generateId('pref'),
        event_id: eventId,
        label: field.label,
        field_type: field.field_type,
        options: field.options ?? null,
        required: field.required,
        sort_order: i,
      }))
      writePreferenceFields([...readPreferenceFields(), ...newFields])
    }

    return res.status(201).json(event)
  }

  return res.status(405).end()
}
