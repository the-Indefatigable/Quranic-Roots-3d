import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://quroots.com',
  'https://www.quroots.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

// Bulk scrapers, dataset crawlers and scripted HTTP clients. Search engines and the
// AI answer engines that cite and link back (Googlebot, Bingbot, OAI-SearchBot,
// ChatGPT-User, PerplexityBot) are not on this list.
const BLOCKED_AGENTS = new RegExp(
  [
    'Bytespider', 'CCBot', 'GPTBot', 'anthropic-ai', 'ClaudeBot', 'Claude-Web', 'meta-externalagent',
    'FacebookBot', 'Diffbot', 'ImagesiftBot', 'Omgili', 'PetalBot', 'Amazonbot', 'cohere-ai',
    'AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot', 'DataForSeoBot', 'BLEXBot', 'serpstatbot',
    'Scrapy', 'python-requests', 'python-urllib', 'aiohttp', 'httpx', 'Go-http-client', 'okhttp',
    'node-fetch', 'axios', 'undici', 'Java/', 'libwww-perl', 'Wget', 'curl/', 'colly', 'HeadlessChrome',
    'PhantomJS', 'Puppeteer', 'Playwright',
  ].map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|'),
  'i',
);
const SEARCH_ENGINES = /Googlebot|bingbot|DuckDuckBot|Applebot|YandexBot|OAI-SearchBot|ChatGPT-User|PerplexityBot/i;

// Per-IP sliding window. Edge instances do not share memory, so this stops a single
// address hammering one region; the Vercel Firewall rate-limit rule covers the rest.
const WINDOW_MS = 60_000;
const LIMITS = { api: 60, page: 90, bot: 300 };
const hits = new Map<string, number[]>();

function overLimit(key: string, limit: number, now: number): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v[v.length - 1] > WINDOW_MS) hits.delete(k);
  }
  return recent.length > limit;
}

function clientIp(request: NextRequest): string {
  return request.headers.get('x-real-ip')
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? 'unknown';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');
  const isAuth = pathname.startsWith('/api/auth');
  const isCron = pathname.startsWith('/api/cron') || pathname.startsWith('/api/webhooks');
  const ua = request.headers.get('user-agent') ?? '';

  if (!isCron) {
    if (!ua || BLOCKED_AGENTS.test(ua)) {
      return new NextResponse('Automated access is not permitted. See https://quroots.com/terms', { status: 403 });
    }
    const bucket = SEARCH_ENGINES.test(ua) ? 'bot' : isApi ? 'api' : 'page';
    if (overLimit(`${clientIp(request)}:${bucket}`, LIMITS[bucket], Date.now())) {
      return new NextResponse('Too many requests. Please slow down.', { status: 429, headers: { 'Retry-After': '60' } });
    }
  }

  if (!isApi || isAuth) return NextResponse.next();

  const origin = request.headers.get('origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS headers to API responses
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  return response;
}

export const config = {
  // Every page and API route; static files, images and the robots/sitemap/llms files stay open.
  matcher: ['/((?!_next/static|_next/image|favicon|icons|images|fonts|audio|robots.txt|sitemap.xml|llms.txt|manifest|.*\\.(?:png|jpg|jpeg|svg|webp|ico|mp3|woff2?|css|js)$).*)'],
};
