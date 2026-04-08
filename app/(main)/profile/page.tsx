'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/cn';

const grammarArticles = [
  { href: '/blog/irab', title: "I'rab — Case Endings", arabic: 'الإعراب', level: 'Essential' },
  { href: '/blog/mufrad-muthanna-jam', title: 'Singular, Dual & Plural', arabic: 'مفرد · مثنى · جمع', level: 'Essential' },
  { href: '/blog/murakkab', title: 'Compound Phrases', arabic: 'المركّب', level: 'Intermediate' },
  { href: '/blog/adad', title: 'Numbers in Arabic', arabic: 'العدد', level: 'Intermediate' },
  { href: '/blog/verb-forms', title: 'The 10 Verb Forms', arabic: 'أوزان الفعل', level: 'Advanced' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout, setShowLoginModal } = useAuthStore();
  const { bookmarks } = useAppStore();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 rounded-full bg-surface shadow-card flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-text-tertiary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h2 className="text-lg font-heading text-text mb-2">Sign in to track progress</h2>
          <p className="text-sm text-text-secondary mb-6">Your streaks, XP, achievements, and bookmarks all live here.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="btn-primary"
          >
            Sign in
          </button>
        </motion.div>
      </div>
    );
  }

  const quickLinks = [
    {
      href: '/quiz',
      label: 'Adaptive Quiz',
      desc: 'Test your vocabulary knowledge',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: 'text-primary',
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
      accent: 'text-accent',
    },
    {
      href: '/bookmarks',
      label: 'Bookmarks',
      desc: `${bookmarks.length} saved items`,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
      ),
      accent: 'text-info',
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
      accent: 'text-correct',
    },
  ];

  return (
    <div className="py-6 space-y-8 max-w-2xl mx-auto">
      {/* User header */}
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center shrink-0">
          {user.image ? (
            <img src={user.image} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <span className="text-2xl font-bold text-primary uppercase">
              {user.name?.[0] || user.email[0]}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-heading truncate" style={{ color: '#F0E4CA' }}>
            {user.name || user.email.split('@')[0]}
          </h1>
          <p className="text-sm text-text-tertiary truncate">{user.email}</p>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3 px-1">Your Progress</h2>
        <div className="space-y-2">
          {quickLinks.map((link, idx) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.06, duration: 0.3 }}
            >
              <Link
                href={link.href}
                className="flex items-center gap-4 px-5 py-4 bg-surface rounded-2xl shadow-card hover:shadow-raised hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={link.accent}>{link.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">{link.label}</p>
                  <p className="text-xs text-text-tertiary">{link.desc}</p>
                </div>
                <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Grammar Articles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3 px-1">Grammar Articles</h2>
        <div className="bg-surface rounded-2xl shadow-card overflow-hidden divide-y divide-border-light">
          {grammarArticles.map((article) => (
            <Link
              key={article.href}
              href={article.href}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-canvas transition-colors"
            >
              <span className="text-lg font-arabic text-primary leading-none w-16 text-center shrink-0">
                {article.arabic}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text">{article.title}</p>
              </div>
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0',
                article.level === 'Essential' ? 'bg-correct/10 text-correct'
                  : article.level === 'Intermediate' ? 'bg-accent/10 text-accent'
                  : 'bg-info/10 text-info'
              )}>
                {article.level}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="w-full py-3 text-sm text-text-tertiary hover:text-wrong transition-colors rounded-xl"
        >
          Sign out
        </button>
      </motion.div>
    </div>
  );
}
