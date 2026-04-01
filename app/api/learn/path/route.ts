export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

/**
 * @deprecated Use GET /api/learn/units instead.
 * Kept for backwards compatibility — proxies to the new route.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/learn/units`, {
    headers: Object.fromEntries(new Headers(request.headers)),
  });
  const json = await res.json();
  // Map new { data } envelope to old { path } key
  return NextResponse.json({ path: json.data ?? [] }, { status: res.status });
}
