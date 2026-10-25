'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { primaryNav, moreNav, navItems, visibleFor, MoreIcon, SearchIcon, type NavLink } from './navItems';
import { isActiveNav, navHrefs } from './isActiveNav';

const allHrefs = navHrefs(navItems);

/** Opens the feedback panel (FeedbackWidget listens for this). */
export const openFeedback = () => window.dispatchEvent(new Event('qr:feedback'));

/**
 * Phone navigation: a slim top bar (logo, search, account) and a bottom tab bar with
 * the four main places plus "More", which opens a sheet with everything else.
 * Signed in, the tabs are Today · Salah · Quran · Roots; signed out, Community takes
 * Today's place. Desktop keeps the <Sidebar/>.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user, isLoading, login } = useAuthStore();
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const show = visibleFor(user);

  const tabs = primaryNav.filter(show).filter((i) => (user ? i.href !== '/community' : true)).slice(0, 4);
  const sheetItems: NavLink[] = [...primaryNav.filter(show).filter((i) => !tabs.includes(i)), ...moreNav.filter(show)];
  const moreActive = sheetItems.some((i) => isActiveNav(pathname, i.href, allHrefs));

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    sheetRef.current?.querySelector<HTMLElement>('a[href], button')?.focus();
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      {/* Top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4"
        style={{ background: 'var(--color-nav-glass)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--color-nav-border)' }}
      >
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={26} height={26} className="object-contain" />
          <span className="text-[17px] font-heading tracking-tight" style={{ color: 'var(--color-ivory)' }}>
            Qu<span style={{ color: 'var(--color-primary)' }}>Roots</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <Link href="/search" aria-label="Search" className="w-10 h-10 grid place-items-center rounded-xl text-text-secondary">
            <SearchIcon className="w-[22px] h-[22px]" />
          </Link>
          {isLoading ? null : user ? (
            <Link href="/profile" aria-label="Profile" className="w-10 h-10 grid place-items-center">
              <span className="w-8 h-8 rounded-full overflow-hidden grid place-items-center" style={{ background: 'rgba(212,162,70,0.14)' }}>
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold uppercase" style={{ color: 'var(--color-primary)' }}>{user.name?.[0] || user.email?.[0] || '?'}</span>
                )}
              </span>
            </Link>
          ) : (
            <button onClick={() => login()} className="ml-1 h-9 px-4 rounded-full text-[14px] font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]"
        style={{ background: 'rgba(17,17,16,0.94)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--color-nav-border)' }}
      >
        {tabs.map((t) => {
          const active = isActiveNav(pathname, t.href, allHrefs);
          return (
            <Link key={t.href} href={t.href} aria-current={active ? 'page' : undefined} className="flex flex-col items-center justify-center gap-1 h-16" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
              <t.icon className="w-6 h-6" />
              <span className="text-[12px] font-medium">{t.label === 'Your Salah' ? 'Salah' : t.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} aria-expanded={open} aria-controls="more-sheet" className="flex flex-col items-center justify-center gap-1 h-16" style={{ color: moreActive || open ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
          <MoreIcon className="w-6 h-6" />
          <span className="text-[12px] font-medium">More</span>
        </button>
      </nav>

      {/* More sheet */}
      <div onClick={() => setOpen(false)} aria-hidden className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} style={{ background: 'rgba(8,7,6,0.6)' }} />
      <aside
        ref={sheetRef}
        id="more-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="More"
        {...(open ? {} : { inert: '' as unknown as boolean })}
        className={`lg:hidden fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] transition-transform duration-300 ease-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ background: '#161410', borderTop: '1px solid rgba(212,162,70,0.18)', maxHeight: '82vh', overflowY: 'auto' }}
      >
        <div className="mx-auto w-10 h-1 rounded-full bg-white/15 mb-4" />
        <div className="grid grid-cols-3 gap-2">
          {sheetItems.map((item) => {
            const active = isActiveNav(pathname, item.href, allHrefs);
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-2 h-[88px] rounded-2xl text-center px-1" style={{ background: active ? 'rgba(212,162,70,0.12)' : 'rgba(255,255,255,0.03)', color: active ? 'var(--color-primary)' : 'var(--color-text)' }}>
                <item.icon className="w-6 h-6 opacity-90" />
                <span className="text-[13px] leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
        <button onClick={() => { setOpen(false); openFeedback(); }} className="mt-3 w-full h-11 rounded-xl text-[14px] text-text-secondary border border-white/10">
          Send feedback
        </button>
      </aside>
    </>
  );
}
