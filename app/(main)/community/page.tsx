'use client';

import Link from 'next/link';
import { ChatRoom } from '@/components/community/ChatRoom';
import { CommunityTabs } from '@/components/community/CommunityTabs';

const GUIDELINES = [
  'Say salaam, and say where you are in your learning.',
  'Ask anything about a word, a root or an ayah. No question is too small.',
  'Be kind and patient. Everyone here is a student.',
];

export default function CommunityPage() {
  return (
    <div>
      <CommunityTabs />
      <header className="mb-8 max-w-2xl">
        <h1 className="font-heading text-[36px] sm:text-[42px] leading-tight mb-2" style={{ color: 'var(--color-ivory)' }}>Learners&rsquo; Lounge</h1>
        <p className="text-[16px] text-text-secondary">Study the language of the Quran with people learning it too.</p>
      </header>

      <div className="grid gap-6 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_300px] items-start">
        <ChatRoom
          room="general"
          empty={{ title: 'Say salaam', body: 'Introduce yourself and say what you are learning. Someone will answer.' }}
          placeholder="Write a message (Enter to send)"
        />

        <aside className="space-y-5">
          <section className="rounded-3xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-text-tertiary mb-4">How we talk here</h2>
            <ul className="space-y-3">
              {GUIDELINES.map((g) => <li key={g} className="text-[15px] leading-relaxed text-text-secondary">{g}</li>)}
            </ul>
          </section>
          <section className="rounded-3xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-text-tertiary mb-2">Talk about a lesson</h2>
            <p className="text-[15px] text-text-secondary mb-4">Every day of the salah path has its own discussion at the end of the lesson.</p>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => (
                <Link key={d} href={`/salah/${d}#discuss`} className="h-10 grid place-items-center rounded-xl text-[14px] font-medium text-text-secondary hover:text-text" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {d}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
