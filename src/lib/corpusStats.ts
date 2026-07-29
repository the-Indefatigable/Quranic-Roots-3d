/**
 * Corpus figures quoted in marketing copy, page metadata and the homepage
 * counters. These are asserted in a dozen places (titles, OG descriptions,
 * JSON-LD, hero counters), so they live here to stay consistent.
 *
 * Note there are TWO legitimate root counts, and they are not interchangeable:
 *
 *   TOTAL_ROOTS (1,716)  every row in `roots` — what the sitemap enumerates
 *                        and what /roots/[rootId] pages exist for.
 *   VERB_ROOTS  (1,517)  roots with at least one entry in `forms`. This is what
 *                        /roots and /api/roots show, because the browser's
 *                        Verbs tab only lists roots that have conjugations.
 *
 * Marketing copy uses TOTAL_ROOTS ("1,716 Arabic roots"); the roots browser
 * renders VERB_ROOTS live from the database. Both are correct in context —
 * don't "reconcile" them into one number.
 *
 * If the corpus changes, re-check against:
 *   SELECT count(*) FROM roots;                                   -- TOTAL_ROOTS
 *   SELECT count(*) FROM roots r
 *     WHERE EXISTS (SELECT 1 FROM forms f WHERE f.root_id = r.id); -- VERB_ROOTS
 *   SELECT count(*) FROM quran_words WHERE char_type = 'word';
 */

/** Every row in `roots`. Verified: production's sitemap emits 1,716 root URLs. */
export const TOTAL_ROOTS = 1716;

/** Roots that have at least one verb form. Rendered live by /roots. */
export const VERB_ROOTS = 1517;

/** Ayahs in the Quran. Fixed. */
export const TOTAL_AYAHS = 6236;

/**
 * Word tokens in the Quran corpus (quran_words where char_type='word').
 * Must match TOTAL_QURAN_TOKENS in src/lib/coverage.ts, which uses it as the
 * denominator of the coverage meter.
 */
export const TOTAL_WORD_TOKENS = 77429;

/** Pre-formatted for copy, e.g. "1,716". */
export const fmt = (n: number) => n.toLocaleString('en-US');
