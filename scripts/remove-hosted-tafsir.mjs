/**
 * Deletes the stored copy of Tafsir Ibn Kathir (Abridged, Darussalam) from the database.
 * The reader now links each ayah to its tafsir on quran.com instead of hosting the text.
 *
 *   node --env-file=.env.local scripts/remove-hosted-tafsir.mjs
 *
 * Empties tafsir_entries and tafsirs in one transaction; the empty tables stay.
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  const [{ n }] = await sql`select count(*)::int as n from tafsir_entries`;
  await sql.begin(async (tx) => {
    await tx`delete from tafsir_entries`;
    await tx`delete from tafsirs`;
  });
  console.log(`Removed ${n} stored tafsir entries.`);
} finally {
  await sql.end();
}
