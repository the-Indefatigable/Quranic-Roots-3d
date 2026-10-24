import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';

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
