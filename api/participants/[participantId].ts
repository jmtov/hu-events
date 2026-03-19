import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readParticipants, writeParticipants } from '../_lib/participant-store.js';

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

const ALLOWED_FIELDS = [
  'full_name',
  'location_city',
  'location_region',
  'location_country',
  'rsvp_status',
] as const;

/**
 * PATCH  /api/participants/:participantId — update participant fields (admin override)
 * DELETE /api/participants/:participantId — remove participant from event
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { participantId } = req.query as { participantId: string };

  if (!participantId) {
    return res.status(400).json({ message: 'participantId is required' });
  }

  try {
    if (req.method === 'PATCH') {
      if (USE_MOCK_DATA) {
        const all = readParticipants();
        const idx = all.findIndex((p) => p.id === participantId);
        if (idx === -1) {
          return res.status(404).json({ message: 'Participant not found' });
        }

        const body = req.body as Record<string, unknown>;
        const updates: Record<string, unknown> = {};
        for (const key of ALLOWED_FIELDS) {
          if (key in body) updates[key] = body[key];
        }

        const updated = {
          ...all[idx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        all[idx] = updated;
        writeParticipants(all);
        return res.status(200).json(updated);
      }

      // TODO: UPDATE participants SET ... WHERE id = participantId
      return res.status(501).json({ message: 'Not implemented' });
    }

    if (req.method === 'DELETE') {
      if (USE_MOCK_DATA) {
        const all = readParticipants();
        const idx = all.findIndex((p) => p.id === participantId);
        if (idx === -1) {
          return res.status(404).json({ message: 'Participant not found' });
        }
        const filtered = all.filter((p) => p.id !== participantId);
        writeParticipants(filtered);
        return res.status(204).end();
      }

      // TODO: DELETE FROM participants WHERE id = participantId
      return res.status(501).json({ message: 'Not implemented' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
