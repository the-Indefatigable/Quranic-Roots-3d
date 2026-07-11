-- 009_weekly_digest.sql
-- Weekly digest email opt-in + one-click unsubscribe tokens.

ALTER TABLE users ADD COLUMN IF NOT EXISTS digest_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unsubscribe_token UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_unsubscribe_token ON users (unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_users_digest_opt_in ON users (digest_opt_in) WHERE digest_opt_in = TRUE;
