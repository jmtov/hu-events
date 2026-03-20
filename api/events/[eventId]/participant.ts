import type { VercelRequest, VercelResponse } from '@vercel/node'
import { supabase } from '../../_lib/supabase.js'
import { readParticipants } from '../../_lib/participant-store.js'
import { readChecklistItems } from '../../_lib/checklist-store.js'
import { participantChecklistItems } from '../../_fixtures/index.js'

/**
 * GET /api/events/:eventId/participant?email=...
 *
 * Returns the attendee's profile and their merged checklist (item definitions
 * + completion status) for a given event. Used by the attendee event view
 * to show submitted info and checklist progress without a session token.
 *
 * TODO: replace email query param with a session token once auth is implemented.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { eventId, email } = req.query as { eventId: string; email?: string }

  if (!eventId) return res.status(400).json({ message: 'eventId is required' })
  if (!email) return res.status(400).json({ message: 'email query param is required' })

  try {
    if (process.env.USE_MOCK_DATA === 'true') {
      const participants = readParticipants()
      const participant = participants.find(
        (p) => p.event_id === eventId && p.email === email,
      )
      if (!participant) return res.status(404).json({ message: 'Participant not found' })

      const checklistItems = readChecklistItems().filter((item) => item.event_id === eventId)

      const completionMap = new Map(
        participantChecklistItems
          .filter((c) => c.participant_id === participant.id)
          .map((c) => [c.checklist_item_id, c]),
      )

      const checklist = checklistItems
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((item) => {
          const completion = completionMap.get(item.id)
          return {
            id: item.id,
            label: item.label,
            item_type: item.item_type,
            required: item.required,
            sort_order: item.sort_order,
            completed: completion?.completed ?? false,
            completed_at: completion?.completed_at ?? null,
            document_url: completion?.document_url ?? null,
            value: completion?.value ?? null,
          }
        })

      return res.status(200).json({
        participant: {
          id: participant.id,
          email: participant.email,
          full_name: participant.full_name,
          rsvp_status: participant.rsvp_status,
          location_city: participant.location_city,
          location_region: participant.location_region,
          location_country: participant.location_country,
        },
        checklist,
      })
    }

    // ── Supabase path ──────────────────────────────────────────────────────────
    const { data: participant } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('email', email)
      .maybeSingle()
    if (!participant) return res.status(404).json({ message: 'Participant not found' })

    const p = participant as {
      id: string; email: string; full_name: string; rsvp_status: string
      location_city: string | null; location_region: string | null; location_country: string | null
    }

    const [{ data: checklistItems }, { data: completions }] = await Promise.all([
      supabase.from('checklist_items').select('*').eq('event_id', eventId).order('sort_order', { ascending: true }),
      supabase.from('participant_checklist_items').select('*').eq('participant_id', p.id),
    ])

    const completionMap = new Map(
      (completions ?? []).map((c: Record<string, unknown>) => [c.checklist_item_id as string, c]),
    )

    const checklist = (checklistItems ?? []).map((item: Record<string, unknown>) => {
      const completion = completionMap.get(item.id as string)
      return {
        id: item.id,
        label: item.label,
        item_type: item.item_type,
        required: item.required,
        sort_order: item.sort_order,
        completed: (completion as Record<string, unknown> | undefined)?.completed ?? false,
        completed_at: (completion as Record<string, unknown> | undefined)?.completed_at ?? null,
        document_url: (completion as Record<string, unknown> | undefined)?.document_url ?? null,
        value: (completion as Record<string, unknown> | undefined)?.value ?? null,
      }
    })

    return res.status(200).json({
      participant: {
        id: p.id,
        email: p.email,
        full_name: p.full_name,
        rsvp_status: p.rsvp_status,
        location_city: p.location_city,
        location_region: p.location_region,
        location_country: p.location_country,
      },
      checklist,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
