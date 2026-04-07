/**
 * Atmosphere — site-wide ambient layer.
 *
 * Four passes, all fixed-positioned, all pointer-events-none:
 *   1. Manuscript ruling lines (horizontal gold rules, like a mushaf page)
 *   2. SVG turbulence grain (4% opacity, vellum texture)
 *   3. Two animated radial glows that drift on a 40s loop — the page breathes
 *   4. Bismillah corner watermark (top-right, 5% opacity, Uthmani)
 *
 * Sits at z-0 with pointer-events-none. Page content should sit at z-10.
 */

export function Atmosphere() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* ─────────────────────────────────────────────
         1. Manuscript ruling lines
         48px line height, faint gold rule every line
         ───────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, transparent 0px, transparent 47px, rgba(212,162,70,0.035) 48px)',
          backgroundSize: '100% 48px',
          maskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 95%)',
        }}
      />

      {/* ─────────────────────────────────────────────
         2. SVG turbulence grain (vellum texture)
         ───────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="atmosphere-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#atmosphere-noise)" />
      </svg>

      {/* ─────────────────────────────────────────────
         3. Animated drifting radial glows
         Two large blurred ellipses on opposing 40s loops
         ───────────────────────────────────────────── */}
      <div className="atmosphere-glow atmosphere-glow-amber" />
      <div className="atmosphere-glow atmosphere-glow-teal" />

      {/* ─────────────────────────────────────────────
         4. Bismillah corner watermark (top-right)
         Uthmani, very faint — a constant signature
         ───────────────────────────────────────────── */}
      <div
        className="font-arabic absolute select-none"
        style={{
          top: '14px',
          right: '20px',
          fontSize: '13px',
          color: '#D4A246',
          opacity: 0.18,
          letterSpacing: '0.02em',
          lineHeight: 1,
          textShadow: '0 0 8px rgba(212,162,70,0.2)',
        }}
        dir="rtl"
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
    </div>
  );
}
