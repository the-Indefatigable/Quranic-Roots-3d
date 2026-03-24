-- Migration 003: Add quiz system tables for adaptive learning

-- user_noun_mastery table
CREATE TABLE user_noun_mastery (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  noun_id UUID NOT NULL REFERENCES nouns(id) ON DELETE CASCADE,
  mastery INT DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE,
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, noun_id)
);

CREATE INDEX user_noun_mastery_user_id_idx ON user_noun_mastery(user_id);

-- user_particle_mastery table
CREATE TABLE user_particle_mastery (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  particle_id UUID NOT NULL REFERENCES particles(id) ON DELETE CASCADE,
  mastery INT DEFAULT 0,
  next_review TIMESTAMP WITH TIME ZONE,
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id, particle_id)
);

CREATE INDEX user_particle_mastery_user_id_idx ON user_particle_mastery(user_id);

-- quiz_sessions table
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_type VARCHAR(50) NOT NULL,
  item_count INT NOT NULL,
  correct_count INT NOT NULL,
  score INT NOT NULL,
  duration_s INT,
  session_started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  session_ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX quiz_sessions_user_id_idx ON quiz_sessions(user_id);
CREATE INDEX quiz_sessions_started_idx ON quiz_sessions(user_id, session_started_at DESC);

-- quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type VARCHAR(20) NOT NULL,
  item_id UUID NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  quest_prompt TEXT,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX quiz_attempts_session_id_idx ON quiz_attempts(session_id);
CREATE INDEX quiz_attempts_user_item_idx ON quiz_attempts(user_id, item_id, item_type);

-- Done!
