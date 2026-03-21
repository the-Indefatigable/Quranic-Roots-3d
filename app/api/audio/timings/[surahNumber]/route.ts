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
      `https://api.quran.com/api/v4/recitations/7/by_chapter/${surahNumber}?per_page=300`,
      { headers: { Accept: 'application/json' }, next: { revalidate: false } }
    );

    if (!res.ok) throw new Error('quran.com API error');

    const data = await res.json();

    // Normalize audio_files into { ayahNumber, url, segments }
    const ayahs = (data.audio_files ?? []).map((f: {
      verse_key: string;
      url: string;
      segments?: number[][];
    }) => {
      const [, ayahStr] = f.verse_key.split(':');
      const url = f.url.startsWith('//') ? `https:${f.url}` : f.url;
      // segments: [[wordPos, startMs, endMs], ...]
      const segments: [number, number, number][] = (f.segments ?? []).map(
        (s: number[]) => [s[0], s[1], s[2]] as [number, number, number]
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
