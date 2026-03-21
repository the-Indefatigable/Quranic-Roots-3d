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
    db.select({ englishName: surahs.englishName, arabicName: surahs.arabicName })
      .from(surahs).where(eq(surahs.number, s)).limit(1)
  );

  const [ayahRow] = await dbQuery(() =>
    db.select({ textUthmani: ayahs.textUthmani })
      .from(ayahs)
      .where(and(eq(ayahs.surahNumber, s), eq(ayahs.ayahNumber, a)))
      .limit(1)
  );

  const [transRow] = await dbQuery(async () => {
    const [t] = await db.select({ id: translations.id }).from(translations).limit(1);
    if (!t) return [];
    return db.select({ text: translationEntries.text })
      .from(translationEntries)
      .where(and(
        eq(translationEntries.translationId, t.id),
        eq(translationEntries.surahNumber, s),
        eq(translationEntries.ayahNumber, a)
      ))
      .limit(1);
  });

  const translation = transRow?.text ?? '';
  const maxLen = 130;
  const displayTrans = translation.length > maxLen
    ? translation.slice(0, maxLen) + '…'
    : translation;

  // Try to load Arabic font for proper rendering
  let arabicFont: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fontsource/amiri@5.0.3/files/amiri-arabic-400-normal.woff',
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) arabicFont = await res.arrayBuffer();
  } catch {
    // Fall back — Arabic text may not render on all systems
  }

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
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '900px',
          height: '600px',
          background: 'radial-gradient(ellipse, rgba(212,165,116,0.14) 0%, transparent 65%)',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* Top line */}
        <div style={{
          width: '64px',
          height: '1px',
          background: 'rgba(212,165,116,0.5)',
          marginBottom: '48px',
        }} />

        {/* Arabic text */}
        {ayahRow?.textUthmani && (
          <div style={{
            fontSize: arabicFont ? '48px' : '44px',
            color: '#e2e8f0',
            textAlign: 'center',
            lineHeight: 1.9,
            marginBottom: '36px',
            fontFamily: arabicFont ? 'Arabic' : 'serif',
            direction: 'rtl',
            maxWidth: '900px',
          }}>
            {ayahRow.textUthmani}
          </div>
        )}

        {/* Translation */}
        {displayTrans && (
          <div style={{
            fontSize: '22px',
            color: 'rgba(255,255,255,0.5)',
            textAlign: 'center',
            lineHeight: 1.65,
            fontStyle: 'italic',
            maxWidth: '880px',
            marginBottom: '44px',
          }}>
            &ldquo;{displayTrans}&rdquo;
          </div>
        )}

        {/* Reference */}
        <div style={{
          fontSize: '13px',
          color: '#D4A574',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '44px',
        }}>
          {surahRow?.englishName ?? `Surah ${s}`} &nbsp;·&nbsp; {s}:{a}
        </div>

        {/* Bottom line + branding */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.06em',
          }}>
            Qu<span style={{ color: '#D4A574' }}>Roots</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: arabicFont
        ? [{ name: 'Arabic', data: arabicFont, weight: 400, style: 'normal' }]
        : [],
    }
  );
}
