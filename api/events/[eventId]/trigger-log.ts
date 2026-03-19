import type { VercelRequest, VercelResponse } from '@vercel/node';
import { triggerLog } from '../../_fixtures';

/**
 * GET /api/events/:eventId/trigger-log — list fired notification log entries for an event
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    const entries = triggerLog.filter((e) => e.event_id === eventId);
    return res.status(200).json(entries);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
