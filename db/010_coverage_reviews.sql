-- 010_coverage_reviews.sql
-- (1) Quran Coverage Meter: tag vocabulary with roots + precomputed token counts
-- (2) Spaced-repetition review queue (SM-2 lite)

-- Vocabulary tagging: root links a word to quran_words.root_arabic;
-- token_count is the number of Quran tokens this entry "unlocks"
-- (for harf entries matched by text; root entries computed at query time).
ALTER TABLE vocabulary_bank ADD COLUMN IF NOT EXISTS root_arabic TEXT;
ALTER TABLE vocabulary_bank ADD COLUMN IF NOT EXISTS token_count INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS vocabulary_bank_root_idx ON vocabulary_bank (root_arabic);

-- Review queue: one row per (user, word). Due scheduling via SM-2 lite.
CREATE TABLE IF NOT EXISTS user_word_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocab_id      UUID NOT NULL REFERENCES vocabulary_bank(id) ON DELETE CASCADE,
  due_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  interval_days REAL NOT NULL DEFAULT 0,
  ease          REAL NOT NULL DEFAULT 2.5,
  reps          INTEGER NOT NULL DEFAULT 0,
  lapses        INTEGER NOT NULL DEFAULT 0,
  last_answered TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, vocab_id)
);
CREATE INDEX IF NOT EXISTS user_word_reviews_due_idx ON user_word_reviews (user_id, due_at);
