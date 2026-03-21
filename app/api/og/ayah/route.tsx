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

  try {
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
    const reference = `${surahName}  \u00B7  ${s}:${a}`;

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
          {/* Glow blob */}
          <div style={{
            position: 'absolute',
            top: '115px',
            left: '150px',
            width: '900px',
            height: '400px',
            background: 'rgba(212,165,116,0.10)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }} />

          {/* Top line */}
          <div style={{
            width: '64px',
            height: '1px',
            background: 'rgba(212,165,116,0.5)',
            marginBottom: '40px',
          }} />

          {/* Arabic */}
          {ayahRow?.textUthmani && (
            <div style={{
              fontSize: '46px',
              color: '#e2e8f0',
              textAlign: 'center',
              lineHeight: 1.9,
              marginBottom: '32px',
              direction: 'rtl',
              maxWidth: '900px',
            }}>
              {ayahRow.textUthmani}
            </div>
          )}

          {/* Translation */}
          {displayTrans ? (
            <div style={{
              fontSize: '21px',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              lineHeight: 1.6,
              maxWidth: '880px',
              marginBottom: '40px',
            }}>
              {'\u201C'}{displayTrans}{'\u201D'}
            </div>
          ) : null}

          {/* Reference */}
          <div style={{
            fontSize: '13px',
            color: '#D4A574',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '40px',
          }}>
            {reference}
          </div>

          {/* Divider + branding */}
          <div style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: '14px',
          }} />
          <div style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.06em',
          }}>
            QuRoots
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error('[og/ayah]', err);
    return new Response('Image generation failed', { status: 500 });
  }
}
