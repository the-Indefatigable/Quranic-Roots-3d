export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated Use GET /api/learn/lessons/:lessonId instead.
 * Kept for backwards compatibility.
 */
export async function GET(request: NextRequest) {
  const lessonId = request.nextUrl.searchParams.get('id');
  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const res = await fetch(`${origin}/api/learn/lessons/${lessonId}`, {
    headers: Object.fromEntries(new Headers(request.headers)),
  });
  const json = await res.json();
  // Map new { data } envelope to old { lesson } key
  return NextResponse.json({ lesson: json.data, hearts: json.hearts, error: json.error }, { status: res.status });
}
