import { randomBytes } from 'crypto';
import { cookies } from 'next/headers';
import { db, dbQuery } from '@/db';
import { users, sessions, magicLinkTokens } from '@/db/schema';
import { eq, and, gt, isNull } from 'drizzle-orm';

const SESSION_COOKIE = 'quroots-session';
const SESSION_MAX_AGE_DAYS = 30;
const MAGIC_LINK_EXPIRY_MIN = 15;

// ── Token generation ──────────────────────────────

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// ── Magic link tokens ─────────────────────────────

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MIN * 60 * 1000);

  await dbQuery(() =>
    db.insert(magicLinkTokens).values({ email: email.toLowerCase().trim(), token, expiresAt })
  );

  return token;
}

export async function verifyMagicLinkToken(token: string): Promise<string | null> {
  const [row] = await dbQuery(() =>
    db.select({ id: magicLinkTokens.id, email: magicLinkTokens.email })
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.token, token),
          gt(magicLinkTokens.expiresAt, new Date()),
          isNull(magicLinkTokens.usedAt),
        )
      )
      .limit(1)
  );

  if (!row) return null;

  // Mark as used
  await dbQuery(() =>
    db.update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.id, row.id))
  );

  return row.email;
}

// ── Rate limiting (simple — 1 token per email per 60s) ──

export async function canSendMagicLink(email: string): Promise<boolean> {
  const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
  const [recent] = await dbQuery(() =>
    db.select({ id: magicLinkTokens.id })
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.email, email.toLowerCase().trim()),
          gt(magicLinkTokens.createdAt, sixtySecondsAgo),
        )
      )
      .limit(1)
  );
  return !recent;
}

// ── User management ───────────────────────────────

export async function findOrCreateUser(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const [existing] = await dbQuery(() =>
    db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1)
  );

  if (existing) {
    await dbQuery(() =>
      db.update(users)
        .set({ lastActive: new Date().toISOString().split('T')[0] })
        .where(eq(users.id, existing.id))
    );
    return existing;
  }

  const [newUser] = await dbQuery(() =>
    db.insert(users)
      .values({
        email: normalizedEmail,
        role: 'student',
        lastActive: new Date().toISOString().split('T')[0],
      })
      .returning()
  );

  return newUser;
}

// ── Session management ────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

  await dbQuery(() =>
    db.insert(sessions).values({ userId, token, expiresAt })
  );

  // Set httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  });

  return token;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await dbQuery(() =>
    db.select({
      sessionId: sessions.id,
      sessionToken: sessions.token,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      name: users.name,
      avatarUrl: users.avatarUrl,
      role: users.role,
      streakDays: users.streakDays,
      lastActive: users.lastActive,
    })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, token),
          gt(sessions.expiresAt, new Date()),
        )
      )
      .limit(1)
  );

  if (!row) return null;

  return {
    id: row.userId,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatarUrl,
    role: row.role,
    streakDays: row.streakDays,
    lastActive: row.lastActive,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;

  await dbQuery(() =>
    db.delete(sessions).where(eq(sessions.token, token))
  );

  cookieStore.delete(SESSION_COOKIE);
}
