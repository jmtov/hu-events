import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * GET  /api/events/:eventId/checklist  — list all checklist items for an event
 * POST /api/events/:eventId/checklist  — create a new checklist item
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    if (req.method === 'GET') {
      // TODO: query DB — SELECT * FROM checklist_items WHERE event_id = eventId
      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const { name, type, required, alertIfIncomplete } = req.body as {
        name?: string;
        type?: string;
        required?: boolean;
        alertIfIncomplete?: boolean;
      };

      if (!name?.trim()) {
        return res.status(400).json({ message: 'name is required' });
      }

      const validTypes = ['checkbox', 'document_upload', 'info_input'];
      if (!type || !validTypes.includes(type)) {
        return res.status(400).json({
          message: `type must be one of: ${validTypes.join(', ')}`,
        });
      }

      // TODO: insert into DB and return created item
      const created = {
        id: `item_${Date.now()}`,
        eventId,
        name: name.trim(),
        type,
        required: required ?? false,
        alertIfIncomplete: alertIfIncomplete ?? false,
      };

      return res.status(201).json(created);
    }

    return res.status(405).end();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
