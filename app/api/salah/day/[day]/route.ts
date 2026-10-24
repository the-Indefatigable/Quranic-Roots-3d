import { NextResponse } from 'next/server';
import { pack } from '@/lib/wire';
import { auth } from '@/lib/auth';
import { PATH, hasPathAccess, linesFor, linesOf } from '@/lib/salahPath';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ day: string }> }) {
  const n = Number((await params).day);
  const day = PATH.days.find((d) => d.day === n);
  if (!day) return NextResponse.json({ error: 'No such day' }, { status: 404 });
  if (!day.free) {
    const session = await auth();
    if (!(await hasPathAccess(session?.user?.id))) {
      return NextResponse.json({ locked: true, day: n, title: day.title }, { status: 402 });
    }
  }
  // Review days: day 7 shows the whole of Al-Fatiha; day 30 every surah in the path.
  const lines = n === 7 ? linesOf(1) : n === 30 ? PATH.lines : linesFor(n);
  // quiz distractors: meanings of roots learned on earlier days
  const earlier = PATH.days.filter((d) => d.day < n).flatMap((d) => d.roots.map((r) => r.meaning)).filter(Boolean);
  return NextResponse.json(pack({ day, lines, earlierMeanings: earlier.slice(-24) }), { headers: { 'Cache-Control': 'private, no-store' } });
}
