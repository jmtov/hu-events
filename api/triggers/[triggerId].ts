import type { VercelRequest, VercelResponse } from '@vercel/node';
import { triggers } from '../_fixtures/index.js';

/**
 * PATCH /api/triggers/:triggerId — update a notification trigger
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') return res.status(405).end();

  const { triggerId } = req.query as { triggerId: string };

  if (!triggerId) return res.status(400).json({ message: 'triggerId is required' });

  try {
    const trigger = triggers.find((t) => t.id === triggerId);

    if (!trigger) return res.status(404).json({ message: 'Trigger not found' });

    const { timing, timingValue, channel, recipient } = req.body as {
      timing?: string;
      timingValue?: number;
      channel?: string;
      recipient?: string;
    };

    // TODO: UPDATE triggers SET ... WHERE id = triggerId
    const updated = {
      ...trigger,
      ...(timing !== undefined && { timing }),
      ...(timingValue !== undefined && { timingValue }),
      ...(channel !== undefined && { channel }),
      ...(recipient !== undefined && { recipient }),
    };

    return res.status(200).json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
