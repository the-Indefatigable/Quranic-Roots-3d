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
    const res = await fetch(
      `https://api.quran.com/api/v4/recitations/7/by_chapter/${surahNumber}?per_page=300&fields=segments`,
      { headers: { Accept: 'application/json' }, next: { revalidate: false } }
    );

    if (!res.ok) throw new Error('quran.com API error');

    const data = await res.json();

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

    return Response.json(ayahs, {
      headers: { 'Cache-Control': 'public, s-maxage=31536000, immutable' },
    });
  } catch {
    return Response.json({ error: 'Timings unavailable' }, { status: 503 });
  }
}
