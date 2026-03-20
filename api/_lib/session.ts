import { createHmac, timingSafeEqual } from 'node:crypto';

type SessionPayload = {
  email: string;
  name: string;
  picture: string;
  iat: number;
};

export function createSessionToken(
  payload: Omit<SessionPayload, 'iat'>,
  secret: string,
): string {
  const data = Buffer.from(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }),
  ).toString('base64url');
  const sig = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(
  token: string,
  secret: string,
): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expectedSig = createHmac('sha256', secret).update(data).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  } catch {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload;
  } catch {
    return null;
  }
}

export function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  const match = header
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

export function sessionCookieHeader(token: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `session=${token}; HttpOnly${secure}; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}
