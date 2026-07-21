export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { DAILY_AYAT, dayIndex } from '@/data/dailyAyat';

// GET /api/daily — public. Returns today's ayah (word-by-word from quran_words)
// and today's hadith, plus which the signed-in user has already reviewed today.
export async function GET() {
  try {
    const idx = dayIndex();
    const ref = DAILY_AYAT[idx % DAILY_AYAT.length];

    const [words, hadithRows] = await Promise.all([
      dbQuery(() =>
        db.execute(sql`
          SELECT position, text_uthmani, transliteration, translation, root_arabic
          FROM quran_words
          WHERE surah_number = ${ref.surah} AND ayah_number = ${ref.ayah}
          ORDER BY position
        `)
      ) as Promise<any[]>,
      dbQuery(() =>
        db.execute(sql`SELECT id, number, title, arabic, english, narrator, grade FROM hadith ORDER BY number`)
      ) as Promise<any[]>,
    ]);

    const hadith = hadithRows.length ? hadithRows[idx % hadithRows.length] : null;

    const session = await auth().catch(() => null);
    const reviewed: Record<string, boolean> = { ayah: false, hadith: false, quiz: false };
    if (session?.user?.id) {
      const rows = (await dbQuery(() =>
        db.execute(sql`SELECT kind FROM daily_reviews WHERE user_id = ${session.user.id} AND review_date = CURRENT_DATE`)
      )) as any[];
      for (const r of rows) reviewed[r.kind] = true;
    }

    return NextResponse.json({
      ayah: {
        surah: ref.surah,
        ayah: ref.ayah,
        surahName: ref.surahName,
        translation: ref.translation,
        words: words.map((w) => ({
          position: w.position,
          ar: w.text_uthmani,
          translit: w.transliteration,
          translation: w.translation,
          root: w.root_arabic,
        })),
      },
      hadith,
      reviewed,
      loggedIn: !!session?.user?.id,
    });
  } catch (error) {
    console.error('[daily] GET error:', error);
    return NextResponse.json({ error: 'Failed to load daily content' }, { status: 500 });
  }
}
