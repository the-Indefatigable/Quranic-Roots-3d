'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ChatStats {
  totalMessages: number;
  totalParticipants: number;
  messages24h: number;
  recentParticipants: { name: string; image: string | null }[];
}

// Merchandises the community room on the homepage with live social proof.
// Numbers come from /api/chat/stats (aggregates only, 60s cached) so the
// strip automatically reflects new members as they join.
export function CommunityStrip() {
  const [stats, setStats] = useState<ChatStats | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/chat/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (active && d) setStats(d); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const participants = stats?.recentParticipants ?? [];
  const hasActivity = (stats?.totalParticipants ?? 0) > 0;

  return (
    <section className="px-5 pt-4 pb-16 max-w-5xl mx-auto" data-reveal-group>
      <Link
        href="/community"
        className="reveal group relative flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl px-6 py-5 sm:px-8 sm:py-6 overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, rgba(212,162,70,0.10) 0%, rgba(255,255,255,0.03) 55%)',
          border: '1px solid rgba(212,162,70,0.25)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.35)',
          '--reveal-delay': '0s',
        } as React.CSSProperties}
      >
        {/* Live badge + copy */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span
                className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
                style={{ background: '#5FB57A' }}
              />
              <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: '#5FB57A' }} />
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: '#D4A246' }}
            >
              New · Community is live
            </span>
          </div>

          <h3 className="font-heading text-xl sm:text-2xl" style={{ color: '#F0E8D8', letterSpacing: '-0.01em' }}>
            The Learners&rsquo; Lounge is open
          </h3>

          <p className="text-sm" style={{ color: '#8A8783' }}>
            {hasActivity ? (
              <>
                {stats!.totalParticipants} {stats!.totalParticipants === 1 ? 'learner has' : 'learners have'} joined the
                conversation{stats!.messages24h > 0 ? ` — ${stats!.messages24h} messages today` : ''}. Come say salaam.
              </>
            ) : (
              <>Meet others learning Quranic Arabic — ask questions, share progress, study together. Be among the first to say salaam.</>
            )}
          </p>
        </div>

        {/* Avatars + CTA */}
        <div className="flex items-center gap-4 shrink-0">
          {participants.length > 0 && (
            <div className="flex -space-x-2.5">
              {participants.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  title={p.name}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase overflow-hidden"
                  style={{
                    background: 'rgba(212,162,70,0.18)',
                    color: '#D4A246',
                    border: '2px solid #1a1917',
                  }}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    p.name[0]
                  )}
                </div>
              ))}
            </div>
          )}

          <span
            className="flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap transition-all duration-200 group-hover:gap-2.5"
            style={{ color: '#D4A246' }}
          >
            Join the conversation
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </Link>
    </section>
  );
}
