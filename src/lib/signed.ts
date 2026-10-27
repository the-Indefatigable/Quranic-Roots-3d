import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Small signed values for cookies and links: `${value}.${mac}`. The purpose is part of what is
 * signed, so a value signed for one use can't be replayed as another.
 */
const secret = () => process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
const mac = (purpose: string, v: string) => createHmac('sha256', secret()).update(`${purpose}:${v}`).digest('base64url');

export function sign(purpose: string, value: string): string {
  return `${value}.${mac(purpose, value)}`;
}

export function unsign(purpose: string, signed: string | undefined | null): string | null {
  if (!signed || !secret()) return null;
  const i = signed.lastIndexOf('.');
  if (i <= 0) return null;
  const v = signed.slice(0, i), given = Buffer.from(signed.slice(i + 1)), want = Buffer.from(mac(purpose, v));
  return given.length === want.length && timingSafeEqual(given, want) ? v : null;
}

/** Links an anonymous browser to the account it gave its email for, so its progress follows that account. */
export const LEARNER_COOKIE = 'qr_learner';
export const LEARNER_MAX_AGE = 60 * 60 * 24 * 400;
