import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { PATH } from '@/lib/salahPath';

export const runtime = 'nodejs';

const CACHE = 'public, max-age=86400, s-maxage=604800, immutable';

/**
 * The progress card people share: "I understand 29% of my salah." ?p=percent&d=day, and
 * ?story=1 for a 1080×1920 card sized for Instagram and WhatsApp stories. No Arabic text: the
 * image renderer's Arabic shaping crashes the server process.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'og-salah'), 60, 60_000);
  if (!limited.ok) return tooManyRequests(limited);
  const q = request.nextUrl.searchParams;
  const day = Math.min(30, Math.max(1, parseInt(q.get('d') ?? '1') || 1));
  const pct = PATH.days.find((d) => d.day === day)?.pctSalah ?? Math.min(100, Math.max(0, parseInt(q.get('p') ?? '0') || 0));
  const title = PATH.days.find((d) => d.day === day)?.title ?? '';
  const story = q.get('story') === '1';
  const [W, H] = story ? [1080, 1920] : [1200, 630];
  const gold = '#D4A246', ivory = '#F3ECDD', soft = '#A8A39A';
  const big = story ? 120 : 76;

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: story ? '0 90px' : '0 80px', background: 'radial-gradient(ellipse 80% 60% at 50% 35%, rgba(212,162,70,0.22), #0C0B0A 70%)', color: ivory, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: story ? 36 : 24, letterSpacing: 6, color: gold, marginBottom: story ? 40 : 18 }}>QUROOTS · UNDERSTAND YOUR SALAH</div>
        <div style={{ display: 'flex', fontSize: big, lineHeight: 1.08, fontWeight: 700, letterSpacing: -1 }}>I understand {pct}% of my salah.</div>
        <div style={{ display: 'flex', width: '100%', height: story ? 22 : 14, borderRadius: 999, background: 'rgba(255,255,255,0.1)', marginTop: story ? 60 : 34 }}>
          <div style={{ display: 'flex', width: `${Math.max(3, pct)}%`, height: '100%', borderRadius: 999, background: gold }} />
        </div>
        <div style={{ display: 'flex', fontSize: story ? 40 : 28, color: soft, marginTop: story ? 34 : 20 }}>Day {day} of 30 · {title}</div>
        <div style={{ display: 'flex', flexDirection: story ? 'column' : 'row', fontSize: story ? 44 : 30, color: ivory, marginTop: story ? 140 : 48 }}>
          <span>Learning the Arabic roots of every word I pray.</span>
          <span style={{ color: gold, marginLeft: story ? 0 : 12, marginTop: story ? 24 : 0 }}>quroots.com/salah</span>
        </div>
      </div>
    ),
    { width: W, height: H, headers: { 'Cache-Control': CACHE } },
  );
}
