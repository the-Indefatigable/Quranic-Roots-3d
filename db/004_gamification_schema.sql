-- Migration 004: Add gamification system (achievements, levels, leaderboards)

-- ════════════════════════════════════════════════════════
-- 1. ALTER USERS TABLE - Add gamification fields
-- ════════════════════════════════════════════════════════

ALTER TABLE users
ADD COLUMN IF NOT EXISTS total_xp INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS user_level INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS level_progress INT DEFAULT 0;

-- ════════════════════════════════════════════════════════
-- 2. ACHIEVEMENTS TABLE - Predefined achievements
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('milestone', 'mastery', 'streak', 'speed')),
  icon_svg TEXT,
  xp_bonus INT DEFAULT 0,
  unlock_criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS achievements_category_idx ON achievements(category);

-- ════════════════════════════════════════════════════════
-- 3. USER ACHIEVEMENTS TABLE - Tracks unlocked achievements
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_achievements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS user_achievements_user_id_idx ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS user_achievements_unlocked_idx ON user_achievements(user_id, unlocked_at DESC);

-- ════════════════════════════════════════════════════════
-- 4. LEADERBOARD SNAPSHOTS TABLE - Historical leaderboard data
-- ════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rank INT NOT NULL,
  total_xp INT NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('all_time', 'weekly', 'monthly')),
  period_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS leaderboard_snapshots_user_idx ON leaderboard_snapshots(user_id);
CREATE INDEX IF NOT EXISTS leaderboard_snapshots_period_idx ON leaderboard_snapshots(period, period_date, rank);
CREATE INDEX IF NOT EXISTS leaderboard_snapshots_rank_idx ON leaderboard_snapshots(period, period_date, total_xp DESC);

-- ════════════════════════════════════════════════════════
-- 5. INSERT PREDEFINED ACHIEVEMENTS
-- ════════════════════════════════════════════════════════

INSERT INTO achievements (title, description, category, xp_bonus, unlock_criteria) VALUES
-- MILESTONE achievements
('First Steps', 'Earn your first 10 XP', 'milestone', 0, '{"type": "xp_earned", "value": 10}'),
('Century Club', 'Earn 100 XP total', 'milestone', 10, '{"type": "xp_earned", "value": 100}'),
('Brilliant Mind', 'Earn 500 XP total', 'milestone', 25, '{"type": "xp_earned", "value": 500}'),
('Master Learner', 'Earn 1000 XP total', 'milestone', 50, '{"type": "xp_earned", "value": 1000}'),

-- MASTERY achievements
('Root Explorer', 'Master 5 roots to level 1+', 'mastery', 25, '{"type": "roots_mastered", "value": 5}'),
('Root Master', 'Master 25 roots to level 1+', 'mastery', 75, '{"type": "roots_mastered", "value": 25}'),
('Verb Virtuoso', 'Master 50 roots to level 1+', 'mastery', 150, '{"type": "roots_mastered", "value": 50}'),
('Word Warrior', 'Master 50 nouns to level 1+', 'mastery', 100, '{"type": "nouns_mastered", "value": 50}'),
('Grammar Guardian', 'Master 25 particles to level 1+', 'mastery', 75, '{"type": "particles_mastered", "value": 25}'),

-- STREAK achievements
('On Fire', 'Maintain a 3-day streak', 'streak', 10, '{"type": "streak_days", "value": 3}'),
('Unstoppable', 'Maintain a 7-day streak', 'streak', 25, '{"type": "streak_days", "value": 7}'),
('Legend Status', 'Maintain a 30-day streak', 'streak', 100, '{"type": "streak_days", "value": 30}'),

-- SPEED achievements
('Quick Learner', 'Answer 5 questions correctly averaging <3s each', 'speed', 15, '{"type": "avg_response_time", "count": 5, "max_time_ms": 3000}'),
('Lightning Fast', 'Answer 10 questions correctly averaging <2s each', 'speed', 30, '{"type": "avg_response_time", "count": 10, "max_time_ms": 2000}')
ON CONFLICT (title) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- Done!
-- ════════════════════════════════════════════════════════
