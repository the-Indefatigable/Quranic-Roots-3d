export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const Schema = z.object({
  // Validated as a UUID because it is interpolated into a URL path. Previously
  // any string was accepted, so a crafted lessonId could traverse into other
  // internal endpoints.
  lessonId: z.string().uuid(),
});

/**
 * @deprecated Use POST /api/learn/lessons/:lessonId/complete instead.
 * Kept for backwards compatibility.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing or invalid lessonId' }, { status: 400 });
  }

  const { lessonId, ...rest } = body as Record<string, unknown>;
  const forwardedBody = JSON.stringify(rest);

  const origin = request.nextUrl.origin;
  const res = await fetch(
    `${origin}/api/learn/lessons/${encodeURIComponent(parsed.data.lessonId)}/complete`,
    {
      method: 'POST',
      // Forward only what the downstream route needs. Copying every inbound
      // header sent the original content-length alongside a rewritten body,
      // so the declared length no longer matched what was transmitted.
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('cookie') ? { cookie: request.headers.get('cookie')! } : {}),
      },
      body: forwardedBody,
    }
  );

  // The upstream route can return a non-JSON error page; res.json() threw on it.
  let json: Record<string, unknown> = {};
  try {
    json = await res.json();
  } catch {
    return NextResponse.json(
      { error: 'Upstream returned an unreadable response' },
      { status: res.status >= 400 ? res.status : 502 }
    );
  }

  // Flatten { data } envelope for old consumers. `data` is absent on errors,
  // and spreading undefined used to produce a misleading success payload.
  const data = (json.data as Record<string, unknown> | undefined) ?? {};
  return NextResponse.json(
    { ...data, success: res.ok, error: json.error ?? null },
    { status: res.status }
  );
}
