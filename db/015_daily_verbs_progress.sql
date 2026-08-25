-- Migration 015: let signed-in learners tick off Daily Verbs they know.
--
-- /verbs was a flat list of 298 verbs with no notion of progress — a learner
-- returning for the tenth time had no way to see which ones they had already
-- got, so the page always looked the same size and never felt like it was
-- being worked through.
--
-- A row here means "this user has marked this verb as remembered". Un-ticking
-- DELETEs the row rather than flipping a flag: the row's existence is the
-- whole fact, so a boolean and a timestamp can never drift apart.
--
-- verb_id is the frozen slug from src/data/dailyVerbs.ts ('cut', 'shave',
-- 'be-patient', ...). It is deliberately NOT a foreign key — the verb list is
-- static application data, not a table. app/api/verbs/progress validates every
-- id against that list before writing, so unknown ids cannot accumulate here.
--
-- Safe to run more than once. Nothing else in the schema depends on it, and
-- /verbs works exactly as before (minus the ticking) if it hasn't run yet.
--
-- This is the copy-paste record for the existing production database, which was
-- not built from drizzle/. A fresh database gets the same table from the
-- generated drizzle/0001_bitter_captain_stacy.sql instead. Apply ONE of them,
-- not both — though both are idempotent enough that the second would simply
-- fail on "already exists" rather than damage anything.

CREATE TABLE IF NOT EXISTS user_verb_progress (
  user_id       uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verb_id       text        NOT NULL,
  remembered_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, verb_id)
);

-- The primary key already indexes (user_id, verb_id), which serves the only
-- read the app makes: "every verb this user has ticked". No further index is
-- needed, and adding one on verb_id alone would only pay off for a global
-- "most-remembered verb" stat that does not exist yet.
