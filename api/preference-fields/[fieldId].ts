import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readPreferenceFields, writePreferenceFields } from '../_lib/mock-store.js'

const VALID_TYPES = ['text', 'select', 'boolean'] as const

/**
 * PATCH  /api/preference-fields/:fieldId  — update a preference field
 * DELETE /api/preference-fields/:fieldId  — remove a preference field
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { fieldId } = req.query as { fieldId: string }

  if (!fieldId) return res.status(400).json({ message: 'fieldId is required' })

  try {
    if (req.method === 'PATCH') {
      const { label, field_type, options, required } = req.body as {
        label?: string
        field_type?: string
        options?: string[] | null
        required?: boolean
      }

      if (field_type !== undefined && !(VALID_TYPES as readonly string[]).includes(field_type)) {
        return res.status(400).json({
          message: `field_type must be one of: ${VALID_TYPES.join(', ')}`,
        })
      }

      if (process.env.USE_MOCK_DATA === 'true') {
        const all = readPreferenceFields()
        const idx = all.findIndex((f) => f.id === fieldId)
        if (idx === -1) return res.status(404).json({ message: 'Field not found' })

        const existing = all[idx]
        const resolvedType = (field_type ?? existing.field_type) as (typeof VALID_TYPES)[number]

        const updated = {
          ...existing,
          ...(label !== undefined && { label: label.trim() }),
          ...(field_type !== undefined && { field_type: resolvedType }),
          options: resolvedType === 'select' ? (options !== undefined ? options : existing.options) : null,
          ...(required !== undefined && { required }),
        }

        all[idx] = updated
        writePreferenceFields(all)
        return res.status(200).json(updated)
      }

      // TODO: UPDATE preference_fields SET ... WHERE id = fieldId
      return res.status(501).json({ message: 'Not implemented' })
    }

    if (req.method === 'DELETE') {
      if (process.env.USE_MOCK_DATA === 'true') {
        const all = readPreferenceFields()
        const filtered = all.filter((f) => f.id !== fieldId)
        if (filtered.length === all.length) {
          return res.status(404).json({ message: 'Field not found' })
        }
        writePreferenceFields(filtered)
        return res.status(204).end()
      }

      // TODO: DELETE FROM preference_fields WHERE id = fieldId
      return res.status(501).json({ message: 'Not implemented' })
    }

    return res.status(405).end()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ message })
  }
}
