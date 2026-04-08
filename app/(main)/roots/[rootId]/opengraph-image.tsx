import { ImageResponse } from 'next/og';
import { db } from '@/db';
import { roots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const alt = 'QuRoots — Quranic Root';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { rootId: string } }) {
  const rootName = decodeURIComponent(params.rootId).replace(/\s/g, '');
  const row = await db
    .select({ root: roots.root, meaning: roots.meaning, totalFreq: roots.totalFreq })
    .from(roots)
    .where(eq(roots.root, rootName))
    .limit(1);

  const r = row[0];
  const root = r?.root ?? rootName;
  const meaning = r?.meaning ?? '';
  const freq = r?.totalFreq ?? 0;

  // spaced for readability (ع و ذ)
  const rootSpaced = root.split('').join(' ');

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
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#D4A246',
            fontWeight: 600,
          }}
        >
          Quranic Root
        </div>

        <div style={{ flex: 1, display: 'flex' }} />

        <div
          style={{
            display: 'flex',
            fontSize: 200,
            color: '#D4A246',
            lineHeight: 1,
            marginBottom: 24,
            textShadow: '0 0 60px rgba(212,162,70,0.4)',
            letterSpacing: 12,
          }}
        >
          {rootSpaced}
        </div>

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

        <div
          style={{
            display: 'flex',
            fontSize: 56,
            color: '#F0E4CA',
            fontWeight: 400,
            letterSpacing: -1,
          }}
        >
          {meaning}
        </div>

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
          <span>{freq} occurrences in the Quran</span>
          <span style={{ color: '#D4A246', fontWeight: 600, letterSpacing: 4 }}>QUROOTS</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
