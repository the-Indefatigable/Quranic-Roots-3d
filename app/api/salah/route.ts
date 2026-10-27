import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PATH, PATH_PRICE_CENTS, pathOffer } from '@/lib/salahPath';
import { requestHasPathAccess } from '@/lib/pathPurchase';

export const dynamic = 'force-dynamic';

// The path overview: every day's title and progress, never the content of a locked day.
export async function GET() {
  const session = await auth();
  const access = await requestHasPathAccess(session?.user?.id);
  return NextResponse.json({
    access,
    signedIn: !!session?.user?.id,
    checkoutEnabled: !!process.env.STRIPE_SECRET_KEY,
    priceCents: PATH_PRICE_CENTS,
    offer: pathOffer(),
    totals: PATH.totals,
    surahs: PATH.surahs,
    days: PATH.days.map((d) => ({
      day: d.day, title: d.title, free: d.free, pctSalah: d.pctSalah,
      rootCount: d.roots.length, lineCount: d.unlocked.length, locked: !d.free && !access,
    })),
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}
