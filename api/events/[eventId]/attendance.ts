import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../_lib/supabase.js'
import { readParticipants, writeParticipants } from '../../_lib/participant-store.js'
import { readEvents } from '../../_lib/mock-store.js'
import { readChecklistItems } from '../../_lib/checklist-store.js'
import { readTriggers } from '../../_lib/trigger-store.js'
import { readParticipantChecklistItems, writeParticipantChecklistItems } from '../../_lib/participant-checklist-store.js'

type ProfileAction = {
  action: 'profile'
  email: string
  full_name: string
  location_city: string
  location_region: string
  location_country: string
  role?: string
}

type RsvpAction = {
  action: 'rsvp'
  email: string
  status: 'confirmed' | 'declined'
}

type ChecklistItemAction = {
  action: 'checklist_item'
  email: string
  checklist_item_id: string
  completed: boolean
  value?: string
}

type UploadAction = {
  action: 'upload'
  email: string
  checklist_item_id: string
  file_path: string
}

type AttendanceAction = ProfileAction | RsvpAction | ChecklistItemAction | UploadAction

async function fireN8nWebhook(payload: Record<string, unknown>): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    console.log('[n8n] N8N_WEBHOOK_URL not set — webhook skipped. Payload:', JSON.stringify(payload))
    return
  }
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': process.env.N8N_WEBHOOK_SECRET ?? '',
      },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[n8n] Webhook call failed:', err)
  }
}

async function checkAndFireThresholdMock(
  eventId: string,
  confirmedBefore: number,
  confirmedAfter: number,
): Promise<void> {
  const events = readEvents()
  const event = events.find((e) => e.id === eventId)
  if (!event || !event.expected_attendees) return

  const threshold = event.expected_attendees * 0.5
  if (confirmedBefore >= threshold || confirmedAfter < threshold) return

  const triggers = readTriggers()
  const milestoneTrigger = triggers.find(
    (t) => t.eventId === eventId && t.source === 'milestone' && t.name.toLowerCase().includes('rsvp'),
  )
  await fireN8nWebhook({
    type: 'rsvp_milestone',
    eventId: event.id,
    eventName: event.title,
    currentRsvpCount: confirmedAfter,
    expectedAttendees: event.expected_attendees,
    thresholdPercent: 50,
    channel: milestoneTrigger?.channel ?? 'slack',
  })

  const checklistItems = readChecklistItems()
  const alertItems = checklistItems.filter(
    (item) => item.event_id === eventId && item.alert_if_incomplete,
  )
  if (alertItems.length === 0) return

  const checklistTriggers = triggers.filter(
    (t) => t.eventId === eventId && t.source === 'checklist' && t.timing === 'days_before',
  )
  const daysBeforeEvent =
    checklistTriggers.length > 0 ? Math.min(...checklistTriggers.map((t) => t.timingValue)) : 3
  const channel = checklistTriggers[0]?.channel ?? 'email'

  const participants = readParticipants()
  const confirmedParticipants = participants.filter(
    (p) => p.event_id === eventId && p.rsvp_status === 'confirmed',
  )

  for (const participant of confirmedParticipants) {
    const completedIds = new Set(
      participantChecklistItems
        .filter((c) => c.participant_id === participant.id && c.completed)
        .map((c) => c.checklist_item_id),
    )
    const incompleteLabels = alertItems
      .filter((item) => !completedIds.has(item.id))
      .map((item) => item.label)

    if (incompleteLabels.length === 0) continue

    await fireN8nWebhook({
      type: 'checklist_incomplete',
      eventId: event.id,
      eventName: event.title,
      attendeeEmail: participant.email,
      attendeeName: participant.full_name,
      incompleteItems: incompleteLabels,
      daysBeforeEvent,
      channel,
    })
  }
}

async function checkAndFireThresholdSupabase(
  eventId: string,
  confirmedBefore: number,
  confirmedAfter: number,
): Promise<void> {
  const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
  if (!event || !event.expected_attendees) return

  const threshold = (event.expected_attendees as number) * 0.5
  if (confirmedBefore >= threshold || confirmedAfter < threshold) return

  const { data: milestoneTrigger } = await supabase
    .from('triggers')
    .select('*')
    .eq('event_id', eventId)
    .eq('source', 'milestone')
    .ilike('milestone_type', '%rsvp%')
    .maybeSingle()

  await fireN8nWebhook({
    type: 'rsvp_milestone',
    eventId: event.id,
    eventName: event.title,
    currentRsvpCount: confirmedAfter,
    expectedAttendees: event.expected_attendees,
    thresholdPercent: 50,
    channel: (milestoneTrigger as { channel?: string } | null)?.channel ?? 'slack',
  })
}

/**
 * PATCH /api/events/:eventId/attendance
 * DELETE /api/events/:eventId/attendance?email=...
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    const { eventId, email } = req.query as { eventId: string; email?: string }
    if (!email) return res.status(400).json({ message: 'email is required' })

    try {
      if (process.env.USE_MOCK_DATA === 'true') {
        const participants = readParticipants()
        const participant = participants.find((p) => p.event_id === eventId && p.email === email)
        if (!participant) return res.status(404).json({ message: 'Participant not found' })

        writeParticipants(participants.filter((p) => p.id !== participant.id))

        const checklistItems = readParticipantChecklistItems()
        writeParticipantChecklistItems(checklistItems.filter((c) => c.participant_id !== participant.id))

        return res.status(200).json({ ok: true })
      }

      const { data: participant } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle()
      if (!participant) return res.status(404).json({ message: 'Participant not found' })

      const participantId = (participant as { id: string }).id

      await supabase.from('participant_checklist_items').delete().eq('participant_id', participantId)
      await supabase.from('participants').delete().eq('id', participantId)

      return res.status(200).json({ ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return res.status(500).json({ message })
    }
  }

  if (req.method !== 'PATCH') return res.status(405).end()

  const { eventId } = req.query as { eventId: string }
  if (!eventId) return res.status(400).json({ message: 'eventId is required' })

  const body = req.body as AttendanceAction
  if (!body?.action) return res.status(400).json({ message: 'action is required' })

  try {
    if (process.env.USE_MOCK_DATA === 'true') {
      const participants = readParticipants()

      if (body.action === 'profile') {
        const { email, full_name, location_city, location_region, location_country } =
          body as ProfileAction
        if (!email) return res.status(400).json({ message: 'email is required' })

        const index = participants.findIndex((p) => p.event_id === eventId && p.email === email)

        if (index !== -1) {
          participants[index] = {
            ...participants[index],
            full_name,
            location_city,
            location_region,
            location_country,
            updated_at: new Date().toISOString(),
          }
          writeParticipants(participants)
          return res.status(200).json(participants[index])
        }

        const newParticipant = {
          id: `join-${Date.now()}`,
          event_id: eventId,
          email,
          full_name,
          google_uid: null,
          location_city,
          location_region,
          location_country,
          rsvp_status: 'pending' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        writeParticipants([...participants, newParticipant])
        return res.status(201).json(newParticipant)
      }

      if (body.action === 'rsvp') {
        const { email, status } = body as RsvpAction
        if (!email) return res.status(400).json({ message: 'email is required' })
        if (!status) return res.status(400).json({ message: 'status is required' })

        const index = participants.findIndex((p) => p.event_id === eventId && p.email === email)
        if (index === -1) return res.status(404).json({ message: 'Participant not found' })

        const prevStatus = participants[index].rsvp_status

        const confirmedBefore = participants.filter(
          (p) => p.event_id === eventId && p.rsvp_status === 'confirmed',
        ).length

        participants[index] = {
          ...participants[index],
          rsvp_status: status,
          updated_at: new Date().toISOString(),
        }
        writeParticipants(participants)

        if (status === 'confirmed' && prevStatus !== 'confirmed') {
          const confirmedAfter = participants.filter(
            (p) => p.event_id === eventId && p.rsvp_status === 'confirmed',
          ).length

          checkAndFireThresholdMock(eventId, confirmedBefore, confirmedAfter).catch((err) =>
            console.error('[attendance] threshold check failed:', err),
          )
        }

        return res.status(200).json({ ok: true })
      }

      if (body.action === 'checklist_item') {
        const { email, checklist_item_id, completed, value } = body as ChecklistItemAction
        if (!email) return res.status(400).json({ message: 'email is required' })
        if (!checklist_item_id) return res.status(400).json({ message: 'checklist_item_id is required' })

        const participant = participants.find((p) => p.event_id === eventId && p.email === email)
        if (!participant) return res.status(404).json({ message: 'Participant not found' })

        const items = readParticipantChecklistItems()
        const now = new Date().toISOString()
        const existing = items.findIndex(
          (c) => c.participant_id === participant.id && c.checklist_item_id === checklist_item_id,
        )

        if (existing !== -1) {
          items[existing] = {
            ...items[existing],
            completed,
            completed_at: completed ? now : null,
            value: value ?? items[existing].value,
          }
        } else {
          items.push({
            id: `pci-${Date.now()}`,
            participant_id: participant.id,
            checklist_item_id,
            completed,
            completed_at: completed ? now : null,
            document_url: null,
            value: value ?? null,
          })
        }
        writeParticipantChecklistItems(items)

        // Auto-confirm: if all required checklist items for this participant are now completed
        const checklistItems = readChecklistItems().filter((ci) => ci.event_id === eventId && ci.required)
        const completionMap = new Map(
          items.filter((c) => c.participant_id === participant.id).map((c) => [c.checklist_item_id, c]),
        )
        const allRequiredDone = checklistItems.every((ci) => completionMap.get(ci.id)?.completed === true)

        if (allRequiredDone && participant.rsvp_status !== 'confirmed') {
          const allParticipants = readParticipants()
          const idx = allParticipants.findIndex((p) => p.id === participant.id)
          if (idx !== -1) {
            const confirmedBefore = allParticipants.filter(
              (p) => p.event_id === eventId && p.rsvp_status === 'confirmed',
            ).length
            allParticipants[idx] = { ...allParticipants[idx], rsvp_status: 'confirmed', updated_at: now }
            writeParticipants(allParticipants)
            const confirmedAfter = confirmedBefore + 1
            checkAndFireThresholdMock(eventId, confirmedBefore, confirmedAfter).catch((err) =>
              console.error('[attendance] threshold check failed:', err),
            )
          }
        }

        return res.status(200).json({ ok: true, auto_confirmed: allRequiredDone })
      }

      if (body.action === 'upload') {
        const { email, checklist_item_id, file_path } = body as UploadAction
        if (!email) return res.status(400).json({ message: 'email is required' })
        if (!checklist_item_id) return res.status(400).json({ message: 'checklist_item_id is required' })
        if (!file_path) return res.status(400).json({ message: 'file_path is required' })

        const participant = participants.find((p) => p.event_id === eventId && p.email === email)
        if (!participant) return res.status(404).json({ message: 'Participant not found' })

        const items = readParticipantChecklistItems()
        const now = new Date().toISOString()
        const document_url = `mock://receipts/${file_path}`
        const existing = items.findIndex(
          (c) => c.participant_id === participant.id && c.checklist_item_id === checklist_item_id,
        )

        if (existing !== -1) {
          items[existing] = { ...items[existing], completed: true, completed_at: now, document_url }
        } else {
          items.push({
            id: `pci-${Date.now()}`,
            participant_id: participant.id,
            checklist_item_id,
            completed: true,
            completed_at: now,
            document_url,
            value: null,
          })
        }
        writeParticipantChecklistItems(items)
        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ message: `Unknown action: ${body.action}` })
    }

    // ── Supabase path ──────────────────────────────────────────────────────────
    if (body.action === 'profile') {
      const { email, full_name, location_city, location_region, location_country } =
        body as ProfileAction
      if (!email) return res.status(400).json({ message: 'email is required' })

      const { data: existing } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle()

      if (existing) {
        const { data, error } = await supabase
          .from('participants')
          .update({ full_name, location_city, location_region, location_country })
          .eq('id', (existing as { id: string }).id)
          .select()
          .single()
        if (error) return res.status(500).json({ message: error.message })
        return res.status(200).json(data)
      }

      const { data, error } = await supabase
        .from('participants')
        .insert({ event_id: eventId, email, full_name, location_city, location_region, location_country, rsvp_status: 'pending' })
        .select()
        .single()
      if (error) return res.status(500).json({ message: error.message })
      return res.status(201).json(data)
    }

    if (body.action === 'rsvp') {
      const { email, status } = body as RsvpAction
      if (!email) return res.status(400).json({ message: 'email is required' })
      if (!status) return res.status(400).json({ message: 'status is required' })

      const { data: participant } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle()
      if (!participant) return res.status(404).json({ message: 'Participant not found' })

      const prevStatus = (participant as { rsvp_status: string }).rsvp_status

      const { data: confirmedRows } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('rsvp_status', 'confirmed')
      const confirmedBefore = confirmedRows?.length ?? 0

      const { error } = await supabase
        .from('participants')
        .update({ rsvp_status: status })
        .eq('id', (participant as { id: string }).id)
      if (error) return res.status(500).json({ message: error.message })

      if (status === 'confirmed' && prevStatus !== 'confirmed') {
        const confirmedAfter = confirmedBefore + 1
        checkAndFireThresholdSupabase(eventId, confirmedBefore, confirmedAfter).catch((err) =>
          console.error('[attendance] threshold check failed:', err),
        )
      }

      return res.status(200).json({ ok: true })
    }

    if (body.action === 'checklist_item') {
      const { email, checklist_item_id, completed, value } = body as ChecklistItemAction
      if (!email) return res.status(400).json({ message: 'email is required' })
      if (!checklist_item_id) return res.status(400).json({ message: 'checklist_item_id is required' })

      const { data: participant } = await supabase
        .from('participants')
        .select('id, rsvp_status')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle()
      if (!participant) return res.status(404).json({ message: 'Participant not found' })

      const p = participant as { id: string; rsvp_status: string }
      const now = new Date().toISOString()

      const { data: existing } = await supabase
        .from('participant_checklist_items')
        .select('id')
        .eq('participant_id', p.id)
        .eq('checklist_item_id', checklist_item_id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('participant_checklist_items')
          .update({ completed, completed_at: completed ? now : null, value: value ?? null })
          .eq('id', (existing as { id: string }).id)
      } else {
        await supabase.from('participant_checklist_items').insert({
          participant_id: p.id,
          checklist_item_id,
          completed,
          completed_at: completed ? now : null,
          document_url: null,
          value: value ?? null,
        })
      }

      // Auto-confirm: check if all required checklist items are now completed
      const [{ data: requiredItems }, { data: completions }] = await Promise.all([
        supabase.from('checklist_items').select('id').eq('event_id', eventId).eq('required', true),
        supabase.from('participant_checklist_items').select('checklist_item_id, completed').eq('participant_id', p.id),
      ])

      const completionMap = new Map(
        (completions ?? []).map((c: Record<string, unknown>) => [c.checklist_item_id as string, c.completed as boolean]),
      )
      const allRequiredDone =
        (requiredItems ?? []).every((ci: Record<string, unknown>) => completionMap.get(ci.id as string) === true)

      if (allRequiredDone && p.rsvp_status !== 'confirmed') {
        const { data: confirmedRows } = await supabase
          .from('participants')
          .select('id')
          .eq('event_id', eventId)
          .eq('rsvp_status', 'confirmed')
        const confirmedBefore = confirmedRows?.length ?? 0

        await supabase.from('participants').update({ rsvp_status: 'confirmed' }).eq('id', p.id)

        checkAndFireThresholdSupabase(eventId, confirmedBefore, confirmedBefore + 1).catch((err) =>
          console.error('[attendance] threshold check failed:', err),
        )
      }

      return res.status(200).json({ ok: true, auto_confirmed: allRequiredDone })
    }

    if (body.action === 'upload') {
      const { email, checklist_item_id, file_path } = body as UploadAction
      if (!email) return res.status(400).json({ message: 'email is required' })
      if (!checklist_item_id) return res.status(400).json({ message: 'checklist_item_id is required' })
      if (!file_path) return res.status(400).json({ message: 'file_path is required' })

      const { data: participant } = await supabase
        .from('participants')
        .select('id')
        .eq('event_id', eventId)
        .eq('email', email)
        .maybeSingle()
      if (!participant) return res.status(404).json({ message: 'Participant not found' })

      const participantId = (participant as { id: string }).id
      const supabaseUrl = process.env.SUPABASE_URL ?? ''
      const document_url = `${supabaseUrl}/storage/v1/object/public/receipts/${file_path}`
      const now = new Date().toISOString()

      const { data: existing } = await supabase
        .from('participant_checklist_items')
        .select('id')
        .eq('participant_id', participantId)
        .eq('checklist_item_id', checklist_item_id)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('participant_checklist_items')
          .update({ completed: true, completed_at: now, document_url })
          .eq('id', (existing as { id: string }).id)
      } else {
        await supabase.from('participant_checklist_items').insert({
          participant_id: participantId,
          checklist_item_id,
          completed: true,
          completed_at: now,
          document_url,
          value: null,
        })
      }

      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ message: `Unknown action: ${body.action}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
