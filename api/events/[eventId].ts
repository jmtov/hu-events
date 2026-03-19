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
  const { eventId } = req.query as { eventId: string }

  if (req.method === 'GET') {
    const event = readEvents().find((e) => e.id === eventId)
    if (!event) return res.status(404).json({ message: 'Event not found' })
    return res.status(200).json(event)
  }

  if (req.method === 'PUT') {
    const body = req.body as Partial<CreateEventPayload>

    if (!body.title?.trim()) return res.status(400).json({ message: 'title is required' })
    if (!body.description?.trim()) return res.status(400).json({ message: 'description is required' })
    if (!body.event_type) return res.status(400).json({ message: 'event_type is required' })
    if (!body.date_start?.trim()) return res.status(400).json({ message: 'date_start is required' })

    const all = readEvents()
    const index = all.findIndex((e) => e.id === eventId)
    if (index === -1) return res.status(404).json({ message: 'Event not found' })

    const now = new Date().toISOString()
    const updated: Event = {
      ...all[index],
      title: body.title,
      description: body.description,
      event_type: body.event_type,
      date_start: body.date_start,
      date_end: body.date_end ?? null,
      location: body.location ?? null,
      expected_attendees: body.expected_attendees ?? null,
      event_day_info: body.event_day_info ?? null,
      modules: {
        participantList: body.modules?.participantList ?? all[index].modules.participantList,
        checklist: body.modules?.checklist ?? all[index].modules.checklist,
        budget: body.modules?.budget ?? all[index].modules.budget,
        notifications: body.modules?.notifications ?? all[index].modules.notifications,
        contacts: body.modules?.contacts ?? all[index].modules.contacts,
      },
      updated_at: now,
    }
    all[index] = updated
    writeEvents(all)

    const otherParticipants = readParticipants().filter((p) => p.event_id !== eventId)
    const newParticipants = updated.modules.participantList && body.participants?.length
      ? body.participants.map((p, i) => ({
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
      : []
    writeParticipants([...otherParticipants, ...newParticipants])

    const otherItems = readChecklistItems().filter((i) => i.event_id !== eventId)
    const newItems = updated.modules.checklist && body.checklist?.length
      ? body.checklist.map((item, i) => ({
          id: generateId('item'),
          event_id: eventId,
          label: item.label,
          item_type: item.item_type,
          required: item.required,
          alert_if_incomplete: item.alert_if_incomplete,
          sort_order: i,
        }))
      : []
    writeChecklistItems([...otherItems, ...newItems])

    const otherFields = readPreferenceFields().filter((f) => f.event_id !== eventId)
    const newFields = updated.modules.participantList && body.preferenceFields?.length
      ? body.preferenceFields.map((field, i) => ({
          id: generateId('pref'),
          event_id: eventId,
          label: field.label,
          field_type: field.field_type,
          options: field.options ?? null,
          required: field.required,
          sort_order: i,
        }))
      : []
    writePreferenceFields([...otherFields, ...newFields])

    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    const all = readEvents()
    const index = all.findIndex((e) => e.id === eventId)
    if (index === -1) return res.status(404).json({ message: 'Event not found' })

    writeEvents(all.filter((e) => e.id !== eventId))
    writeParticipants(readParticipants().filter((p) => p.event_id !== eventId))
    writeChecklistItems(readChecklistItems().filter((i) => i.event_id !== eventId))
    writePreferenceFields(readPreferenceFields().filter((f) => f.event_id !== eventId))

    return res.status(204).end()
  }

  return res.status(405).end()
}
