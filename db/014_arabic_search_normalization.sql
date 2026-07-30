-- Migration 014: make Arabic search actually return results.
--
-- /api/search matched `ayahs.text_simple ILIKE '%q%'`, with a comment claiming
-- text_simple was diacritic-free ("so رحمة matches رَحْمَةً"). It isn't:
-- populate-ayahs.mjs fills it from quran.com's `text_imlaei`, which keeps full
-- tashkeel — بِسْمِ اللَّهِ الرَّحْمَٰنِ. A user typing bare Arabic therefore
-- matched nothing, ever. Arabic search returned zero results for every query.
--
-- Fixes it with a stored generated column that strips diacritics and folds the
-- alef/ya/ta-marbuta variants, plus a trigram index on it. Stripping in the
-- WHERE clause instead would work but could not use an index.

-- Diacritics: harakat + tanwin (064B-065F), superscript alef (0670),
-- Quranic annotation signs (06D6-06ED), and tatweel (0640).
-- Letter folding: أإآٱ -> ا, ى -> ي, ة -> ه, so spelling variants match.
ALTER TABLE ayahs
  ADD COLUMN IF NOT EXISTS text_search TEXT
  GENERATED ALWAYS AS (
    translate(
      regexp_replace(
        coalesce(text_simple, text_uthmani),
        '[ً-ٰٟۖ-ۭـ]',
        '',
        'g'
      ),
      'أإآٱىة',
      'اااايه'
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS ayahs_text_search_trgm
  ON ayahs USING gin (text_search gin_trgm_ops);

-- The old index is now unused by the search path.
DROP INDEX IF EXISTS ayahs_text_simple_trgm;
