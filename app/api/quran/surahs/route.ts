import { NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { surahs } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const revalidate = 86400;

export async function GET() {
  const allSurahs = await dbQuery(() =>
    db
      .select({
        number: surahs.number,
        arabicName: surahs.arabicName,
        englishName: surahs.englishName,
        versesCount: surahs.versesCount,
        revelationType: surahs.revelationType,
      })
      .from(surahs)
      .orderBy(asc(surahs.number))
  );

  return NextResponse.json(allSurahs, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
