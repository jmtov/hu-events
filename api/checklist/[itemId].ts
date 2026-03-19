import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readChecklistItems, writeChecklistItems } from '../_lib/checklist-store.js'

/**
 * PATCH  /api/checklist/:itemId  — update a checklist item
 * DELETE /api/checklist/:itemId  — delete a checklist item
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { itemId } = req.query as { itemId: string }

  if (!itemId) return res.status(400).json({ message: 'itemId is required' })

  if (req.method === 'PATCH') {
    const { name, type, required } = req.body as {
      name?: string
      type?: string
      required?: boolean
    }

    if (type !== undefined) {
      const validTypes = ['checkbox', 'document_upload', 'info_input']
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: `type must be one of: ${validTypes.join(', ')}`,
        })
      }
    }

    if (process.env.USE_MOCK_DATA === 'true') {
      const all = readChecklistItems()
      const index = all.findIndex((i) => i.id === itemId)
      if (index === -1) return res.status(404).json({ message: 'Item not found' })

      const updated = {
        ...all[index],
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type: type as 'checkbox' | 'document_upload' | 'info_input' }),
        ...(required !== undefined && { required }),
      }
      all[index] = updated
      writeChecklistItems(all)
      return res.status(200).json(updated)
    }
    // TODO: UPDATE in Supabase
    return res.status(501).json({ message: 'Not implemented' })
  }

  if (req.method === 'DELETE') {
    if (process.env.USE_MOCK_DATA === 'true') {
      const all = readChecklistItems()
      const filtered = all.filter((i) => i.id !== itemId)
      writeChecklistItems(filtered)
      return res.status(204).end()
    }
    // TODO: DELETE in Supabase
    return res.status(501).json({ message: 'Not implemented' })
  }

  return res.status(405).end()
}
