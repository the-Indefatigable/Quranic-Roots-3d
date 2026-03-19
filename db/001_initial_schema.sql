-- ═══════════════════════════════════════════════
-- Quranic Verbs — Initial Database Schema
-- Run: psql $DATABASE_URL -f db/001_initial_schema.sql
-- ═══════════════════════════════════════════════

BEGIN;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════
-- 1. USERS & AUTH
-- ═══════════════════════════════════════════════

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT,
  name           TEXT,
  avatar_url     TEXT,
  role           TEXT NOT NULL DEFAULT 'student'
                   CHECK (role IN ('student', 'admin', 'teacher')),
  preferred_lang TEXT DEFAULT 'en',
  streak_days    INT DEFAULT 0,
  last_active    DATE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE auth_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token        TEXT,
  refresh_token       TEXT,
  expires_at          TIMESTAMPTZ,
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 2. LINGUISTIC CORE
-- ═══════════════════════════════════════════════

CREATE TABLE roots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root         TEXT UNIQUE NOT NULL,
  root_letters TEXT[] NOT NULL,
  meaning      TEXT NOT NULL,
  total_freq   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE forms (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_id             UUID NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  form_number         TEXT NOT NULL,
  arabic_pattern      TEXT NOT NULL,
  meaning             TEXT,
  semantic_meaning    TEXT,
  verb_meaning        TEXT,
  masdar              TEXT,
  masdar_alternatives TEXT[],
  faaeil              TEXT,
  mafool              TEXT,
  prepositions        JSONB DEFAULT '[]',
  sort_order          INT DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(root_id, form_number)
);

CREATE TABLE tenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
                 'madi', 'mudari', 'amr', 'passive_madi', 'passive_mudari'
               )),
  arabic_name  TEXT NOT NULL,
  english_name TEXT NOT NULL,
  occurrences  INT DEFAULT 0,
  conjugations JSONB DEFAULT '[]',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(form_id, type)
);

CREATE TABLE nouns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_id     UUID REFERENCES roots(id),
  lemma       TEXT NOT NULL,
  lemma_clean TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN (
                'noun', 'active_participle', 'passive_participle',
                'adjective', 'masdar', 'proper_noun'
              )),
  type_ar     TEXT,
  baab        TEXT,
  meaning     TEXT,
  total_freq  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 3. QURAN
-- ═══════════════════════════════════════════════

CREATE TABLE surahs (
  id                   INT PRIMARY KEY,
  name_arabic          TEXT NOT NULL,
  name_english         TEXT NOT NULL,
  name_transliteration TEXT,
  revelation_type      TEXT,
  ayah_count           INT NOT NULL
);

CREATE TABLE ayahs (
  surah_id    INT NOT NULL REFERENCES surahs(id),
  ayah_number INT NOT NULL,
  arabic_text TEXT NOT NULL,
  PRIMARY KEY (surah_id, ayah_number)
);

CREATE TABLE quran_words (
  surah_id            INT NOT NULL,
  ayah_number         INT NOT NULL,
  word_position       INT NOT NULL,
  arabic              TEXT NOT NULL,
  root_id             UUID REFERENCES roots(id),
  noun_id             UUID REFERENCES nouns(id),
  tense_type          TEXT,
  form_number         TEXT,
  pos                 TEXT,
  morphology          JSONB,
  english_translation TEXT,
  PRIMARY KEY (surah_id, ayah_number, word_position),
  FOREIGN KEY (surah_id, ayah_number) REFERENCES ayahs(surah_id, ayah_number)
);

CREATE TABLE translations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  translator TEXT,
  language   TEXT NOT NULL DEFAULT 'en',
  UNIQUE(name, language)
);

CREATE TABLE translation_entries (
  translation_id UUID NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
  surah_id       INT NOT NULL,
  ayah_number    INT NOT NULL,
  text           TEXT NOT NULL,
  PRIMARY KEY (translation_id, surah_id, ayah_number)
);

CREATE TABLE tafsirs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  author      TEXT,
  language    TEXT NOT NULL DEFAULT 'ar',
  description TEXT
);

CREATE TABLE tafsir_entries (
  tafsir_id   UUID NOT NULL REFERENCES tafsirs(id) ON DELETE CASCADE,
  surah_id    INT NOT NULL,
  ayah_number INT NOT NULL,
  text        TEXT NOT NULL,
  PRIMARY KEY (tafsir_id, surah_id, ayah_number)
);

-- ═══════════════════════════════════════════════
-- 4. COURSES & LEARNING
-- ═══════════════════════════════════════════════

CREATE TABLE courses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  title_ar     TEXT,
  description  TEXT,
  cover_image  TEXT,
  difficulty   TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT false,
  sort_order   INT DEFAULT 0,
  created_by   UUID REFERENCES users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  title_ar    TEXT,
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lessons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id   UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  title_ar    TEXT,
  description TEXT,
  sort_order  INT DEFAULT 0,
  root_id     UUID REFERENCES roots(id),
  form_number TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE lesson_steps (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
               'content', 'animation', 'example', 'practice', 'quiz'
             )),
  title      TEXT,
  body       JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 5. USER PROGRESS
-- ═══════════════════════════════════════════════

CREATE TABLE user_courses (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id    UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at  TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, course_id)
);

CREATE TABLE user_lesson_progress (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  current_step INT DEFAULT 0,
  status       TEXT DEFAULT 'not_started'
                 CHECK (status IN ('not_started', 'in_progress', 'completed')),
  score        INT,
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE user_root_mastery (
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  root_id          UUID NOT NULL REFERENCES roots(id) ON DELETE CASCADE,
  mastery          INT DEFAULT 0 CHECK (mastery BETWEEN 0 AND 5),
  next_review      TIMESTAMPTZ,
  total_attempts   INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  updated_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, root_id)
);

CREATE TABLE user_activity (
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  quizzes_taken INT DEFAULT 0,
  roots_studied INT DEFAULT 0,
  lessons_done  INT DEFAULT 0,
  time_spent_s  INT DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

-- ═══════════════════════════════════════════════
-- 6. BOOKMARKS & COLLECTIONS
-- ═══════════════════════════════════════════════

CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  root_id     UUID REFERENCES roots(id) ON DELETE CASCADE,
  noun_id     UUID REFERENCES nouns(id) ON DELETE CASCADE,
  surah_id    INT,
  ayah_number INT,
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (root_id IS NOT NULL)::int +
    (noun_id IS NOT NULL)::int +
    (surah_id IS NOT NULL)::int = 1
  )
);

CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE collection_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  root_id       UUID REFERENCES roots(id),
  noun_id       UUID REFERENCES nouns(id),
  sort_order    INT DEFAULT 0,
  added_at      TIMESTAMPTZ DEFAULT now(),
  CHECK (
    (root_id IS NOT NULL)::int +
    (noun_id IS NOT NULL)::int = 1
  )
);

-- ═══════════════════════════════════════════════
-- 7. ADMIN AUDIT
-- ═══════════════════════════════════════════════

CREATE TABLE edit_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID REFERENCES users(id),
  table_name TEXT NOT NULL,
  record_id  UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- 8. INDEXES
-- ═══════════════════════════════════════════════

-- Search
CREATE INDEX idx_roots_meaning_fts ON roots USING GIN (to_tsvector('english', meaning));
CREATE INDEX idx_roots_arabic_fts ON roots USING GIN (to_tsvector('simple', root));
CREATE INDEX idx_nouns_meaning_fts ON nouns USING GIN (to_tsvector('english', COALESCE(meaning, '')));

-- Linguistic lookups
CREATE INDEX idx_forms_root ON forms(root_id);
CREATE INDEX idx_tenses_form ON tenses(form_id);
CREATE INDEX idx_nouns_root ON nouns(root_id);
CREATE INDEX idx_nouns_type ON nouns(type);

-- Quran (most critical)
CREATE INDEX idx_qwords_verse ON quran_words(surah_id, ayah_number);
CREATE INDEX idx_qwords_root ON quran_words(root_id) WHERE root_id IS NOT NULL;
CREATE INDEX idx_qwords_noun ON quran_words(noun_id) WHERE noun_id IS NOT NULL;

-- Translations / Tafsir
CREATE INDEX idx_trans_verse ON translation_entries(surah_id, ayah_number);
CREATE INDEX idx_tafsir_verse ON tafsir_entries(surah_id, ayah_number);

-- User progress
CREATE INDEX idx_progress_user ON user_root_mastery(user_id);
CREATE INDEX idx_activity_user ON user_activity(user_id, activity_date);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

-- Sessions cleanup
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ═══════════════════════════════════════════════
-- 9. UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_roots_updated BEFORE UPDATE ON roots FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_forms_updated BEFORE UPDATE ON forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tenses_updated BEFORE UPDATE ON tenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_nouns_updated BEFORE UPDATE ON nouns FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_courses_updated BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_lesson_steps_updated BEFORE UPDATE ON lesson_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
