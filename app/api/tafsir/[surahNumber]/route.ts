import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tafsirEntries, tafsirs } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: { surahNumber: string } }
) {
  const surahNum = parseInt(params.surahNumber);
  if (isNaN(surahNum) || surahNum < 1 || surahNum > 114) {
    return NextResponse.json({ error: 'Invalid surah' }, { status: 400 });
  }

  const ayah = req.nextUrl.searchParams.get('ayah');

  try {
    // Get default tafsir (Ibn Kathir)
    const [tafsir] = await db
      .select({ id: tafsirs.id, name: tafsirs.name, authorName: tafsirs.authorName })
      .from(tafsirs)
      .limit(1);

    if (!tafsir) {
      return NextResponse.json({ entries: [], tafsirName: null });
    }

    if (ayah) {
      // Single ayah fetch
      const ayahNum = parseInt(ayah);
      const [entry] = await db
        .select({ ayahNumber: tafsirEntries.ayahNumber, text: tafsirEntries.text })
        .from(tafsirEntries)
        .where(
          and(
            eq(tafsirEntries.tafsirId, tafsir.id),
            eq(tafsirEntries.surahNumber, surahNum),
            eq(tafsirEntries.ayahNumber, ayahNum)
          )
        )
        .limit(1);

      return NextResponse.json(
        {
          entry: entry || null,
          tafsirName: tafsir.name,
          authorName: tafsir.authorName,
        },
        { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
      );
    }

    // Full surah — return all entries (for preloading available ayahs)
    const entries = await db
      .select({ ayahNumber: tafsirEntries.ayahNumber, text: tafsirEntries.text })
      .from(tafsirEntries)
      .where(
        and(
          eq(tafsirEntries.tafsirId, tafsir.id),
          eq(tafsirEntries.surahNumber, surahNum)
        )
      )
      .orderBy(asc(tafsirEntries.ayahNumber));

    return NextResponse.json(
      {
        entries,
        tafsirName: tafsir.name,
        authorName: tafsir.authorName,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }
    );
  } catch (err) {
    console.error(`[/api/tafsir/${surahNum}] Error:`, err);
    return NextResponse.json({ error: 'Failed to fetch tafsir' }, { status: 503 });
  }
}
