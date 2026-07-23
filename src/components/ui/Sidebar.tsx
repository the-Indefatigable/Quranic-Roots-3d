'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/useAuthStore';
import { navItems, UserIcon } from './navItems';

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading, setShowLoginModal, logout } = useAuthStore();

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-40"
      style={{
        background: 'var(--color-nav-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--color-nav-border)',
      }}
    >

      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2.5 px-5 h-16"
        style={{ borderBottom: '1px solid var(--color-nav-border)' }}
      >
        <Image src="/logo.png" alt="QuRoots" width={32} height={32} className="object-contain" />
        <span className="text-lg font-heading tracking-tight" style={{ color: 'var(--color-ivory)' }}>
          Qu<span style={{ color: 'var(--color-primary)' }}>Roots</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          if ('type' in item && item.type === 'divider') {
            return <div key={`div-${idx}`} className="h-px my-3 mx-2" style={{ background: 'var(--color-nav-border)' }} />;
          }

          if ('type' in item && item.type === 'section') {
            return (
              <div
                key={`sec-${idx}`}
                className="px-3.5 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'var(--color-nav-inactive)' }}
              >
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
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors duration-200"
              style={{
                background: isActive ? 'rgba(212,162,70,0.12)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <navItem.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{navItem.label}</span>
              {navItem.badge && (
                <span
                  className="ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(212,162,70,0.15)', color: 'var(--color-primary)' }}
                >
                  {navItem.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Auth section */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-nav-border)' }}>
        {isLoading ? (
          <div className="h-9 rounded-xl bg-border-light animate-pulse" />
        ) : user ? (
          <Link
            href="/profile"
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150',
              pathname.startsWith('/profile') || pathname.startsWith('/rewards')
                ? 'bg-primary-light text-primary'
                : 'hover:bg-canvas'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary uppercase">
                {user.name?.[0] || user.email[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text truncate">
                {user.name || user.email.split('@')[0]}
              </p>
              <p className="text-[10px] text-text-tertiary">Profile & Rewards</p>
            </div>
          </Link>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-light hover:bg-primary/15 text-primary text-xs font-semibold transition-all duration-150"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Sign in
          </button>
        )}
      </div>
    </aside>
  );
}
