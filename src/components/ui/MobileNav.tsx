'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { navItems } from './navItems';

/**
 * Mobile navigation: a fixed top bar with the logo and a hamburger (☰) that
 * opens a right-side drawer containing the full nav — the conventional website
 * pattern. Replaces the old bottom tab bar. Desktop keeps the <Sidebar/>.
 */
export function MobileNav() {
  const pathname = usePathname();
  const { user, isLoading, setShowLoginModal } = useAuthStore();
  const [open, setOpen] = useState(false);

  // Close the drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Top bar */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4"
        style={{
          background: 'var(--color-nav-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-nav-border)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="QuRoots" width={28} height={28} className="object-contain" />
          <span className="text-base font-heading tracking-tight" style={{ color: 'var(--color-ivory)' }}>
            Qu<span style={{ color: 'var(--color-primary)' }}>Roots</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="w-10 h-10 -mr-2 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(8,7,6,0.6)', backdropFilter: 'blur(2px)' }}
      />

      {/* Drawer */}
      <aside
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[82%] max-w-[320px] flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: '#161410', borderLeft: '1px solid var(--color-nav-border)', boxShadow: '-8px 0 40px rgba(0,0,0,0.4)' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between h-14 px-4 shrink-0" style={{ borderBottom: '1px solid var(--color-nav-border)' }}>
          <span className="text-base font-heading tracking-tight" style={{ color: 'var(--color-ivory)' }}>
            Qu<span style={{ color: 'var(--color-primary)' }}>Roots</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 -mr-1.5 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            if ('type' in item && item.type === 'divider') {
              return <div key={`div-${idx}`} className="h-px my-3 mx-2" style={{ background: 'var(--color-nav-border)' }} />;
            }
            if ('type' in item && item.type === 'section') {
              return (
                <div key={`sec-${idx}`} className="px-3.5 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--color-nav-inactive)' }}>
                  {item.label}
                </div>
              );
            }
            const navItem = item as { href: string; label: string; icon: any; requiresAuth?: boolean; requiresAdmin?: boolean; badge?: string };
            if (navItem.requiresAuth && !user) return null;
            if (navItem.requiresAdmin && user?.role !== 'admin') return null;

            const isActive = pathname.startsWith(navItem.href);
            return (
              <Link
                key={navItem.href}
                href={navItem.href}
                aria-current={isActive ? 'page' : undefined}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm transition-colors duration-200"
                style={{
                  background: isActive ? 'rgba(212,162,70,0.12)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                <navItem.icon className="w-[19px] h-[19px] flex-shrink-0" />
                <span>{navItem.label}</span>
                {navItem.badge && (
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212,162,70,0.15)', color: 'var(--color-primary)' }}>
                    {navItem.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Auth */}
        <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid var(--color-nav-border)' }}>
          {isLoading ? (
            <div className="h-11 rounded-xl bg-border-light animate-pulse" />
          ) : user ? (
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(212,162,70,0.08)' }}
            >
              <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-primary uppercase">{user.name?.[0] || user.email[0]}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text truncate">{user.name || user.email.split('@')[0]}</p>
                <p className="text-[10px] text-text-tertiary">Profile & Rewards</p>
              </div>
            </Link>
          ) : (
            <button
              onClick={() => { setOpen(false); setShowLoginModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-light hover:bg-primary/15 text-primary text-sm font-semibold transition-all duration-150"
            >
              Sign in
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
