import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checklistItems, participantChecklistItems, participants } from '../../_fixtures';

/**
 * GET  /api/events/:eventId/checklist  — list checklist items with per-item completion stats
 * POST /api/events/:eventId/checklist  — create a new checklist item
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    if (req.method === 'GET') {
      if (process.env.USE_MOCK_DATA === 'true') {
        const eventParticipants = participants.filter((p) => p.event_id === eventId);
        const totalParticipants = eventParticipants.length;
        const participantIds = new Set(eventParticipants.map((p) => p.id));

        const eventItems = checklistItems.filter((item) => item.event_id === eventId);

        const stats = eventItems.map((item) => {
          const completions = participantChecklistItems.filter(
            (pc) =>
              pc.checklist_item_id === item.id &&
              participantIds.has(pc.participant_id) &&
              pc.completed,
          );
          const completedCount = completions.length;
          const completionPct =
            totalParticipants > 0
              ? Math.round((completedCount / totalParticipants) * 100)
              : 0;

          return {
            id: item.id,
            label: item.label,
            item_type: item.item_type,
            required: item.required,
            completed_count: completedCount,
            total_count: totalParticipants,
            completion_pct: completionPct,
          };
        });

        return res.status(200).json(stats);
      }

      // TODO: query DB — SELECT * FROM checklist_items WHERE event_id = eventId
      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const { name, type, required } = req.body as {
        name?: string;
        type?: string;
        required?: boolean;
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
