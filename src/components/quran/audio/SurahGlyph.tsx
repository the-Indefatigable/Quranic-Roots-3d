'use client';

/**
 * SurahGlyph — procedural geometric ornament keyed to a surah number.
 *
 * Each surah gets a unique-but-cohesive star/rosette pattern. The number of
 * points on the rosette derives from the surah, and two concentric polygons
 * are rotated against each other to form the classic Islamic geometric "knot".
 * Drawn entirely with strokes, no fills — the gold of the manuscript hairlines
 * extended into a small living mandala.
 *
 * Pure SVG, no animation here (the play state is communicated by the
 * surrounding play button, not the glyph). Renders crisp at any size.
 */
interface Props {
  surahNumber: number;
  size?: number;
  /** dim variant — used when collapsed and idle */
  dim?: boolean;
}

export function SurahGlyph({ surahNumber, size = 44, dim = false }: Props) {
  // 6..12 points, deterministic per surah
  const points = 6 + (surahNumber % 7);
  // Inner polygon offset rotation: half-step between vertices, plus a per-surah jitter
  const offsetDeg = (180 / points) + ((surahNumber * 13) % 30);
  const cx = 50;
  const cy = 50;
  const rOuter = 38;
  const rInner = 26;
  const rCore  = 12;

  const polygon = (r: number, rotateDeg: number) => {
    const pts: string[] = [];
    for (let i = 0; i < points; i++) {
      const a = (i / points) * Math.PI * 2 + (rotateDeg * Math.PI) / 180 - Math.PI / 2;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(' ');
  };

  const goldStrong = dim ? 'rgba(212,162,70,0.55)' : 'rgba(212,162,70,0.95)';
  const goldSoft   = dim ? 'rgba(212,162,70,0.20)' : 'rgba(212,162,70,0.45)';
  const teal       = dim ? 'rgba(13,148,136,0.30)' : 'rgba(13,148,136,0.55)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      style={{ display: 'block' }}
    >
      {/* Faint outer ring */}
      <circle cx={cx} cy={cy} r={rOuter + 4} fill="none" stroke={goldSoft} strokeWidth="0.5" />

      {/* Two interlocking polygons */}
      <polygon
        points={polygon(rOuter, 0)}
        fill="none"
        stroke={goldStrong}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <polygon
        points={polygon(rOuter, offsetDeg)}
        fill="none"
        stroke={teal}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />

      {/* Inner polygon */}
      <polygon
        points={polygon(rInner, offsetDeg / 2)}
        fill="none"
        stroke={goldSoft}
        strokeWidth="0.7"
        strokeLinejoin="round"
      />

      {/* Core circle */}
      <circle cx={cx} cy={cy} r={rCore} fill="none" stroke={goldStrong} strokeWidth="0.9" />

      {/* Surah number, centered, in heading font */}
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="13"
        fontFamily="var(--font-heading), Fraunces, serif"
        fontWeight="500"
        fill={dim ? 'rgba(212,162,70,0.7)' : 'rgba(212,162,70,1)'}
        style={{ letterSpacing: '-0.02em' }}
      >
        {surahNumber}
      </text>
    </svg>
  );
}
