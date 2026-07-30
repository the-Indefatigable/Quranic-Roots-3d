-- Migration 014: make Arabic search return results.
--
-- /api/search matched `ayahs.text_simple ILIKE '%q%'`, with a comment claiming
-- text_simple was diacritic-free ("so رحمة matches رَحْمَةً"). It never was:
-- populate-ayahs.mjs fills it from quran.com's `text_imlaei`, which keeps full
-- tashkeel — بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ. A bare-form query therefore could not match,
-- and Arabic search returned zero results for every term.
--
-- The route now normalizes text_simple inline. This adds a matching functional
-- index so that expression is indexed rather than sequentially scanned.
--
-- IMPORTANT: the expression below must stay byte-identical to the one in
-- app/api/search/route.ts, or the planner will not use this index. The search
-- still returns correct results without it — just slower — so this migration
-- is safe to apply before or after the deploy, in either order.
--
-- Characters are listed explicitly rather than as ranges: range semantics over
-- non-ASCII depend on the server collation, so '[ً-ٰ]' can strip correctly on
-- one Postgres and nothing at all on another.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS ayahs_text_normalized_trgm
  ON ayahs USING gin (
    (translate(translate(text_simple, 'ًٌٍَُِّْٰٕٖٓٔٗ٘ـۖۗۘۙۚۛۜ۝۞ۣ۟۠ۡۢۤۥۦۧۨ۩۪ۭ۫۬', ''), 'أإآٱىة', 'اااايه')) gin_trgm_ops
  );

-- Superseded: the search path no longer matches raw text_simple.
DROP INDEX IF EXISTS ayahs_text_simple_trgm;
