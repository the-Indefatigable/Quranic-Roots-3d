-- 007_chat_system.sql
-- Community chat: a shared room where learners chat among themselves.
-- Admins/teachers appear with a badge and can moderate (soft-delete) any message.

CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room       TEXT NOT NULL DEFAULT 'general',
  body       TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast "latest messages in a room" and "new since cursor" queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
  ON chat_messages (room, created_at);

-- Rate-limit check: "user's most recent message"
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON chat_messages (user_id, created_at DESC);
