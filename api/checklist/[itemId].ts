import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * PATCH  /api/checklist/:itemId  — update a checklist item
 * DELETE /api/checklist/:itemId  — delete a checklist item
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { itemId } = req.query as { itemId: string };

  if (!itemId) return res.status(400).json({ message: 'itemId is required' });

  try {
    if (req.method === 'PATCH') {
      const { name, type, required } = req.body as {
        name?: string;
        type?: string;
        required?: boolean;
      };

      if (type !== undefined) {
        const validTypes = ['checkbox', 'document_upload', 'info_input'];
        if (!validTypes.includes(type)) {
          return res.status(400).json({
            message: `type must be one of: ${validTypes.join(', ')}`,
          });
        }
      }

      // TODO: UPDATE checklist_items SET ... WHERE id = itemId
      const updated = {
        id: itemId,
        ...(name !== undefined && { name: name.trim() }),
        ...(type !== undefined && { type }),
        ...(required !== undefined && { required }),
      };

      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      // TODO: DELETE FROM checklist_items WHERE id = itemId
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
