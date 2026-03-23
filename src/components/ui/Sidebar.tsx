'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/quran',     label: 'Quran',     icon: BookIcon },
  { href: '/roots',     label: 'Roots',     icon: RootIcon },
  { href: '/search',    label: 'Search',    icon: SearchIcon },
  { href: '/review',    label: 'Review',    icon: ReviewIcon },
  { href: '/bookmarks', label: 'Bookmarks', icon: BookmarkIcon },
];

export function Sidebar() {
  const pathname = usePathname();

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
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gold/[0.1] text-gold'
                  : 'text-white/38 hover:text-white/80 hover:bg-white/[0.04]'
              )}
            >
              {/* Active left bar */}
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-[3px] bg-gold rounded-r-full shadow-[0_0_8px_rgba(232,184,109,0.6)]" />
              )}
              <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive ? 'text-gold' : 'text-white/35')} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold soft-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.05]">
        <p className="text-[11px] font-medium text-white/18 tracking-wide">QuRoots v2.0</p>
      </div>
    </aside>
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
