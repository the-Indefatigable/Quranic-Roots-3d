export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

/**
 * @deprecated Use POST /api/learn/lessons/:lessonId/complete instead.
 * Kept for backwards compatibility.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { lessonId, ...rest } = body;

  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });
  }

  const origin = request.nextUrl.origin;
  const res = await fetch(`${origin}/api/learn/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...Object.fromEntries(new Headers(request.headers)),
    },
    body: JSON.stringify(rest),
  });
  const json = await res.json();
  // Flatten { data } envelope for old consumers
  return NextResponse.json({ ...json.data, success: true, error: json.error }, { status: res.status });
}
