'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { DigestToggle } from '@/components/ui/DigestToggle';

const GOLD = '#D4A246';

const INSIDE = [
  { title: 'A verse to master', body: 'One ayah each week with its word-by-word meaning — small enough to actually learn.' },
  { title: 'The week’s new lessons', body: 'Fresh grammar units and content added to your path, so you never miss what’s new.' },
  { title: 'Your streak & progress', body: 'A gentle nudge with your XP and streak — the reminder that keeps the habit alive.' },
  { title: 'Community activity', body: 'What other learners are studying and discussing in the Learners’ Lounge.' },
];

export function DigestLearnMore() {
  const { user, setShowLoginModal } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Hero */}
      <section className="text-center pt-4 pb-8">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(212,162,70,0.14)', color: GOLD }}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: GOLD }}>One email, every Friday</p>
        <h1 className="font-heading text-3xl sm:text-4xl mb-3" style={{ color: '#F0E8D8' }}>The QuRoots Weekly Digest</h1>
        <p className="text-sm sm:text-base leading-relaxed max-w-lg mx-auto" style={{ color: '#A09F9B' }}>
          A single, unhurried email to keep the Quran in your week — a verse to learn, what’s new, and your own
          progress. No spam, no daily pings. Unsubscribe in one tap, anytime.
        </p>
      </section>

      {/* What's inside */}
      <section className="grid sm:grid-cols-2 gap-3 mb-8">
        {INSIDE.map((item) => (
          <div key={item.title} className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#F0E4CA' }}>{item.title}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{item.body}</p>
          </div>
        ))}
      </section>

      {/* Subscribe control */}
      <section>
        {user ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--color-text-tertiary)' }}>Your subscription</p>
            <DigestToggle />
          </>
        ) : (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(212,162,70,0.1), rgba(255,255,255,0.02))', border: '1px solid rgba(212,162,70,0.22)' }}>
            <p className="text-sm mb-4" style={{ color: '#D6CDBB' }}>Create a free account to subscribe — it takes a few seconds and you can turn the digest on right away.</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-block py-3 px-6 rounded-2xl text-sm font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #D4A246, #C89535)', color: '#0E0D0C' }}
            >
              Create free account
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
