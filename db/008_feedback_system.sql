-- 008_feedback_system.sql
-- User feedback: suggestions, bug reports, and content requests,
-- reviewed by admins at /admin/feedback.

CREATE TABLE IF NOT EXISTS feedback (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   TEXT NOT NULL DEFAULT 'suggestion', -- 'suggestion' | 'bug' | 'content' | 'other'
  body       TEXT NOT NULL,
  page       TEXT,                               -- path the user was on when submitting
  status     TEXT NOT NULL DEFAULT 'new',        -- 'new' | 'seen' | 'done'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status_created
  ON feedback (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_user_created
  ON feedback (user_id, created_at DESC);
