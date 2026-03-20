import { randomBytes } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ALLOWED_REDIRECT_TARGETS = new Set(['/admin/events', '/attendee/events']);

function isAllowedRedirect(redirectTo: string): boolean {
  if (ALLOWED_REDIRECT_TARGETS.has(redirectTo)) return true;
  if (/^\/join\/[\w-]+$/.test(redirectTo)) return true;
  if (/^\/attendee\/events\/[\w-]+$/.test(redirectTo)) return true;
  return false;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth not configured.' });
  }

  const rawRedirectTo = req.query.redirectTo as string | undefined;
  const redirectTo =
    rawRedirectTo && isAllowedRedirect(rawRedirectTo)
      ? rawRedirectTo
      : '/admin/events';

  const nonce = randomBytes(16).toString('hex');
  const callbackUrl = `${appUrl}/api/auth/callback`;

  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.set('client_id', clientId);
  googleUrl.searchParams.set('redirect_uri', callbackUrl);
  googleUrl.searchParams.set('response_type', 'code');
  googleUrl.searchParams.set('scope', 'openid email profile');
  googleUrl.searchParams.set('access_type', 'offline');
  googleUrl.searchParams.set('state', nonce);

  // Store both CSRF nonce and post-auth redirect target in a short-lived httpOnly cookie
  const stateCookieValue = JSON.stringify({ nonce, redirectTo });
  res.setHeader(
    'Set-Cookie',
    `oauth_state=${encodeURIComponent(stateCookieValue)}; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=300`,
  );

  return res.redirect(302, googleUrl.toString());
}
