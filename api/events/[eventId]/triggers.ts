import type { VercelRequest, VercelResponse } from '@vercel/node';
import { triggers } from '../../_fixtures/index.js';

/**
 * GET /api/events/:eventId/triggers — list notification triggers for an event
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    const entries = triggers.filter((t) => t.eventId === eventId);
    return res.status(200).json(entries);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
