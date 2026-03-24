-- Migration 002: Replace magic-link auth with NextAuth v5
-- This migration converts the custom auth system to NextAuth-compatible tables

-- Step 1: Add NextAuth columns to users table
ALTER TABLE users
  ADD COLUMN email_verified TIMESTAMP WITH TIME ZONE,
  ADD COLUMN image TEXT;

-- Step 2: Drop old sessions table and create NextAuth-compatible one
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX sessions_user_id_idx ON sessions("userId");

-- Step 3: Drop old auth_accounts table and create NextAuth accounts table
DROP TABLE IF EXISTS auth_accounts CASCADE;

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,

  UNIQUE(provider, "providerAccountId")
);

CREATE INDEX accounts_user_id_idx ON accounts("userId");

-- Step 4: Create verification_tokens table (required by NextAuth)
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,

  PRIMARY KEY (identifier, token)
);

-- Step 5: Drop old magic_link_tokens table
DROP TABLE IF EXISTS magic_link_tokens CASCADE;

-- Done! Tables are now NextAuth v5 compatible
