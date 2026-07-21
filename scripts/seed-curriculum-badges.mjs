import fs from 'node:fs'; import postgres from 'postgres';
const url=fs.readFileSync('.env.local','utf8').match(/DATABASE_URL=(.+)/)[1].trim().replace(/^["']|["']$/g,'');
const sql=postgres(url,{prepare:false,max:1});
// New badges that tie the completed 50-unit curriculum into the live badge system.
const BADGES = [
  ['Foundation Complete', 'Finished the foundation (Units 1–19) — you can read the grammar of an ayah.', 'milestone', 50],
  ['Iʿrāb Adept', 'Mastered the case system (iʿrāb) — you know why every word ends the way it does.', 'mastery', 40],
  ["The Grammarian's Ijāzah", 'Completed the ENTIRE grammar course — from "what is an ism?" to Āyat al-Kursī.', 'milestone', 200],
  ['Daily Devotee', 'Reviewed the Daily Ayah 7 times — a habit of the heart.', 'streak', 20],
];
for (const [title, description, category, xp] of BADGES) {
  await sql`INSERT INTO achievements (title, description, category, xp_bonus)
    VALUES (${title}, ${description}, ${category}, ${xp})
    ON CONFLICT (title) DO UPDATE SET description=EXCLUDED.description, category=EXCLUDED.category, xp_bonus=EXCLUDED.xp_bonus`;
  console.log('  ✓', title);
}
const [c] = await sql`SELECT count(*)::int c FROM achievements`;
console.log('Total achievements:', c.c);
await sql.end();
