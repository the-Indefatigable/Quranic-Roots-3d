import { ImageResponse } from 'next/og';
import { db } from '@/db';
import { roots } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const alt = 'QuRoots — Quranic Root';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// NOTE: English-only by necessity — Satori (@vercel/og in Next 14) cannot shape
// Arabic ("substFormat: 3 is not yet supported"), so rendering the Arabic root
// here 500s. Keep text Latin; draw the ◆ with a CSS shape.
export default async function Image({ params }: { params: { rootId: string } }) {
  const rootName = decodeURIComponent(params.rootId).replace(/\s/g, '');
  const row = await db
    .select({ root: roots.root, meaning: roots.meaning, totalFreq: roots.totalFreq })
    .from(roots)
    .where(eq(roots.root, rootName))
    .limit(1);

  const r = row[0];
  const meaning = r?.meaning ?? 'Quranic Root';
  const freq = r?.totalFreq ?? 0;

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
            fontSize: 24,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#D4A246',
            fontWeight: 600,
          }}
        >
          Quranic Root
        </div>

        <div style={{ flex: 1, display: 'flex' }} />

        {/* meaning — hero */}
        <div
          style={{
            display: 'flex',
            fontSize: 108,
            color: '#F0E4CA',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: -2,
            textShadow: '0 0 60px rgba(212,162,70,0.25)',
          }}
        >
          {meaning}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 24,
            marginBottom: 14,
          }}
        >
          <div style={{ width: 10, height: 10, background: '#D4A246', opacity: 0.7, transform: 'rotate(45deg)' }} />
          <div style={{ flex: 1, height: 1, background: 'rgba(212,162,70,0.3)' }} />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#7A7975',
            fontSize: 24,
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
