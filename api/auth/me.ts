import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseCookie, verifySessionToken } from '../_lib/session.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const token = parseCookie(req.headers.cookie, 'session');
  if (!token) return res.status(401).json({ error: 'Not authenticated.' });

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) return res.status(500).json({ error: 'Auth not configured.' });

  const payload = verifySessionToken(token, sessionSecret);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired session.' });

  return res.status(200).json(payload);
}
