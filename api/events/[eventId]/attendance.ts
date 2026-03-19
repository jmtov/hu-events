import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readParticipants, writeParticipants } from '../../_lib/participant-store.js'
import { readEvents } from '../../_lib/mock-store.js'
import { readChecklistItems } from '../../_lib/checklist-store.js'
import { readTriggers } from '../../_lib/trigger-store.js'
import { participantChecklistItems } from '../../_fixtures/index.js'

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

type AttendanceAction = ProfileAction | RsvpAction

async function fireN8nWebhook(payload: Record<string, unknown>): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) {
    // TODO: configure N8N_WEBHOOK_URL — one URL per workflow or a single dispatcher
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

async function checkAndFireThreshold(
  eventId: string,
  confirmedBefore: number,
  confirmedAfter: number,
): Promise<void> {
  const events = readEvents()
  const event = events.find((e) => e.id === eventId)
  if (!event || !event.expected_attendees) return

  const threshold = event.expected_attendees * 0.5

  // Only fire when this RSVP crosses the threshold, not every time after
  if (confirmedBefore >= threshold || confirmedAfter < threshold) return

  const triggers = readTriggers()

  // Workflow 1 — RSVP milestone → HR admin via Slack
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

  // Workflow 2 — Checklist incomplete → per attendee with incomplete items
  const checklistItems = readChecklistItems()
  const alertItems = checklistItems.filter(
    (item) => item.event_id === eventId && item.alert_if_incomplete,
  )
  if (alertItems.length === 0) return

  // Get timing config from checklist-sourced triggers for this event
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

/**
 * PATCH /api/events/:eventId/attendance
 *
 * Action-based endpoint for attendee self-registration via join link.
 *
 * action: 'profile' — create or update participant record
 * action: 'rsvp'    — confirm RSVP; fires n8n workflows if RSVP threshold is crossed
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

        // Count confirmed before this change (excluding this participant's new status)
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

          checkAndFireThreshold(eventId, confirmedBefore, confirmedAfter).catch((err) =>
            console.error('[attendance] threshold check failed:', err),
          )
        }

        return res.status(200).json({ ok: true })
      }

      return res.status(400).json({ message: `Unknown action: ${body.action}` })
    }

    // TODO: Supabase implementation
    // action 'profile': upsert into participants by (event_id, email)
    // action 'rsvp': update rsvp_status, then run threshold check via DB query
    return res.status(501).json({ message: 'Not implemented without mock data' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
