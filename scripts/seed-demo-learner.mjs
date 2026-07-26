/**
 * Seed a demo learner for marketing screenshots.
 *
 * Creates one user with realistic progress (streak, XP, gems, hearts,
 * completed lessons, unlocked badges) plus a NextAuth database session whose
 * token is printed on stdout — the capture harness sets that as the
 * `authjs.session-token` cookie to browse as a signed-in user without OAuth.
 *
 * LOCAL DEMO ONLY. Never run this against production.
 *
 * Run: DATABASE_URL=... node scripts/seed-demo-learner.mjs
 */
import postgres from 'postgres';
import { randomUUID } from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL required');
  process.exit(1);
}
if (/quroots\.com|neon\.tech|supabase|amazonaws/.test(DATABASE_URL)) {
  console.error('ERROR: refusing to run against what looks like a remote database');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

const DEMO_EMAIL = 'demo@quroots.com';
const SESSION_TOKEN = process.env.DEMO_SESSION_TOKEN || randomUUID();

// How far through the 50-unit path the demo learner is. Chosen so the path
// screenshot shows a mix of completed, current and locked units.
const COMPLETED_UNITS = 6;
const TOTAL_XP = 2480;
const STREAK = 17;

async function seed() {
  console.log('Seeding demo learner...\n');

  const [user] = await sql`
    INSERT INTO users (email, name, role, preferred_lang, streak_days, last_active,
                       total_xp, user_level, level_progress, email_verified)
    VALUES (${DEMO_EMAIL}, 'Aisha Rahman', 'student', 'en', ${STREAK}, CURRENT_DATE,
            ${TOTAL_XP}, 8, 62, NOW())
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name, streak_days = EXCLUDED.streak_days,
      total_xp = EXCLUDED.total_xp, user_level = EXCLUDED.user_level,
      level_progress = EXCLUDED.level_progress, last_active = CURRENT_DATE
    RETURNING id
  `;
  const userId = user.id;
  console.log(`user            ${userId}`);

  await sql`DELETE FROM "session" WHERE "userId" = ${userId}`;
  await sql`
    INSERT INTO "session" ("sessionToken", "userId", expires)
    VALUES (${SESSION_TOKEN}, ${userId}, NOW() + INTERVAL '30 days')
  `;

  await sql`
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date, streak_freezes_owned)
    VALUES (${userId}, ${STREAK}, 23, CURRENT_DATE, 2)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = EXCLUDED.current_streak, longest_streak = EXCLUDED.longest_streak,
      last_active_date = CURRENT_DATE, streak_freezes_owned = EXCLUDED.streak_freezes_owned
  `;

  await sql`
    INSERT INTO user_hearts (user_id, hearts, max_hearts, last_refill_at)
    VALUES (${userId}, 4, 5, NOW())
    ON CONFLICT (user_id) DO UPDATE SET hearts = EXCLUDED.hearts, max_hearts = EXCLUDED.max_hearts
  `;

  await sql`
    INSERT INTO user_gems (user_id, balance, total_earned)
    VALUES (${userId}, 340, 890)
    ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance, total_earned = EXCLUDED.total_earned
  `;
  console.log(`streak ${STREAK}d · ${TOTAL_XP} XP · 340 gems · 4/5 hearts`);

  // ── Lesson + unit progress ────────────────────────────────────────────
  const units = await sql`SELECT id FROM learning_units ORDER BY sort_order ASC`;
  const done = units.slice(0, COMPLETED_UNITS);
  const current = units[COMPLETED_UNITS];

  await sql`DELETE FROM user_unit_progress WHERE user_id = ${userId}`;
  await sql`DELETE FROM user_lesson_progress WHERE user_id = ${userId}`;

  for (const unit of done) {
    const lessons = await sql`SELECT id FROM learning_lessons WHERE unit_id = ${unit.id} ORDER BY sort_order ASC`;
    for (const lesson of lessons) {
      const score = 85 + Math.floor(Math.random() * 15);
      await sql`
        INSERT INTO user_lesson_progress (user_id, lesson_id, status, score, best_score, attempts, completed_at)
        VALUES (${userId}, ${lesson.id}, 'completed', ${score}, ${score}, 1, NOW() - INTERVAL '9 days')
      `;
    }
    await sql`
      INSERT INTO user_unit_progress (user_id, unit_id, status, crown_level, lessons_completed)
      VALUES (${userId}, ${unit.id}, 'completed', 2, ${lessons.length})
    `;
  }

  // Current unit: part-way through, so the path shows an in-progress node.
  if (current) {
    const lessons = await sql`SELECT id FROM learning_lessons WHERE unit_id = ${current.id} ORDER BY sort_order ASC`;
    const partial = Math.max(1, Math.floor(lessons.length / 2));
    for (let i = 0; i < partial; i++) {
      await sql`
        INSERT INTO user_lesson_progress (user_id, lesson_id, status, score, best_score, attempts, completed_at)
        VALUES (${userId}, ${lessons[i].id}, 'completed', 90, 90, 1, NOW() - INTERVAL '1 day')
      `;
    }
    await sql`
      INSERT INTO user_unit_progress (user_id, unit_id, status, crown_level, lessons_completed)
      VALUES (${userId}, ${current.id}, 'in_progress', 1, ${partial})
    `;
    console.log(`progress        ${COMPLETED_UNITS} units complete, 1 in progress`);
  }

  // ── Achievements ──────────────────────────────────────────────────────
  const badges = await sql`SELECT id FROM achievements ORDER BY created_at ASC LIMIT 5`;
  await sql`DELETE FROM user_achievements WHERE user_id = ${userId}`;
  for (const b of badges) {
    await sql`
      INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
      VALUES (${userId}, ${b.id}, NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`badges          ${badges.length} unlocked`);

  // ── Daily quests ──────────────────────────────────────────────────────
  await sql`DELETE FROM daily_quests WHERE user_id = ${userId} AND quest_date = CURRENT_DATE`;
  const quests = [
    ['xp', 'Earn 50 XP', 50, 35, 10],
    ['lessons', 'Complete 2 lessons', 2, 1, 15],
    ['review', 'Review 10 words', 10, 10, 10],
  ];
  for (const [type, title, target, progress, gems] of quests) {
    await sql`
      INSERT INTO daily_quests (user_id, quest_date, quest_type, title, target, progress, gem_reward, completed)
      VALUES (${userId}, CURRENT_DATE, ${type}, ${title}, ${target}, ${progress}, ${gems}, ${progress >= target})
    `;
  }
  console.log(`quests          ${quests.length} for today`);

  // Today's goal, part-way done — an empty ring reads as an inactive account.
  await sql`DELETE FROM daily_goals WHERE user_id = ${userId} AND goal_date = CURRENT_DATE`;
  await sql`
    INSERT INTO daily_goals (user_id, goal_date, target_xp, earned_xp, lessons_completed, completed)
    VALUES (${userId}, CURRENT_DATE, 30, 20, 1, false)
  `;
  console.log(`daily goal      20/30 XP`);

  // A few leaderboard peers so the leaderboard isn't a lonely single row.
  const peers = [
    ['yusuf.demo@quroots.com', 'Yusuf A.', 3120, 9],
    ['maryam.demo@quroots.com', 'Maryam S.', 2890, 9],
    ['ibrahim.demo@quroots.com', 'Ibrahim K.', 2210, 7],
    ['khadija.demo@quroots.com', 'Khadija N.', 1960, 7],
    ['bilal.demo@quroots.com', 'Bilal M.', 1740, 6],
  ];
  for (const [email, name, xp, level] of peers) {
    await sql`
      INSERT INTO users (email, name, role, total_xp, user_level, streak_days, last_active, email_verified)
      VALUES (${email}, ${name}, 'student', ${xp}, ${level}, ${5 + Math.floor(Math.random() * 20)}, CURRENT_DATE, NOW())
      ON CONFLICT (email) DO UPDATE SET total_xp = EXCLUDED.total_xp, user_level = EXCLUDED.user_level
    `;
  }
  console.log(`peers           ${peers.length} for the leaderboard`);

  console.log(`\nSESSION_TOKEN=${SESSION_TOKEN}`);
  await sql.end();
}

seed().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
