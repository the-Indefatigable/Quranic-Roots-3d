import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';

export const runtime = 'nodejs';

// Satori rendering is CPU-heavy and every parameter is attacker-controlled, so
// an uncapped endpoint is a cheap way to burn compute. Cards are also cached:
// the same query string always produces the same image.
const LIMIT = 60;
const WINDOW_MS = 60_000;
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800';

// Dynamic OG "progress card" for social shares — a virality lever. English only
// (Satori in Next 14 cannot shape Arabic). Reads self-reported stats from the
// query string, so no private data is exposed.
export async function GET(req: NextRequest) {
  const limited = rateLimit(clientKey(req, 'og-progress'), LIMIT, WINDOW_MS);
  if (!limited.ok) return tooManyRequests(limited);

  const p = req.nextUrl.searchParams;
  const name = (p.get('n') || 'A learner').slice(0, 40);
  const level = p.get('lvl') || '1';
  const streak = p.get('streak') || '0';
  const xp = Number(p.get('xp') || '0').toLocaleString();
  const kind = p.get('kind') || 'progress';

  const isIjazah = kind === 'ijazah';
  const headline = isIjazah ? 'earned the Grammarian’s Ijāzah' : 'is learning to read the Quran';
  const gold = '#D4A246';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#111110',
          backgroundImage: 'radial-gradient(ellipse 70% 80% at 50% -10%, rgba(212,162,70,0.22) 0%, transparent 70%)',
          padding: '72px 80px',
          color: '#F0E4CA',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, color: gold, letterSpacing: 2 }}>
          <div style={{ width: 26, height: 26, background: gold, transform: 'rotate(45deg)', marginRight: 16 }} />
          QuRoots
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {isIjazah && <div style={{ fontSize: 60, marginBottom: 8 }}>🎓</div>}
          <div style={{ fontSize: 34, color: '#8A8783' }}>{name}</div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, marginTop: 6, color: '#F0E4CA' }}>
            {headline}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 56 }}>
          <Stat label="Level" value={level} gold={gold} />
          <Stat label="Day streak" value={`${streak} 🔥`} gold={gold} />
          <Stat label="XP" value={xp} gold={gold} />
        </div>

        <div style={{ display: 'flex', fontSize: 26, color: '#8A8783' }}>
          Learn Quranic Arabic free at quroots.com
        </div>
      </div>
    ),
    { width: 1200, height: 630, headers: { 'Cache-Control': CACHE_CONTROL } }
  );
}

function Stat({ label, value, gold }: { label: string; value: string; gold: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 52, fontWeight: 700, color: gold }}>{value}</div>
      <div style={{ fontSize: 24, color: '#8A8783', textTransform: 'uppercase', letterSpacing: 2 }}>{label}</div>
    </div>
  );
}
