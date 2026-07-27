/**
 * Corpus figures quoted in marketing copy, page metadata and the homepage
 * counters.
 *
 * These are asserted in a dozen places (titles, OG descriptions, JSON-LD, hero
 * counters). Keeping them in one module is the only way they stay consistent
 * with each other — the site previously advertised "1,716 Arabic roots" on the
 * homepage and in every /roots meta tag while /roots itself rendered a live
 * count of 1,517 from the database.
 *
 * If the corpus changes, update these and re-check against:
 *   SELECT count(*) FROM roots;
 *   SELECT count(*) FROM quran_words WHERE char_type = 'word';
 */

/** Rows in `roots`. Verified against production: SELECT count(*) FROM roots. */
export const TOTAL_ROOTS = 1517;

/** Ayahs in the Quran. Fixed. */
export const TOTAL_AYAHS = 6236;

/**
 * Word tokens in the Quran corpus (quran_words where char_type='word').
 * Must match TOTAL_QURAN_TOKENS in src/lib/coverage.ts, which uses it as the
 * denominator of the coverage meter.
 */
export const TOTAL_WORD_TOKENS = 77429;

/** Pre-formatted for copy, e.g. "1,517". */
export const fmt = (n: number) => n.toLocaleString('en-US');
