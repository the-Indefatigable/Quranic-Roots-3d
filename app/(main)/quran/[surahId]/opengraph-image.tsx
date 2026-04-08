import { ImageResponse } from 'next/og';
import { db } from '@/db';
import { surahs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const alt = 'QuRoots — Surah';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { surahId: string } }) {
  const n = parseInt(params.surahId);
  const row = await db
    .select({
      number: surahs.number,
      englishName: surahs.englishName,
      arabicName: surahs.arabicName,
      versesCount: surahs.versesCount,
      revelationType: surahs.revelationType,
    })
    .from(surahs)
    .where(eq(surahs.number, n))
    .limit(1);

  const s = row[0];
  const englishName = s?.englishName ?? 'Quran';
  const arabicName = s?.arabicName ?? '';
  const number = s?.number ?? n;
  const versesCount = s?.versesCount ?? 0;
  const revelation = s?.revelationType === 'makkah' ? 'Meccan' : s?.revelationType === 'madinah' ? 'Medinan' : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#111110',
          backgroundImage:
            'radial-gradient(ellipse 60% 70% at 50% 0%, rgba(212,162,70,0.18) 0%, transparent 70%)',
          padding: '72px 80px',
          color: '#F0E4CA',
          fontFamily: 'serif',
        }}
      >
        {/* top eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#D4A246',
            fontWeight: 600,
          }}
        >
          <span>Surah {number}</span>
          {revelation && (
            <>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>{revelation}</span>
            </>
          )}
        </div>

        {/* spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* arabic name */}
        <div
          style={{
            display: 'flex',
            fontSize: 180,
            color: '#D4A246',
            lineHeight: 1,
            marginBottom: 16,
            textShadow: '0 0 60px rgba(212,162,70,0.4)',
          }}
        >
          {arabicName}
        </div>

        {/* divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 14,
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'rgba(212,162,70,0.3)' }} />
          <div style={{ color: '#D4A246', fontSize: 14, opacity: 0.7 }}>◆</div>
          <div style={{ flex: 1, height: 1, background: 'rgba(212,162,70,0.3)' }} />
        </div>

        {/* english name */}
        <div
          style={{
            display: 'flex',
            fontSize: 64,
            color: '#F0E4CA',
            fontWeight: 400,
            letterSpacing: -1,
          }}
        >
          {englishName}
        </div>

        {/* footer */}
        <div
          style={{
            marginTop: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#7A7975',
            fontSize: 22,
          }}
        >
          <span>{versesCount} Ayahs</span>
          <span style={{ color: '#D4A246', fontWeight: 600, letterSpacing: 4 }}>QUROOTS</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
