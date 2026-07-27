import type { Config } from 'drizzle-kit';

/**
 * src/db/schema.ts is the single source of truth for the database.
 *
 * The hand-written files in db/ had drifted badly from it — see
 * db/README.md — so schema changes are now generated from the Drizzle schema
 * with `npm run db:generate` instead of being written by hand.
 */
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  // Tables created outside the Drizzle schema that we don't want dropped.
  strict: true,
} satisfies Config;
