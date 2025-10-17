import { cookies } from 'next/headers';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { getSettings, updateLastLogin } from '@/lib/data/settings';

const SESSION_COOKIE = 'bbd_session';
const SESSION_TTL = 60 * 60 * 8; // 8 hours

export type Session = {
  email: string;
  name: string;
  roles: ('admin' | 'employee')[];
  type: 'admin' | 'employee';
  issuedAt: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || 'development-secret';
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function encodeSession(session: Session) {
  const raw = Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url');
  const signature = sign(raw);
  return `${raw}.${signature}`;
}

export function decodeSession(token: string): Session | null {
  const [raw, signature] = token.split('.');
  if (!raw || !signature || sign(raw) !== signature) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf-8')) as Session;
    if (Date.now() / 1000 - parsed.issuedAt > SESSION_TTL) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('[auth] Failed to parse session', error);
    return null;
  }
}

function verifyPassword(password: string, hash: string) {
  if (hash.startsWith('sha256:')) {
    const expected = hash.replace('sha256:', '');
    const computed = createHash('sha256').update(password).digest('hex');
    const bufferExpected = Buffer.from(expected, 'hex');
    const bufferComputed = Buffer.from(computed, 'hex');
    if (bufferExpected.length !== bufferComputed.length) {
      return false;
    }
    return timingSafeEqual(bufferExpected, bufferComputed);
  }

  return password === hash;
}

export async function authenticateUser(email: string, password: string, type: 'admin' | 'employee') {
  const settings = await getSettings();
  const key = type === 'admin' ? 'adminUsers' : 'employeeUsers';
  const user = settings[key].find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return null;
  }

  const matches = verifyPassword(password, user.passwordHash);
  if (!matches) {
    return null;
  }

  await updateLastLogin(user.email, key);

  return {
    email: user.email,
    name: user.name,
    roles: user.roles as Session['roles'],
    type,
  } satisfies Omit<Session, 'issuedAt'>;
}

export function setSessionCookie(session: Session) {
  cookies().set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL,
    path: '/',
  });
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export function readSession(): Session | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  return decodeSession(token);
}

export async function requireRole(role: 'admin' | 'employee') {
  const session = readSession();
  if (!session) {
    return null;
  }

  if (!session.roles.includes(role)) {
    return null;
  }

  return session;
}
