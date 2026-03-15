/**
 * Bounded LRU cache for Quran verse fetching.
 * Used by TreeView's ModalHeader for "Verse Context" display.
 */

const VERSE_CACHE_MAX = 200;
const verseCache = new Map<string, { arabic: string; english: string } | null>();

function verseCacheSet(key: string, value: { arabic: string; english: string } | null) {
  if (verseCache.size >= VERSE_CACHE_MAX) {
    const oldest = verseCache.keys().next().value;
    if (oldest !== undefined) verseCache.delete(oldest);
  }
  verseCache.set(key, value);
}

export async function fetchVerse(ref: string): Promise<{ arabic: string; english: string } | null> {
  if (verseCache.has(ref)) return verseCache.get(ref) ?? null;
  try {
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,en.sahih`);
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    if (data.code === 200 && data.data?.length >= 2) {
      const result = { arabic: data.data[0].text, english: data.data[1].text };
      verseCacheSet(ref, result);
      return result;
    }
  } catch { /* offline or API down */ }
  verseCacheSet(ref, null);
  return null;
}
