'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { communityTabs } from '@/components/ui/navItems';

/** Lounge, Leaderboard and Badges are one place: Community. */
export function CommunityTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Community" className="flex gap-1 p-1 rounded-full w-fit mb-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {communityTabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined} className="h-9 px-4 grid place-items-center rounded-full text-[14px] font-medium transition-colors" style={{ background: active ? 'var(--color-primary)' : 'transparent', color: active ? '#1a1206' : 'var(--color-text-secondary)' }}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
