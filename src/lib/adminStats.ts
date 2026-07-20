import { sql } from 'drizzle-orm';
import { db, dbQuery } from '@/db';

/** Format an ISO-ish date string / Date as "MMM D" (e.g. "Jul 20"). */
export function shortDate(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format a date as a relative "3d ago" / "today" label. */
export function relativeDay(d: string | Date | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export interface OverviewStats {
  totalUsers: number;
  new1d: number;
  new7d: number;
  new30d: number;
  digestSubs: number;
  active1d: number;
  active7d: number;
  active30d: number;
  lessonsCompleted: number;
  quizSessions: number;
  avgQuizScore: number;
  admins: number;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const [userRow] = await dbQuery(() =>
    db.execute(sql`
      SELECT
        count(*)::int AS total,
        count(*) FILTER (WHERE created_at >= now() - interval '1 day')::int  AS new1d,
        count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS new7d,
        count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS new30d,
        count(*) FILTER (WHERE digest_opt_in)::int AS digest,
        count(*) FILTER (WHERE role = 'admin')::int AS admins,
        count(*) FILTER (WHERE last_active >= current_date - interval '1 day')::int  AS active1d,
        count(*) FILTER (WHERE last_active >= current_date - interval '7 days')::int AS active7d,
        count(*) FILTER (WHERE last_active >= current_date - interval '30 days')::int AS active30d
      FROM users
    `)
  ) as any[];

  const [lessonRow] = await dbQuery(() =>
    db.execute(sql`SELECT count(*)::int AS c FROM user_lesson_progress WHERE status = 'completed'`)
  ) as any[];

  const [quizRow] = await dbQuery(() =>
    db.execute(sql`SELECT count(*)::int AS c, coalesce(round(avg(score)), 0)::int AS avg FROM quiz_sessions`)
  ) as any[];

  return {
    totalUsers: userRow?.total ?? 0,
    new1d: userRow?.new1d ?? 0,
    new7d: userRow?.new7d ?? 0,
    new30d: userRow?.new30d ?? 0,
    digestSubs: userRow?.digest ?? 0,
    admins: userRow?.admins ?? 0,
    active1d: userRow?.active1d ?? 0,
    active7d: userRow?.active7d ?? 0,
    active30d: userRow?.active30d ?? 0,
    lessonsCompleted: lessonRow?.c ?? 0,
    quizSessions: quizRow?.c ?? 0,
    avgQuizScore: quizRow?.avg ?? 0,
  };
}

/** Signups per day for the last N days, zero-filled. */
export async function getSignupSeries(days = 30): Promise<{ label: string; value: number }[]> {
  const rows = (await dbQuery(() =>
    db.execute(sql`
      SELECT (created_at AT TIME ZONE 'UTC')::date AS d, count(*)::int AS c
      FROM users
      WHERE created_at >= current_date - ${sql.raw(String(days - 1))} * interval '1 day'
      GROUP BY 1
    `)
  )) as any[];
  return zeroFill(rows, days);
}

/** Distinct active users per day for the last N days, from user_activity. */
export async function getDauSeries(days = 14): Promise<{ label: string; value: number }[]> {
  const rows = (await dbQuery(() =>
    db.execute(sql`
      SELECT activity_date AS d, count(DISTINCT user_id)::int AS c
      FROM user_activity
      WHERE activity_date >= current_date - ${sql.raw(String(days - 1))} * interval '1 day'
      GROUP BY 1
    `)
  )) as any[];
  return zeroFill(rows, days);
}

/** Turn sparse {d, c} rows into a dense, zero-filled day series ending today. */
function zeroFill(rows: any[], days: number): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const key = typeof r.d === 'string' ? r.d.slice(0, 10) : new Date(r.d).toISOString().slice(0, 10);
    map.set(key, Number(r.c));
  }
  const out: { label: string; value: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    out.push({ label: shortDate(day), value: map.get(key) ?? 0 });
  }
  return out;
}
