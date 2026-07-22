-- 011_supporters.sql
-- Founding Supporter (one-time lifetime purchase) via LemonSqueezy.
-- We keep it lean: a few columns on `users` rather than a separate table,
-- matching how the digest opt-in (009) was modelled.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_supporter BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supporter_since TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS supporter_order_id TEXT;

-- Fast lookups for the supporters count / admin stats.
CREATE INDEX IF NOT EXISTS idx_users_is_supporter ON users (is_supporter) WHERE is_supporter = TRUE;

-- Idempotent webhook processing: one order can only ever mark one user once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supporter_order ON users (supporter_order_id) WHERE supporter_order_id IS NOT NULL;
