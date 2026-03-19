import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readPreferenceFields, writePreferenceFields } from '../../_lib/mock-store.js'

const VALID_TYPES = ['text', 'select', 'boolean'] as const
type FieldType = (typeof VALID_TYPES)[number]

/**
 * GET  /api/events/:eventId/preference-fields  — list fields for an event
 * POST /api/events/:eventId/preference-fields  — create a new field
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string }

  if (!eventId) return res.status(400).json({ message: 'eventId is required' })

  try {
    if (req.method === 'GET') {
      if (process.env.USE_MOCK_DATA === 'true') {
        const fields = readPreferenceFields().filter((f) => f.event_id === eventId)
        return res.status(200).json(fields)
      }
      // TODO: query Supabase
      return res.status(501).json({ message: 'Not implemented' })
    }

    if (req.method === 'POST') {
      const { label, field_type, options, required } = req.body as {
        label?: string
        field_type?: string
        options?: string[] | null
        required?: boolean
      }

      if (!label?.trim()) {
        return res.status(400).json({ message: 'label is required' })
      }

      if (!field_type || !(VALID_TYPES as readonly string[]).includes(field_type)) {
        return res.status(400).json({
          message: `field_type must be one of: ${VALID_TYPES.join(', ')}`,
        })
      }

      if (field_type === 'select' && (!Array.isArray(options) || options.length === 0)) {
        return res.status(400).json({
          message: 'options array is required when field_type is select',
        })
      }

      if (process.env.USE_MOCK_DATA === 'true') {
        const all = readPreferenceFields()
        const eventFields = all.filter((f) => f.event_id === eventId)
        const newField = {
          id: `pf_${Date.now()}`,
          event_id: eventId,
          label: label.trim(),
          field_type: field_type as FieldType,
          options: field_type === 'select' ? (options ?? null) : null,
          required: required ?? false,
          sort_order: eventFields.length,
        }
        writePreferenceFields([...all, newField])
        return res.status(201).json(newField)
      }

      // TODO: insert into Supabase
      return res.status(501).json({ message: 'Not implemented' })
    }

    return res.status(405).end()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
