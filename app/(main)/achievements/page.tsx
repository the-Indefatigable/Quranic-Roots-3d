import { sql } from 'drizzle-orm';
import { db, dbQuery } from '@/db';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Public badge gallery — every achievement, how many learners have earned it,
// and (when signed in) which ones you hold.

interface Badge {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xp_bonus: number | null;
  earned_count: number;
  mine: boolean;
}

const CATEGORY: Record<string, { path: string; label: string }> = {
  milestone: { label: 'Milestones', path: 'M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 13.125 10.875h-2.25A3.375 3.375 0 0 0 7.5 14.25v4.5m9-9V6.375a3.375 3.375 0 0 0-3.375-3.375h-2.25A3.375 3.375 0 0 0 7.5 6.375v2.625' },
  mastery: { label: 'Mastery', path: 'M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' },
  streak: { label: 'Streaks', path: 'M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z' },
  speed: { label: 'Speed', path: 'm3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z' },
};

const FALLBACK_PATH = 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z';

export default async function AchievementsPage() {
  const session = await auth().catch(() => null);
  const meId = session?.user?.id ?? '00000000-0000-0000-0000-000000000000';

  const rows = (await dbQuery(() =>
    db.execute(sql`
      SELECT a.id, a.title, a.description, a.category, a.xp_bonus,
        (SELECT count(*)::int FROM user_achievements ua WHERE ua.achievement_id = a.id) AS earned_count,
        EXISTS (SELECT 1 FROM user_achievements ua WHERE ua.achievement_id = a.id AND ua.user_id = ${meId}) AS mine
      FROM achievements a
      ORDER BY a.category, a.xp_bonus NULLS LAST
    `)
  )) as unknown as Badge[];

  const myCount = rows.filter((r) => r.mine).length;
  const byCat = rows.reduce<Record<string, Badge[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-primary)' }}>Community</div>
        <h1 className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]" style={{ color: 'var(--color-ivory)' }}>Badges</h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xl">
          {session?.user?.id
            ? `You've earned ${myCount} of ${rows.length} badges. Keep learning to collect them all.`
            : `${rows.length} badges to earn. Sign in and start learning to collect them.`}
        </p>
      </div>

      <div className="space-y-8">
        {Object.entries(byCat).map(([cat, badges]) => {
          const meta = CATEGORY[cat] ?? { path: FALLBACK_PATH, label: cat };
          return (
            <section key={cat}>
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary mb-3">
                <svg className="w-4 h-4" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={meta.path} />
                </svg>
                {meta.label}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border p-4 flex items-start gap-3 transition-opacity"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: b.mine ? 'var(--color-primary)' : 'var(--color-border)',
                      opacity: b.mine ? 1 : 0.72,
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: b.mine ? 'rgba(212,162,70,0.14)' : 'var(--color-canvas)', color: b.mine ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={meta.path} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text truncate">{b.title}</p>
                        {b.mine && <span className="text-[10px] font-bold uppercase text-primary">✓ earned</span>}
                      </div>
                      {b.description && <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{b.description}</p>}
                      <p className="text-[11px] text-text-tertiary mt-1.5">
                        {b.xp_bonus ? `+${b.xp_bonus} XP · ` : ''}{b.earned_count} {b.earned_count === 1 ? 'learner has' : 'learners have'} this
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
