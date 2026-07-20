/**
 * PART C — Application engine setup.
 * Creates (idempotent) the tables for the "living text" features and seeds
 * a starter set of Nawawi 40 hadith:
 *   - daily_reviews   : one row per user per day per kind (ayah/hadith) — idempotent XP
 *   - hadith_collections, hadith : Hadith corpus (mirrors the Quran data shape)
 *
 * Run: DATABASE_URL=... node scripts/seed-application-engine.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// Nawawi's Forty — a canonical, high-value starter set.
const NAWAWI = [
  [1, 'Actions are by intentions', 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَىٰ',
    'Actions are but by intentions, and every person will have only what they intended.', 'Umar ibn al-Khattab', 'Bukhari & Muslim'],
  [2, 'Islam, Iman, and Ihsan', 'أَنْ تَعْبُدَ اللَّهَ كَأَنَّكَ تَرَاهُ، فَإِنْ لَمْ تَكُنْ تَرَاهُ فَإِنَّهُ يَرَاكَ',
    'Ihsan is to worship Allah as if you see Him; and if you do not see Him, then [know] He sees you.', 'Umar ibn al-Khattab', 'Muslim'],
  [3, 'The pillars of Islam', 'بُنِيَ الْإِسْلَامُ عَلَىٰ خَمْسٍ',
    'Islam is built upon five [pillars].', 'Ibn Umar', 'Bukhari & Muslim'],
  [6, 'The lawful and the doubtful', 'إِنَّ الْحَلَالَ بَيِّنٌ وَإِنَّ الْحَرَامَ بَيِّنٌ',
    'Indeed the lawful is clear and the unlawful is clear.', 'al-Nu’man ibn Bashir', 'Bukhari & Muslim'],
  [7, 'The religion is sincerity', 'الدِّينُ النَّصِيحَةُ',
    'The religion is sincere counsel (nasihah).', 'Tamim al-Dari', 'Muslim'],
  [10, 'Allah is pure', 'إِنَّ اللَّهَ طَيِّبٌ لَا يَقْبَلُ إِلَّا طَيِّبًا',
    'Indeed Allah is pure and accepts only what is pure.', 'Abu Hurayrah', 'Muslim'],
  [13, 'Love for your brother', 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّىٰ يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    'None of you truly believes until he loves for his brother what he loves for himself.', 'Anas ibn Malik', 'Bukhari & Muslim'],
  [15, 'Speak good or stay silent', 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    'Whoever believes in Allah and the Last Day, let him speak good or remain silent.', 'Abu Hurayrah', 'Bukhari & Muslim'],
  [16, 'Do not become angry', 'لَا تَغْضَبْ',
    'Do not become angry.', 'Abu Hurayrah', 'Bukhari'],
  [19, 'Be mindful of Allah', 'احْفَظِ اللَّهَ يَحْفَظْكَ',
    'Be mindful of Allah and He will protect you.', 'Ibn Abbas', 'Tirmidhi'],
  [25, 'Every good deed is charity', 'كُلُّ مَعْرُوفٍ صَدَقَةٌ',
    'Every act of goodness is charity.', 'Jabir ibn Abdullah', 'Bukhari & Muslim'],
  [34, 'Changing evil', 'مَنْ رَأَىٰ مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ',
    'Whoever of you sees an evil, let him change it with his hand.', 'Abu Sa’id al-Khudri', 'Muslim'],
  [35, 'Brotherhood', 'لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا',
    'Do not envy one another, do not inflate prices, do not hate one another… and be, O servants of Allah, brothers.', 'Abu Hurayrah', 'Muslim'],
  [40, 'Be as a stranger in this world', 'كُنْ فِي الدُّنْيَا كَأَنَّكَ غَرِيبٌ أَوْ عَابِرُ سَبِيلٍ',
    'Be in this world as though you were a stranger or a traveler passing through.', 'Ibn Umar', 'Bukhari'],
];

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS daily_reviews (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      review_date date NOT NULL,
      kind text NOT NULL DEFAULT 'ayah',
      xp_earned integer NOT NULL DEFAULT 0,
      created_at timestamptz DEFAULT now(),
      UNIQUE (user_id, review_date, kind)
    )`;
  console.log('✓ daily_reviews table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS hadith_collections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text UNIQUE NOT NULL,
      name text NOT NULL,
      name_ar text,
      description text,
      created_at timestamptz DEFAULT now()
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS hadith (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      collection_id uuid NOT NULL REFERENCES hadith_collections(id) ON DELETE CASCADE,
      number integer NOT NULL,
      title text,
      arabic text NOT NULL,
      english text NOT NULL,
      narrator text,
      grade text,
      created_at timestamptz DEFAULT now(),
      UNIQUE (collection_id, number)
    )`;
  console.log('✓ hadith_collections + hadith tables ready');

  const [coll] = await sql`
    INSERT INTO hadith_collections (slug, name, name_ar, description)
    VALUES ('nawawi40', 'Al-Arba’in al-Nawawiyyah', 'الأَرْبَعُونَ النَّوَوِيَّة', 'Imam al-Nawawi’s forty foundational hadith.')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, name_ar = EXCLUDED.name_ar, description = EXCLUDED.description
    RETURNING id`;
  for (const [number, title, arabic, english, narrator, grade] of NAWAWI) {
    await sql`
      INSERT INTO hadith (collection_id, number, title, arabic, english, narrator, grade)
      VALUES (${coll.id}, ${number}, ${title}, ${arabic}, ${english}, ${narrator}, ${grade})
      ON CONFLICT (collection_id, number) DO UPDATE SET
        title = EXCLUDED.title, arabic = EXCLUDED.arabic, english = EXCLUDED.english,
        narrator = EXCLUDED.narrator, grade = EXCLUDED.grade`;
  }
  const [c] = await sql`SELECT count(*)::int c FROM hadith`;
  console.log(`✓ Seeded ${c.c} hadith into Nawawi 40`);
}
main().then(() => sql.end()).catch(async (e) => { console.error('FAIL:', e.message); await sql.end(); process.exit(1); });
