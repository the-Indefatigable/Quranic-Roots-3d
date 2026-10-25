'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { primaryNav, moreNav, navItems, visibleFor, SearchIcon, UserIcon, type NavLink } from './navItems';
import { isActiveNav, navHrefs } from './isActiveNav';

const allHrefs = navHrefs(navItems);
const MORE_KEY = 'qr:nav:more';

function Item({ item, active, quiet }: { item: NavLink; active: boolean; quiet?: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`group flex items-center gap-3 px-3 rounded-xl transition-colors duration-150 ${quiet ? 'py-2 text-[14px]' : 'py-2.5 text-[15px]'} ${active ? '' : 'hover:bg-white/[0.04]'}`}
      style={{
        background: active ? 'rgba(212,162,70,0.12)' : undefined,
        color: active ? 'var(--color-primary)' : quiet ? 'var(--color-text-secondary)' : 'var(--color-text)',
        fontWeight: active ? 600 : 500,
      }}
    >
      <item.icon className={`${quiet ? 'w-[18px] h-[18px]' : 'w-5 h-5'} shrink-0 ${active ? '' : 'opacity-80 group-hover:opacity-100'}`} />
      <span>{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,162,70,0.15)', color: 'var(--color-primary)' }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, login } = useAuthStore();
  const show = visibleFor(user);
  const more = moreNav.filter(show);
  const inMore = more.some((i) => isActiveNav(pathname, i.href, allHrefs));
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    try { setMoreOpen(localStorage.getItem(MORE_KEY) === '1'); } catch { /* storage unavailable */ }
  }, []);
  const toggleMore = () => setMoreOpen((o) => {
    try { localStorage.setItem(MORE_KEY, o ? '0' : '1'); } catch { /* storage unavailable */ }
    return !o;
  });

  // ⌘K / Ctrl-K opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); router.push('/search'); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router]);

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40"
      style={{ background: 'var(--color-nav-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRight: '1px solid var(--color-nav-border)' }}
    >
      <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2.5 px-5 h-16 shrink-0">
        <Image src="/logo.png" alt="" width={30} height={30} className="object-contain" />
        <span className="text-xl font-heading tracking-tight" style={{ color: 'var(--color-ivory)' }}>
          Qu<span style={{ color: 'var(--color-primary)' }}>Roots</span>
        </span>
      </Link>

      <div className="px-3 pb-2">
        <Link
          href="/search"
          className="flex items-center gap-2.5 h-10 px-3 rounded-xl text-[14px] text-text-tertiary hover:text-text-secondary transition-colors"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-nav-border)' }}
        >
          <SearchIcon className="w-4 h-4" />
          <span className="flex-1 whitespace-nowrap">Search</span>
          <kbd className="text-[12px] px-1.5 py-0.5 rounded-md border border-white/10 font-sans">⌘K</kbd>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto" aria-label="Main">
        <div className="space-y-0.5">
          {primaryNav.filter(show).map((item) => (
            <Item key={item.href} item={item} active={isActiveNav(pathname, item.href, allHrefs)} />
          ))}
        </div>

        <button
          onClick={toggleMore}
          aria-expanded={moreOpen || inMore}
          className="mt-5 w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-text-tertiary hover:text-text-secondary"
        >
          More
          <svg className={`w-3.5 h-3.5 transition-transform ${moreOpen || inMore ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
        </button>
        {(moreOpen || inMore) && (
          <div className="space-y-0.5 mt-1">
            {more.map((item) => (
              <Item key={item.href} item={item} quiet active={isActiveNav(pathname, item.href, allHrefs)} />
            ))}
          </div>
        )}
      </nav>

      <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid var(--color-nav-border)' }}>
        {isLoading ? (
          <div className="h-11 rounded-xl bg-white/[0.04] animate-pulse" />
        ) : user ? (
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${pathname.startsWith('/profile') || pathname.startsWith('/rewards') ? 'bg-[rgba(212,162,70,0.12)]' : 'hover:bg-white/[0.04]'}`}
          >
            <div className="w-9 h-9 rounded-full overflow-hidden grid place-items-center shrink-0" style={{ background: 'rgba(212,162,70,0.14)' }}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold uppercase" style={{ color: 'var(--color-primary)' }}>{user.name?.[0] || user.email?.[0] || '?'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-text truncate">{user.name || user.email?.split('@')[0] || 'Learner'}</p>
              <p className="text-[12px] text-text-tertiary">Profile and settings</p>
            </div>
          </Link>
        ) : (
          <button onClick={() => login()} className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[14px] font-semibold transition-colors" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
            <UserIcon className="w-4 h-4" />
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}
