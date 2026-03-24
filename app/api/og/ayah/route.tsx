export const dynamic = 'force-dynamic';

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { db, dbQuery } from '@/db';
import { translationEntries, translations, surahs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const s = parseInt(request.nextUrl.searchParams.get('s') ?? '1');
  const a = parseInt(request.nextUrl.searchParams.get('a') ?? '1');

  if (isNaN(s) || isNaN(a)) {
    return new Response('Invalid params', { status: 400 });
  }

  const [surahRow] = await dbQuery(() =>
    db.select({ englishName: surahs.englishName })
      .from(surahs).where(eq(surahs.number, s)).limit(1)
  );

  const [t] = await dbQuery(() =>
    db.select({ id: translations.id }).from(translations).limit(1)
  );
  const [transRow] = t
    ? await dbQuery(() =>
        db.select({ text: translationEntries.text })
          .from(translationEntries)
          .where(and(
            eq(translationEntries.translationId, t.id),
            eq(translationEntries.surahNumber, s),
            eq(translationEntries.ayahNumber, a)
          ))
          .limit(1)
      )
    : [];

  const translation = transRow?.text ?? '';
  const displayTrans = translation.length > 140
    ? translation.slice(0, 140) + '\u2026'
    : translation;

  const surahName = surahRow?.englishName ?? `Surah ${s}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#020617',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px',
        }}
      >
        {/* Gold top line */}
        <div style={{ width: '48px', height: '2px', background: '#D4A574', marginBottom: '48px' }} />

        {/* Translation — the main content */}
        <div style={{
          fontSize: '32px',
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          lineHeight: 1.65,
          maxWidth: '900px',
          marginBottom: '48px',
          fontStyle: 'italic',
        }}>
          {displayTrans ? `\u201C${displayTrans}\u201D` : `${surahName} \u00B7 ${s}:${a}`}
        </div>

        {/* Reference */}
        <div style={{
          fontSize: '14px',
          color: '#D4A574',
          letterSpacing: '3px',
          marginBottom: '48px',
        }}>
          {`${surahName.toUpperCase()} \u00B7 ${s}:${a}`}
        </div>

        {/* Bottom divider + branding */}
        <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.12)', marginBottom: '14px' }} />
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px' }}>
          QUROOTS.COM
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
