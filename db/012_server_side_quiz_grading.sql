-- Migration 012: move the quiz answer key server-side.
--
-- /api/quiz/submit-answer used to grade against a `correctAnswer` supplied in
-- the request body, so any client could mark its own answers correct and farm
-- XP, mastery, achievements and leaderboard rank. The generated questions —
-- including their answers — are now stored on the session, and grading reads
-- from there.

ALTER TABLE quiz_sessions
  ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb;

-- Identifies which stored question an attempt answered.
ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS question_id TEXT;

-- One attempt per question per session: answering the same question twice must
-- not pay out twice. Partial so existing rows (question_id NULL) don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS quiz_attempts_session_question_unique
  ON quiz_attempts (session_id, question_id)
  WHERE question_id IS NOT NULL;
