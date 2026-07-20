interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  /** Show every Nth label to avoid crowding on dense series. */
  labelEvery?: number;
}

/**
 * Server-rendered inline-SVG bar chart. No client JS. Bars scale to the max
 * value; a native <title> gives an on-hover tooltip per bar.
 */
export function BarChart({ data, height = 140, labelEvery = 1 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;
  const gap = 3;
  const barW = 100 / n;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
    >
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 22);
        const x = i * barW;
        return (
          <g key={i}>
            <title>{`${d.label}: ${d.value}`}</title>
            <rect
              x={x + gap / 2}
              y={height - 18 - h}
              width={barW - gap}
              height={Math.max(h, d.value > 0 ? 1.5 : 0)}
              rx={1.2}
              fill="var(--color-primary)"
              opacity={0.85}
            />
            {i % labelEvery === 0 && (
              <text
                x={x + barW / 2}
                y={height - 6}
                textAnchor="middle"
                fontSize="4"
                fill="var(--color-text-tertiary)"
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
