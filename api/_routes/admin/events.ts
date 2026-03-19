import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { AdminEventSummary } from '../../../src/types/event';
import { participants } from '../../_fixtures/participants.js';
import { readEvents } from '../../_lib/mock-store.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  if (process.env.USE_MOCK_DATA === 'true') {
    const events = readEvents();
    const result: AdminEventSummary[] = events.map((event) => ({
      ...event,
      rsvp_count: participants.filter(
        (p) => p.event_id === event.id && p.rsvp_status === 'confirmed',
      ).length,
    }));
    return res.status(200).json(result);
  }

  // TODO: query Supabase
  return res.status(501).json({ message: 'Not implemented' });
}
