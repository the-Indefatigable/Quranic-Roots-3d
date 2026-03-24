'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { href: '/quran',     label: 'Quran',     icon: BookIcon },
  { href: '/roots',     label: 'Roots',     icon: RootIcon },
  { href: '/learn',     label: 'Learn',     icon: LearnIcon },
  { href: '/search',    label: 'Search',    icon: SearchIcon },
  { type: 'divider' as const },
  { href: '/quiz',      label: 'Quiz',      icon: QuizIcon, requiresAuth: true },
  { href: '/review',    label: 'Review',    icon: ReviewIcon, requiresAuth: true },
  { href: '/bookmarks', label: 'Bookmarks', icon: BookmarkIcon, requiresAuth: true },
  { href: '/rewards',   label: 'Rewards',   icon: TrophyIcon, requiresAuth: true },
  { type: 'divider' as const },
  { href: '/admin',     label: 'Admin',     icon: AdminIcon, requiresAdmin: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading, setShowLoginModal, logout } = useAuthStore();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 glass-strong z-40 border-r border-white/[0.05]">

      {/* Logo */}
      <Link href="/" className="flex items-center px-6 h-16 border-b border-white/[0.05]">
        <span className="text-lg font-bold tracking-tight text-white">
          Qu<span className="text-gold">Roots</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item, idx) => {
          if ('type' in item && item.type === 'divider') {
            return <div key={`div-${idx}`} className="h-px bg-white/[0.05] my-3 mx-2" />;
          }

          const navItem = item as { href: string; label: string; icon: any; requiresAuth?: boolean; requiresAdmin?: boolean };
          if (navItem.requiresAuth && !user) return null;
          if (navItem.requiresAdmin && user?.role !== 'admin') return null;

          const isActive = pathname.startsWith(navItem.href);
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={cn(
                'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gold/[0.1] text-gold'
                  : 'text-white/38 hover:text-white/80 hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-[3px] bg-gold rounded-r-full shadow-[0_0_8px_rgba(232,184,109,0.6)]" />
              )}
              <navItem.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-gold' : 'text-white/35')} />
              <span>{navItem.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold soft-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Auth section */}
      <div className="px-4 py-4 border-t border-white/[0.05]">
        {isLoading ? (
          <div className="h-9 rounded-xl bg-white/[0.03] animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-gold uppercase">
                {user.name?.[0] || user.email[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white/70 truncate">
                {user.name || user.email.split('@')[0]}
              </p>
              <button
                onClick={() => logout()}
                className="text-[10px] font-medium text-white/25 hover:text-white/50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/15 text-gold text-xs font-semibold transition-all duration-150"
          >
            <UserIcon className="w-3.5 h-3.5" />
            Sign in
          </button>
        )}
      </div>
    </aside>
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

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
    </svg>
  );
}
