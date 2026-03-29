'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/useAuthStore';

const NAV = [
  { href: '/learn/path',  label: 'Arabic', icon: LearnIcon  },
  { href: '/learn/qirat', label: 'Qirat',  icon: QiratIcon  },
  { href: '/quran',       label: 'Quran',  icon: BookIcon   },
  { href: '/roots',       label: 'Roots',  icon: RootIcon   },
  { href: '/search',      label: 'Search', icon: SearchIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoading, setShowLoginModal } = useAuthStore();

  const allItems = [
    ...NAV,
    user
      ? { href: '/profile', label: 'You',    icon: ProfileIcon }
      : null,
  ].filter(Boolean) as typeof NAV;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-end justify-center pb-[calc(env(safe-area-inset-bottom)+8px)] px-4"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="flex items-center justify-around w-full max-w-sm rounded-2xl px-2 h-[60px]"
        style={{
          background: 'rgba(20,19,18,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05) inset',
          pointerEvents: 'auto',
        }}
      >
        {allItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-[3px] w-12 h-12 rounded-xl transition-all duration-200 active:scale-90 interactive"
              style={{
                background: isActive ? 'rgba(212,162,70,0.12)' : 'transparent',
                color: isActive ? '#D4A246' : '#57534E',
              }}
            >
              {isActive && (
                <span
                  className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: '#D4A246', boxShadow: '0 0 6px rgba(212,162,70,0.8)' }}
                />
              )}
              <item.icon
                className={cn('w-[18px] h-[18px] transition-all duration-200', isActive ? 'scale-110' : '')}
              />
              <span className={cn('text-[9px] tracking-wide font-medium leading-none', isActive ? 'font-bold' : '')}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Sign-in if no user */}
        {!isLoading && !user && (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex flex-col items-center justify-center gap-[3px] w-12 h-12 rounded-xl transition-all active:scale-90 interactive"
            style={{ color: '#57534E' }}
          >
            <UserIcon className="w-[18px] h-[18px]" />
            <span className="text-[9px] font-medium leading-none">Sign in</span>
          </button>
        )}
      </div>
    </nav>
  );
}

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}
function UserIcon({ className }: { className?: string }) {
  return <ProfileIcon className={className} />;
}
function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}
function RootIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}
function QiratIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.103A2.25 2.25 0 0 0 17.77 2.03l-4.046 1.157A2.25 2.25 0 0 0 12.12 5.35v6.2a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 12.12 7.8V5.35" />
    </svg>
  );
}
function LearnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  );
}
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}
