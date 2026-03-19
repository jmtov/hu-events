import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readParticipants, writeParticipants } from '../../_lib/participant-store.js'

type RsvpAction = { action: 'rsvp'; email: string; status: 'confirmed' | 'declined' }
type ProfileAction = { action: 'profile'; email: string; full_name: string; location_city?: string; location_region?: string; location_country?: string }
type ChecklistItemAction = { action: 'checklist_item'; email: string; itemId: string; value: boolean | string }
type UploadAction = { action: 'upload'; email: string; itemId: string; filePath: string }
type AttendanceAction = RsvpAction | ProfileAction | ChecklistItemAction | UploadAction

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).end()

  const { eventId } = req.query as { eventId: string }
  const body = req.body as Partial<AttendanceAction>

  if (!body.action) return res.status(400).json({ message: 'action is required' })
  if (!body.email?.trim()) return res.status(400).json({ message: 'email is required' })

  try {
    const all = readParticipants()
    const idx = all.findIndex((p) => p.event_id === eventId && p.email === body.email!.trim())

    if (body.action === 'rsvp') {
      const { status } = body as RsvpAction
      if (!['confirmed', 'declined'].includes(status)) {
        return res.status(400).json({ message: 'status must be confirmed or declined' })
      }
      if (idx === -1) return res.status(404).json({ message: 'Participant not found' })
      const updated = { ...all[idx], rsvp_status: status, updated_at: new Date().toISOString() }
      all[idx] = updated
      writeParticipants(all)
      return res.status(200).json(updated)
    }

    if (body.action === 'profile') {
      const { full_name, location_city, location_region, location_country } = body as ProfileAction
      if (!full_name?.trim()) return res.status(400).json({ message: 'full_name is required' })
      const now = new Date().toISOString()
      if (idx === -1) {
        const created = {
          id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          event_id: eventId,
          email: body.email!.trim(),
          full_name: full_name.trim(),
          google_uid: null,
          location_city: location_city ?? null,
          location_region: location_region ?? null,
          location_country: location_country ?? null,
          rsvp_status: 'pending' as const,
          created_at: now,
          updated_at: now,
          sort_order: all.filter((p) => p.event_id === eventId).length,
        }
        writeParticipants([...all, created])
        return res.status(200).json(created)
      }
      const updated = {
        ...all[idx],
        full_name: full_name.trim(),
        location_city: location_city ?? all[idx].location_city,
        location_region: location_region ?? all[idx].location_region,
        location_country: location_country ?? all[idx].location_country,
        updated_at: now,
      }
      all[idx] = updated
      writeParticipants(all)
      return res.status(200).json(updated)
    }

    // checklist_item and upload — to be implemented
    return res.status(200).json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
