import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * PATCH  /api/contacts/:contactId  — update a contact
 * DELETE /api/contacts/:contactId  — remove a contact
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { contactId } = req.query as { contactId: string };

  if (!contactId) return res.status(400).json({ message: 'contactId is required' });

  try {
    if (req.method === 'PATCH') {
      const { name, role, email, phone } = req.body as {
        name?: string;
        role?: string;
        email?: string;
        phone?: string;
      };

      // TODO: UPDATE contacts SET ... WHERE id = contactId in Supabase
      const updated = {
        id: contactId,
        ...(name !== undefined && { name: name.trim() }),
        ...(role !== undefined && { role: role.trim() }),
        ...(email !== undefined && { email: email.trim() }),
        ...(phone !== undefined && { phone: phone.trim() || null }),
      };

      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      // TODO: DELETE FROM contacts WHERE id = contactId in Supabase
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return res.status(500).json({ message });
  }
}
