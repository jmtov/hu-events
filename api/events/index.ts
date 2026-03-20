import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { CreateEventPayload } from '../../src/types/event.js'
import { supabase } from '../_lib/supabase.js'
import { readEvents, writeEvents, readBudgets, writeBudgets, readContacts, writeContacts } from '../_lib/mock-store.js'
import { readParticipants, writeParticipants } from '../_lib/participant-store.js'
import { readChecklistItems, writeChecklistItems } from '../_lib/checklist-store.js'
import { readPreferenceFields, writePreferenceFields } from '../_lib/preference-field-store.js'
import { readTriggers, writeTriggers } from '../_lib/trigger-store.js'

const USE_MOCK = process.env.USE_MOCK_DATA === 'true'

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    if (USE_MOCK) {
      return res.status(200).json(readEvents())
    }

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('date_start', { ascending: true })
    if (error) return res.status(500).json({ message: error.message })

    const { data: confirmed } = await supabase
      .from('participants')
      .select('event_id')
      .eq('rsvp_status', 'confirmed')

    const rsvpMap: Record<string, number> = {}
    for (const { event_id } of confirmed ?? []) {
      rsvpMap[event_id] = (rsvpMap[event_id] ?? 0) + 1
    }

    return res.status(200).json((events ?? []).map((e) => ({ ...e, rsvp_count: rsvpMap[e.id] ?? 0 })))
  }

  if (req.method === 'POST') {
    const body = req.body as Partial<CreateEventPayload> & { budget?: unknown; contacts?: unknown[] }

    if (!body.title?.trim()) return res.status(400).json({ message: 'title is required' })
    if (!body.description?.trim()) return res.status(400).json({ message: 'description is required' })
    if (!body.event_type) return res.status(400).json({ message: 'event_type is required' })
    if (!body.date_start?.trim()) return res.status(400).json({ message: 'date_start is required' })

    const modules = {
      participantList: body.modules?.participantList ?? true,
      checklist: body.modules?.checklist ?? true,
      budget: body.modules?.budget ?? false,
      notifications: body.modules?.notifications ?? true,
      contacts: body.modules?.contacts ?? false,
    }

    if (USE_MOCK) {
      const now = new Date().toISOString()
      const eventId = generateId('evt')
      const event = {
        id: eventId,
        title: body.title,
        description: body.description,
        event_type: body.event_type,
        date_start: body.date_start,
        date_end: body.date_end ?? null,
        location: body.location ?? null,
        expected_attendees: body.expected_attendees ?? null,
        event_day_info: body.event_day_info ?? null,
        modules,
        created_at: now,
        updated_at: now,
      }
      writeEvents([...readEvents(), event])
      if (modules.participantList && body.participants?.length) {
        writeParticipants([...readParticipants(), ...body.participants.map((p, i) => ({
          id: generateId('part'), event_id: eventId, email: p.email.trim(),
          full_name: '', google_uid: null, location_city: null, location_region: null,
          location_country: null, rsvp_status: 'pending' as const, created_at: now, updated_at: now, sort_order: i,
        }))])
      }
      if (modules.checklist && body.checklist?.length) {
        writeChecklistItems([...readChecklistItems(), ...body.checklist.map((item, i) => ({
          id: generateId('item'), event_id: eventId, label: item.label, item_type: item.item_type,
          required: item.required, alert_if_incomplete: item.alert_if_incomplete, sort_order: i,
        }))])
      }
      if (modules.participantList && body.preferenceFields?.length) {
        writePreferenceFields([...readPreferenceFields(), ...body.preferenceFields.map((field, i) => ({
          id: generateId('pref'), event_id: eventId, label: field.label, field_type: field.field_type,
          options: field.options ?? null, required: field.required, sort_order: i,
        }))])
      }
      if (modules.notifications && body.triggers?.length) {
        writeTriggers([...readTriggers(), ...body.triggers.map((t) => ({
          id: generateId('trig'), eventId, name: t.name, source: t.source,
          timing: t.timing, timingValue: t.timingValue, channel: t.channel, recipient: t.recipient,
        }))])
      }
      if (modules.budget && body.budget) {
        writeBudgets([...readBudgets(), { event_id: eventId, currency: 'USD', categories: body.budget as never, updated_at: now }])
      }
      if (modules.contacts && body.contacts?.length) {
        writeContacts([...readContacts(), ...body.contacts.map((c: unknown) => {
          const contact = c as { name: string; role: string; email: string; phone?: string }
          return { id: generateId('contact'), event_id: eventId, name: contact.name, role: contact.role, email: contact.email, phone: contact.phone ?? null }
        })])
      }
      return res.status(201).json(event)
    }

    // ── Supabase path ──────────────────────────────────────────────────────
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        title: body.title,
        description: body.description,
        event_type: body.event_type,
        date_start: body.date_start,
        date_end: body.date_end ?? null,
        location: body.location ?? null,
        expected_attendees: body.expected_attendees ?? null,
        event_day_info: body.event_day_info ?? null,
        modules,
      })
      .select()
      .single()
    if (error || !event) return res.status(500).json({ message: error?.message ?? 'Failed to create event' })

    const eventId = event.id as string

    if (modules.participantList && body.participants?.length) {
      await supabase.from('participants').insert(
        body.participants.map((p) => ({ event_id: eventId, email: p.email.trim(), full_name: '', rsvp_status: 'pending' })),
      )
    }

    if (modules.checklist && body.checklist?.length) {
      await supabase.from('checklist_items').insert(
        body.checklist.map((item, i) => ({
          event_id: eventId, label: item.label, item_type: item.item_type,
          required: item.required, alert_if_incomplete: item.alert_if_incomplete, sort_order: i,
        })),
      )
    }

    if (modules.participantList && body.preferenceFields?.length) {
      await supabase.from('preference_fields').insert(
        body.preferenceFields.map((field, i) => ({
          event_id: eventId, label: field.label, field_type: field.field_type,
          options: field.options ?? null, required: field.required, sort_order: i,
        })),
      )
    }

    if (modules.notifications && body.triggers?.length) {
      const { data: items } = await supabase.from('checklist_items').select('id, label').eq('event_id', eventId)
      await supabase.from('triggers').insert(
        body.triggers.map((t) => {
          if (t.source === 'checklist') {
            return {
              event_id: eventId, source: 'checklist_item',
              checklist_item_id: items?.find((ci) => ci.label === t.name)?.id ?? null,
              milestone_type: null, timing_type: t.timing,
              timing_value: t.timing === 'immediately' ? null : t.timingValue,
              channel: t.channel, recipient: t.recipient, active: true,
            }
          }
          return {
            event_id: eventId, source: 'milestone', checklist_item_id: null,
            milestone_type: t.name.includes('50%') ? 'rsvp_50' : 'event_ended',
            timing_type: 'immediately', timing_value: null,
            channel: t.channel, recipient: t.recipient, active: true,
          }
        }),
      )
    }

    if (modules.budget && body.budget) {
      await supabase.from('budget_config').insert({ event_id: eventId, currency: 'USD', categories: body.budget })
    }

    if (modules.contacts && body.contacts?.length) {
      await supabase.from('contacts').insert(
        body.contacts.map((c: unknown) => {
          const contact = c as { name: string; role: string; email: string; phone?: string }
          return { event_id: eventId, name: contact.name, role: contact.role, email: contact.email, phone: contact.phone ?? null }
        }),
      )
    }

    return res.status(201).json(event)
  }

  return res.status(405).end()
}
