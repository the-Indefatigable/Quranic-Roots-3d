import { sql } from 'drizzle-orm';
import { db, dbQuery } from '@/db';
import { auth } from '@/lib/auth';
import { LeaderboardTabs } from '@/components/gamification/LeaderboardTabs';
import { ShareButton } from '@/components/gamification/ShareButton';

export const dynamic = 'force-dynamic';

// Public leaderboard — visible to everyone, signed in or not. Shows how the
// whole community is doing, ranked by all-time XP or by current streak.

interface Row {
  id: string;
  name: string | null;
  image: string | null;
  total_xp: number;
  user_level: number;
  streak_days: number;
}

const MEDALS = ['🥇', '🥈', '🥉'];

function displayName(r: Row) {
  return (r.name || 'Anonymous').trim().split(' ')[0] || 'Anonymous';
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = searchParams.sort === 'streak' ? 'streak' : 'xp';
  const orderBy = sort === 'streak'
    ? sql`u.streak_days DESC NULLS LAST, u.total_xp DESC NULLS LAST`
    : sql`u.total_xp DESC NULLS LAST`;

  const [session, rows, statsRows] = await Promise.all([
    auth().catch(() => null),
    dbQuery(() =>
      db.execute(sql`
        SELECT u.id, u.name, u.image, u.total_xp, u.user_level, u.streak_days
        FROM users u
        WHERE COALESCE(u.total_xp, 0) > 0
        ORDER BY ${orderBy}
        LIMIT 100
      `)
    ) as Promise<unknown> as Promise<Row[]>,
    dbQuery(() =>
      db.execute(sql`
        SELECT
          (SELECT count(*) FROM users WHERE COALESCE(total_xp,0) > 0)::int AS learners,
          (SELECT count(*) FROM user_lesson_progress WHERE status = 'completed')::int AS lessons,
          (SELECT coalesce(sum(total_xp),0) FROM users)::int AS xp
      `)
    ) as Promise<any[]>,
  ]);

  const stats = statsRows[0] ?? { learners: 0, lessons: 0, xp: 0 };

  const meId = session?.user?.id ?? null;
  const myIndex = meId ? rows.findIndex((r) => r.id === meId) : -1;

  return (
    <div>
      <div className="mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-primary)' }}>
          Community
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]" style={{ color: 'var(--color-ivory)' }}>
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xl">
          See how every learner is doing. Earn XP by finishing lessons and keep your daily streak alive to climb.
        </p>
      </div>

      {/* Community momentum — social proof */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { n: stats.learners, label: 'learners' },
          { n: stats.lessons, label: 'lessons done' },
          { n: stats.xp, label: 'XP earned' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border p-3 text-center" style={{ background: 'var(--color-surface)' }}>
            <div className="text-xl font-heading" style={{ color: 'var(--color-primary)' }}>{s.n.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-tertiary">{s.label}</div>
          </div>
        ))}
      </div>

      <LeaderboardTabs active={sort} />

      {/* Your rank banner */}
      {meId && myIndex >= 0 && (
        <div
          className="rounded-2xl border p-4 mb-4 flex items-center gap-4"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-primary)' }}
        >
          <span className="text-2xl font-heading" style={{ color: 'var(--color-primary)' }}>
            #{myIndex + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text">You</p>
            <p className="text-xs text-text-tertiary">
              {sort === 'streak'
                ? `${rows[myIndex].streak_days ?? 0} day streak · ${(rows[myIndex].total_xp ?? 0).toLocaleString()} XP`
                : `${(rows[myIndex].total_xp ?? 0).toLocaleString()} XP · Level ${rows[myIndex].user_level ?? 1}`}
            </p>
          </div>
          <ShareButton
            text={`I'm #${myIndex + 1} on QuRoots with ${(rows[myIndex].total_xp ?? 0).toLocaleString()} XP learning Quranic Arabic! 📖`}
            label="Share rank"
          />
          {myIndex < 3 && <span className="text-2xl">{MEDALS[myIndex]}</span>}
        </div>
      )}
      {meId && myIndex < 0 && (
        <div className="rounded-2xl border border-border p-4 mb-4 text-sm text-text-secondary" style={{ background: 'var(--color-surface)' }}>
          You’re not on the board yet — finish a lesson to earn your first XP and appear here. 🌱
        </div>
      )}

      {/* The board */}
      <ol className="space-y-1.5">
        {rows.map((r, i) => {
          const isMe = r.id === meId;
          return (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 border"
              style={{
                background: isMe ? 'rgba(212,162,70,0.10)' : 'var(--color-surface)',
                borderColor: isMe ? 'var(--color-primary)' : 'var(--color-border-light)',
              }}
            >
              <span className="w-8 text-center font-semibold tabular-nums" style={{ color: i < 3 ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0 overflow-hidden">
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--color-primary)' }}>
                    {displayName(r)[0]}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {displayName(r)}
                  {isMe && <span className="ml-1.5 text-[10px] font-semibold uppercase text-primary">you</span>}
                </p>
                <p className="text-[11px] text-text-tertiary">Level {r.user_level ?? 1}</p>
              </div>
              {sort === 'streak' ? (
                <span className="text-sm font-semibold tabular-nums text-text-secondary whitespace-nowrap">
                  🔥 {r.streak_days ?? 0}
                </span>
              ) : (
                <span className="text-sm font-semibold tabular-nums whitespace-nowrap" style={{ color: 'var(--color-primary)' }}>
                  {(r.total_xp ?? 0).toLocaleString()} XP
                </span>
              )}
            </li>
          );
        })}
        {rows.length === 0 && (
          <li className="text-center py-12 text-text-tertiary text-sm">
            No one has earned XP yet — be the first! 🚀
          </li>
        )}
      </ol>
    </div>
  );
}
