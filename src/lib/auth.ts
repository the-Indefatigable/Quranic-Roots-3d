import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';

// A one-tap sign-in link for people who would rather not use Google.
function signInEmail(url: string) {
  return `<!doctype html><html><body style="margin:0;background:#111110;font-family:-apple-system,Segoe UI,sans-serif">
  <div style="max-width:440px;margin:0 auto;padding:40px 24px;text-align:center;color:#EDEDEC">
    <p style="font-size:22px;margin:0 0 6px">Qu<span style="color:#D4A246">Roots</span></p>
    <p style="font-size:15px;color:#A09F9B;margin:0 0 28px">Tap the button to sign in. The link works once and expires in 24 hours.</p>
    <a href="${url}" style="display:inline-block;background:#D4A246;color:#1a1206;font-weight:700;font-size:16px;padding:14px 28px;border-radius:999px;text-decoration:none">Sign in to QuRoots</a>
    <p style="font-size:12px;color:#7A7975;margin:28px 0 0">If you did not ask for this, you can ignore this email.</p>
  </div></body></html>`;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.SIGNIN_FROM || 'QuRoots <signin@quroots.com>',
      async sendVerificationRequest({ identifier, url, provider }) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${provider.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: 'Your QuRoots sign-in link',
            html: signInEmail(url),
            text: `Sign in to QuRoots: ${url}`,
          }),
        });
        if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh every 24h
  },
  callbacks: {
    async session({ session, user }) {
      // The adapter puts the whole users row on session.user, and the session is sent to the
      // browser, so build it from an allow-list (never the password hash or unsubscribe token).
      return {
        expires: session.expires,
        user: {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          image: user.image ?? null,
          role: (user as any).role || 'student',
          streakDays: (user as any).streakDays || 0,
          lastActive: (user as any).lastActive || null,
          preferredLang: (user as any).preferredLang || 'en',
        },
      } as typeof session;
    },
  },
  pages: {
    signIn: '/',
  },
});

declare module 'next-auth' {
  interface User {
    role?: string;
    streakDays?: number;
    lastActive?: string | null;
    preferredLang?: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: string;
      streakDays: number;
      lastActive: string | null;
      preferredLang: string;
    };
  }
}
