'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/quran',     label: 'Quran',    icon: BookIcon },
  { href: '/roots',     label: 'Roots',    icon: RootIcon },
  { href: '/learn',     label: 'Learn',    icon: LearnIcon },
  { href: '/search',    label: 'Search',   icon: SearchIcon },
  { href: '/review',    label: 'Review',   icon: ReviewIcon },
  { href: '/quiz',      label: 'Quiz',     icon: QuizIcon, requiresAuth: true },
  { href: '/rewards',   label: 'Rewards',  icon: TrophyIcon, requiresAuth: true },
  { href: '/bookmarks', label: 'Saved',    icon: BookmarkIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoading, setShowLoginModal } = useAuthStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/[0.06] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[58px]">
        {navItems.map((item) => {
          // Hide auth-required items if user not logged in
          if ((item as any).requiresAuth && !user) return null;

          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-[3px] px-3 py-1 transition-all duration-200 active:scale-95',
                isActive ? 'text-gold' : 'text-white/28'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-b-full bg-gold shadow-[0_0_8px_rgba(232,184,109,0.8)]" />
              )}
              <item.icon
                className={cn(
                  'w-[19px] h-[19px] transition-all duration-200',
                  isActive ? 'text-gold scale-110' : 'text-white/30'
                )}
              />
              <span
                className={cn(
                  'text-[9.5px] tracking-wide transition-all duration-200',
                  isActive ? 'font-bold text-gold' : 'font-medium text-white/28'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile / Sign in — 6th item */}
        {!isLoading && (
          user ? (
            <div className="flex flex-col items-center justify-center gap-[3px] px-3 py-1">
              <div className="w-[19px] h-[19px] rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-[8px] font-bold text-gold uppercase leading-none">
                  {user.name?.[0] || user.email[0]}
                </span>
              </div>
              <span className="text-[9.5px] font-medium text-white/28 tracking-wide">You</span>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex flex-col items-center justify-center gap-[3px] px-3 py-1 text-white/28 active:scale-95 transition-all"
            >
              <UserIcon className="w-[19px] h-[19px]" />
              <span className="text-[9.5px] font-medium tracking-wide">Sign in</span>
            </button>
          )
        )}
      </div>
    </nav>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
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

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
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

function ReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
    </svg>
  );
}

function QuizIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 9v-2.25m6.364-6.364l1.591 1.591M9 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
