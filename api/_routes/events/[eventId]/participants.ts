import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  readParticipants,
  writeParticipants,
} from '../../../_lib/participant-store.js';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * GET  /api/events/:eventId/participants — list participants for an event
 * POST /api/events/:eventId/participants — add a participant by email
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    if (req.method === 'GET') {
      if (USE_MOCK_DATA) {
        const all = readParticipants();
        return res.status(200).json(all.filter((p) => p.event_id === eventId));
      }
      // TODO: query DB — SELECT * FROM participants WHERE event_id = eventId
      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const { email } = req.body as { email?: string };

      if (!email?.trim()) {
        return res.status(400).json({ message: 'email is required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ message: 'email is not valid' });
      }

      if (USE_MOCK_DATA) {
        const all = readParticipants();
        const existing = all.find(
          (p) => p.event_id === eventId && p.email === email.trim(),
        );
        if (existing) {
          return res.status(409).json({ message: 'Participant already added' });
        }

        const now = new Date().toISOString();
        const created = {
          id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          event_id: eventId,
          email: email.trim(),
          full_name: '',
          google_uid: null,
          location_city: null,
          location_region: null,
          location_country: null,
          rsvp_status: 'pending' as const,
          created_at: now,
          updated_at: now,
        };
        writeParticipants([...all, created]);
        return res.status(201).json(created);
      }

      // TODO: insert into DB and trigger invite notification via n8n
      return res.status(501).json({ message: 'Not implemented' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
