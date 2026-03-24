'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, setShowLoginModal } = useAuthStore();
  const { bookmarks } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white/30" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <p className="text-white/50 mb-4">Sign in to track your progress</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2.5 bg-gold/15 text-gold rounded-xl text-sm font-semibold hover:bg-gold/20 transition-colors"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  const links = [
    {
      href: '/bookmarks',
      label: 'Bookmarks',
      desc: `${bookmarks.length} saved items`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
      ),
    },
    {
      href: '/review',
      label: 'Flashcard Review',
      desc: 'Study your saved items',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
        </svg>
      ),
    },
    {
      href: '/rewards',
      label: 'Rewards & Achievements',
      desc: 'XP, levels, leaderboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 13.125 10.875h-2.25A3.375 3.375 0 0 0 7.5 14.25v4.5m9-9V6.375a3.375 3.375 0 0 0-3.375-3.375h-2.25A3.375 3.375 0 0 0 7.5 6.375v2.625" />
        </svg>
      ),
    },
    {
      href: '/search',
      label: 'Ayah Search',
      desc: 'Search Quran by text',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="py-6 px-1">
      {/* User header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
          {user.image ? (
            <img src={user.image} alt="" className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <span className="text-xl font-bold text-gold uppercase">
              {user.name?.[0] || user.email[0]}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-white truncate">
            {user.name || user.email.split('@')[0]}
          </p>
          <p className="text-xs text-white/30 truncate">{user.email}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 px-4 py-4 bg-card border border-white/[0.08] rounded-2xl hover:border-white/[0.12] hover:bg-elevated transition-colors"
          >
            <div className="text-white/40">{link.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{link.label}</p>
              <p className="text-xs text-white/35">{link.desc}</p>
            </div>
            <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Sign out */}
      <button
        onClick={() => { logout(); router.push('/'); }}
        className="w-full mt-8 py-3 text-sm text-white/30 hover:text-white/50 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
