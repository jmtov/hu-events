import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createSessionToken, parseCookie, sessionCookieHeader } from '../_lib/session.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { code, state, error } = req.query as Record<string, string>;

  if (error || !code) {
    return res.redirect(302, '/login?error=oauth_failed');
  }

  // CSRF: parse state cookie and verify nonce matches what Google returned
  const rawStateCookie = parseCookie(req.headers.cookie, 'oauth_state');
  let storedNonce: string | undefined;
  let redirectTo = '/admin/events';

  try {
    const parsed = JSON.parse(decodeURIComponent(rawStateCookie ?? ''));
    storedNonce = parsed.nonce as string;
    redirectTo = (parsed.redirectTo as string) ?? '/admin/events';
  } catch {
    return res.redirect(302, '/login?error=invalid_state');
  }

  if (!storedNonce || storedNonce !== state) {
    return res.redirect(302, '/login?error=invalid_state');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  if (!clientId || !clientSecret || !sessionSecret) {
    return res.status(500).json({ error: 'Auth not configured.' });
  }

  // Exchange code for Google tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl}/api/auth/callback`,
      grant_type: 'authorization_code',
    }),
  });

  const tokens = (await tokenRes.json()) as { access_token?: string };

  if (!tokens.access_token) {
    return res.redirect(302, '/login?error=token_exchange_failed');
  }

  // Fetch user profile from Google
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  const user = (await userRes.json()) as {
    email?: string;
    name?: string;
    picture?: string;
  };

  if (!user.email) {
    return res.redirect(302, '/login?error=user_fetch_failed');
  }

  const token = createSessionToken(
    { email: user.email, name: user.name ?? '', picture: user.picture ?? '' },
    sessionSecret,
  );

  res.setHeader('Set-Cookie', [
    sessionCookieHeader(token, THIRTY_DAYS),
    // Clear the CSRF state cookie
    'oauth_state=; HttpOnly; SameSite=Lax; Path=/api/auth; Max-Age=0',
  ]);

  return res.redirect(302, redirectTo);
}
