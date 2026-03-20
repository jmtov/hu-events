import type { VercelRequest, VercelResponse } from '@vercel/node';
import { contacts } from '../../_fixtures/index.js';

/**
 * GET  /api/events/:eventId/contacts  — list contacts for an event
 * POST /api/events/:eventId/contacts  — add a contact to an event
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { eventId } = req.query as { eventId: string };

  if (!eventId) return res.status(400).json({ message: 'eventId is required' });

  try {
    if (req.method === 'GET') {
      if (process.env.USE_MOCK_DATA === 'true') {
        const eventContacts = contacts.filter((c) => c.event_id === eventId);
        return res.status(200).json(eventContacts);
      }
      // TODO: query Supabase
      return res.status(501).json({ message: 'Not implemented' });
    }

    if (req.method === 'POST') {
      const { name, role, email, phone } = req.body as {
        name?: string;
        role?: string;
        email?: string;
        phone?: string;
      };

      if (!name?.trim()) return res.status(400).json({ message: 'name is required' });
      if (!role?.trim()) return res.status(400).json({ message: 'role is required' });
      if (!email?.trim()) return res.status(400).json({ message: 'email is required' });

      const created = {
        id: `contact_${Date.now()}`,
        event_id: eventId,
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        phone: phone?.trim() ?? null,
      };

      // TODO: insert into Supabase
      return res.status(201).json(created);
    }

    return res.status(405).end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
