-- Migration 013: indexes for the queries that actually run.
--
-- /api/search does a leading-wildcard ILIKE over ayahs.text_simple and
-- translation_entries.text, neither of which had any index — two sequential
-- scans per keystroke-driven request, from anonymous callers. A btree index
-- cannot serve '%foo%', so this needs pg_trgm.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS ayahs_text_simple_trgm
  ON ayahs USING gin (text_simple gin_trgm_ops);

CREATE INDEX IF NOT EXISTS translation_entries_text_trgm
  ON translation_entries USING gin (text gin_trgm_ops);

-- The leaderboard orders every user by total_xp.
CREATE INDEX IF NOT EXISTS users_total_xp_idx
  ON users (total_xp DESC);

-- The SRS due query is "this user's items where next_review <= now, oldest
-- first". These tables were indexed on user_id alone, so the due filter and
-- sort fell back to a scan of that user's rows.
CREATE INDEX IF NOT EXISTS user_root_mastery_due_idx
  ON user_root_mastery (user_id, next_review);
CREATE INDEX IF NOT EXISTS user_noun_mastery_due_idx
  ON user_noun_mastery (user_id, next_review);
CREATE INDEX IF NOT EXISTS user_particle_mastery_due_idx
  ON user_particle_mastery (user_id, next_review);

-- Same shape for vocabulary reviews, which /api/review/due orders by due_at.
CREATE INDEX IF NOT EXISTS user_word_reviews_due_idx
  ON user_word_reviews (user_id, due_at);
