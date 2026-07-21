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

const CATEGORY: Record<string, { emoji: string; label: string }> = {
  milestone: { emoji: '🏆', label: 'Milestones' },
  mastery: { emoji: '🌳', label: 'Mastery' },
  streak: { emoji: '🔥', label: 'Streaks' },
  speed: { emoji: '⚡', label: 'Speed' },
};

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
          const meta = CATEGORY[cat] ?? { emoji: '✨', label: cat };
          return (
            <section key={cat}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary mb-3">
                {meta.emoji} {meta.label}
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
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: b.mine ? 'rgba(212,162,70,0.14)' : 'var(--color-canvas)', filter: b.mine ? 'none' : 'grayscale(0.6)' }}
                    >
                      {meta.emoji}
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
