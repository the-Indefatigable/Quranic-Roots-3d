import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { db, dbQuery } from '@/db';
import { ayahs, translationEntries, translations, surahs } from '@/db/schema';
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

  const [ayahRow] = await dbQuery(() =>
    db.select({ textUthmani: ayahs.textUthmani })
      .from(ayahs)
      .where(and(eq(ayahs.surahNumber, s), eq(ayahs.ayahNumber, a)))
      .limit(1)
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
  const displayTrans = translation.length > 120
    ? translation.slice(0, 120) + '\u2026'
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
          padding: '80px',
        }}
      >
        {/* Gold top line */}
        <div style={{
          width: '56px',
          height: '1px',
          background: 'rgba(212,165,116,0.6)',
          marginBottom: '40px',
        }} />

        {/* Arabic text */}
        {ayahRow?.textUthmani ? (
          <div style={{
            fontSize: '44px',
            color: '#e2e8f0',
            textAlign: 'center',
            lineHeight: 1.9,
            marginBottom: '28px',
            direction: 'rtl',
            maxWidth: '920px',
          }}>
            {ayahRow.textUthmani}
          </div>
        ) : null}

        {/* Translation */}
        {displayTrans ? (
          <div style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            lineHeight: 1.6,
            maxWidth: '860px',
            marginBottom: '36px',
          }}>
            {'\u201C'}{displayTrans}{'\u201D'}
          </div>
        ) : null}

        {/* Reference */}
        <div style={{
          fontSize: '12px',
          color: '#D4A574',
          letterSpacing: '2px',
          marginBottom: '36px',
        }}>
          {surahName.toUpperCase()} {'\u00B7'} {s}:{a}
        </div>

        {/* Bottom divider */}
        <div style={{
          width: '36px',
          height: '1px',
          background: 'rgba(255,255,255,0.1)',
          marginBottom: '12px',
        }} />

        {/* Branding */}
        <div style={{
          fontSize: '14px',
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: '1px',
        }}>
          QuRoots
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
