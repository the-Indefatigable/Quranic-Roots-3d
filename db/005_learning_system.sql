-- 005: Duolingo-style Learning System
-- Learning path, lessons, vocabulary, hearts, gems, streaks, leagues, quests

-- ── Learning Units ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  icon_emoji TEXT DEFAULT '📖',
  color TEXT DEFAULT '#58CC02',
  sort_order INTEGER NOT NULL,
  checkpoint_after BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS learning_units_sort_idx ON learning_units (sort_order);

-- ── Learning Lessons ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES learning_units(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  lesson_type TEXT DEFAULT 'standard', -- 'standard' | 'legendary' | 'checkpoint'
  content JSONB NOT NULL,
  xp_reward INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, slug)
);
CREATE INDEX IF NOT EXISTS learning_lessons_unit_sort_idx ON learning_lessons (unit_id, sort_order);

-- ── Vocabulary Bank ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vocabulary_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_ar TEXT NOT NULL,
  transliteration TEXT NOT NULL,
  english TEXT NOT NULL,
  word_type TEXT NOT NULL, -- 'ism' | 'feel' | 'harf'
  gender TEXT,
  number TEXT,
  grammar_case TEXT,
  unit_id UUID REFERENCES learning_units(id),
  quranic_ref TEXT,
  difficulty SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vocabulary_bank_unit_idx ON vocabulary_bank (unit_id);
CREATE INDEX IF NOT EXISTS vocabulary_bank_type_idx ON vocabulary_bank (word_type);

-- ── User Lesson Progress ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'locked',
  score INTEGER,
  best_score INTEGER,
  attempts INTEGER DEFAULT 0,
  mistakes JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS user_lesson_progress_user_idx ON user_lesson_progress (user_id);
CREATE INDEX IF NOT EXISTS user_lesson_progress_status_idx ON user_lesson_progress (user_id, status);

-- ── User Unit Progress ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_unit_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES learning_units(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'locked',
  crown_level SMALLINT DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);
CREATE INDEX IF NOT EXISTS user_unit_progress_user_idx ON user_unit_progress (user_id);

-- ── User Hearts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_hearts (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  hearts SMALLINT NOT NULL DEFAULT 5,
  max_hearts SMALLINT NOT NULL DEFAULT 5,
  last_refill_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Streaks ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  streak_freezes_owned SMALLINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── User Gems ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_gems (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Gem Transactions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gem_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS gem_transactions_user_idx ON gem_transactions (user_id);
CREATE INDEX IF NOT EXISTS gem_transactions_created_idx ON gem_transactions (user_id, created_at);

-- ── Daily Goals ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  target_xp INTEGER NOT NULL DEFAULT 30,
  earned_xp INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, goal_date)
);
CREATE INDEX IF NOT EXISTS daily_goals_user_idx ON daily_goals (user_id);

-- ── Daily Quests ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quest_date DATE NOT NULL,
  quest_type TEXT NOT NULL,
  title TEXT NOT NULL,
  target INTEGER NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  gem_reward INTEGER NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS daily_quests_user_date_idx ON daily_quests (user_id, quest_date);

-- ── Weekly Leagues ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weekly_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  tier SMALLINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS weekly_leagues_week_tier_idx ON weekly_leagues (week_start, tier);

-- ── League Members ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES weekly_leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekly_xp INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  promoted BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);
CREATE INDEX IF NOT EXISTS league_members_league_xp_idx ON league_members (league_id, weekly_xp);

-- ── Checkpoint Tests ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checkpoint_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  after_unit_id UUID NOT NULL REFERENCES learning_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  passing_score SMALLINT NOT NULL DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(after_unit_id)
);
