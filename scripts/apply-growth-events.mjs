/**
 * Creates the growth_events table (drizzle/0002_growth_events.sql) on the database in DATABASE_URL.
 *
 *   node --env-file=.env.local scripts/apply-growth-events.mjs
 *
 * Production was not set up through drizzle-kit migrate, so running `npm run db:migrate` there
 * would try to replay the baseline. This applies only the one new, additive migration, in a
 * single transaction, and does nothing if the table already exists.
 */
import fs from 'fs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  const [{ t }] = await sql`select to_regclass('public.growth_events') as t`;
  if (t) {
    console.log('growth_events already exists, nothing to do.');
  } else {
    const file = new URL('../drizzle/0002_growth_events.sql', import.meta.url);
    const stmts = fs.readFileSync(file, 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
    await sql.begin(async (tx) => { for (const s of stmts) await tx.unsafe(s); });
    const [{ rls }] = await sql`select relrowsecurity as rls from pg_class where relname = 'growth_events'`;
    console.log(`Created growth_events (${stmts.length} statements, row-level security ${rls ? 'on' : 'OFF'}).`);
  }
} finally {
  await sql.end();
}
