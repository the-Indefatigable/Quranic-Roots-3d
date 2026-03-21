import { NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { translations, translationEntries } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export const revalidate = 0;

export async function GET() {
  const translationRows = await dbQuery(() =>
    db.select().from(translations)
  );

  const counts = await Promise.all(
    translationRows.map(async (t) => {
      const [row] = await dbQuery(() =>
        db.select({ count: count() }).from(translationEntries)
          .where(eq(translationEntries.translationId, t.id))
      );
      return { id: t.id, name: t.name, resourceId: t.resourceId, entries: row?.count ?? 0 };
    })
  );

  return NextResponse.json({ translations: counts });
}
