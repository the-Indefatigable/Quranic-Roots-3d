/**
 * Adds users.reminders_opt_in and the email_consents table (drizzle/0003_email_consents.sql)
 * to the database in DATABASE_URL. Run this BEFORE deploying the code that uses them.
 *
 *   node --env-file=.env.local scripts/apply-email-consents.mjs
 *
 * Production was not set up through drizzle-kit migrate, so this applies only this one additive
 * migration, in a single transaction, and does nothing if it is already there.
 */
import fs from 'fs';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  const [{ t }] = await sql`select to_regclass('public.email_consents') as t`;
  if (t) {
    console.log('email_consents already exists, nothing to do.');
  } else {
    const file = new URL('../drizzle/0003_email_consents.sql', import.meta.url);
    const stmts = fs.readFileSync(file, 'utf8').split('--> statement-breakpoint').map((s) => s.trim()).filter(Boolean);
    await sql.begin(async (tx) => { for (const s of stmts) await tx.unsafe(s); });
    console.log(`Added reminders_opt_in and email_consents (${stmts.length} statements, row-level security on).`);
  }
} finally {
  await sql.end();
}
