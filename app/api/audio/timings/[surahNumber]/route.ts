export const revalidate = false; // Quran audio timing never changes

export async function GET(
  _req: Request,
  { params }: { params: { surahNumber: string } }
) {
  const surahNumber = parseInt(params.surahNumber);
  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return Response.json({ error: 'Invalid surah' }, { status: 400 });
  }

  try {
    // Fetch per-ayah segments and full chapter audio URL in parallel
    const [segRes, chapterRes] = await Promise.all([
      fetch(
        `https://api.quran.com/api/v4/recitations/7/by_chapter/${surahNumber}?per_page=300&fields=segments`,
        { headers: { Accept: 'application/json' }, next: { revalidate: false } }
      ),
      fetch(
        `https://api.quran.com/api/v4/chapter_recitations/7/${surahNumber}`,
        { headers: { Accept: 'application/json' }, next: { revalidate: false } }
      ),
    ]);

    if (!segRes.ok) throw new Error('quran.com API error');

    const data = await segRes.json();

    // Normalize audio_files into { ayahNumber, url, segments }
    // Quran.com segments format: [wordIndex, wordPosition, startMs, endMs]
    const ayahs = (data.audio_files ?? []).map((f: {
      verse_key: string;
      url: string;
      segments?: number[][];
    }) => {
      const [, ayahStr] = f.verse_key.split(':');
      // URLs can be relative (e.g. "Alafasy/mp3/001001.mp3") or protocol-relative
      let url = f.url;
      if (url.startsWith('//')) {
        url = `https:${url}`;
      } else if (!url.startsWith('http')) {
        url = `https://verses.quran.com/${url}`;
      }
      // Quran.com segments: [wordIndex(0-based), wordPosition(1-based), startMs, endMs]
      // Map to [wordPosition(1-based), startMs, endMs] to match our DB positions
      const segments: [number, number, number][] = (f.segments ?? []).map(
        (s: number[]) => [s[1], s[2], s[3]] as [number, number, number]
      );
      return { ayahNumber: parseInt(ayahStr), url, segments };
    });

    // Extract full chapter audio URL and verse-level timestamps
    let chapterAudioUrl: string | null = null;
    let chapterVerseTimings: { ayahNumber: number; timestampFrom: number; timestampTo: number; segments: [number, number, number][] }[] = [];

    if (chapterRes.ok) {
      const chapterData = await chapterRes.json();
      chapterAudioUrl = chapterData?.audio_file?.audio_url ?? null;

      // verse_timings contains absolute timestamps for the chapter audio file
      const verseTimings = chapterData?.audio_file?.verse_timings ?? [];
      chapterVerseTimings = verseTimings.map((vt: {
        verse_key: string;
        timestamp_from: number;
        timestamp_to: number;
        segments: number[][];
      }) => {
        const [, ayahStr] = vt.verse_key.split(':');
        // Chapter-level segments: [wordPosition, startMs, endMs] — absolute in chapter audio
        const segments: [number, number, number][] = (vt.segments ?? []).map(
          (s: number[]) => [s[0], s[1], s[2]] as [number, number, number]
        );
        return {
          ayahNumber: parseInt(ayahStr),
          timestampFrom: vt.timestamp_from,
          timestampTo: vt.timestamp_to,
          segments,
        };
      });
    }

    return Response.json({ ayahs, chapterAudioUrl, chapterVerseTimings }, {
      headers: { 'Cache-Control': 'public, s-maxage=31536000, immutable' },
    });
  } catch {
    return Response.json({ error: 'Timings unavailable' }, { status: 503 });
  }
}

