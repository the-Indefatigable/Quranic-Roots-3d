'use client';

/**
 * QariProfile — replaces the Spectrum tab in the audio player.
 *
 * Shows a rich profile of the currently selected qari so the listener
 * understands *who* is reciting and *what makes their voice distinct*:
 * country, era, riwāyah, signature maqāmāt, tempo, a short bio, the
 * "known for" line, and a recommendation. This is the answer to
 * "what is this voice?" — the difference between a player and a teacher.
 */
import type { QariInfo } from '@/lib/audio/qariLibrary';
import { G } from './playerTokens';

interface Props {
  qari: QariInfo;
}

const TEMPO_LABEL: Record<NonNullable<QariInfo['tempo']>, string> = {
  slow: 'Slow & contemplative',
  medium: 'Steady pace',
  fast: 'Brisk',
};

export function QariProfile({ qari }: Props) {
  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-6">
      <div className="max-w-xl mx-auto">

        {/* Header — Arabic name + Latin name */}
        <div className="text-center mb-6">
          {qari.nameArabic && (
            <p
              className="font-arabic text-2xl mb-1"
              style={{ color: G.gold, letterSpacing: '0.01em' }}
              dir="rtl"
            >
              {qari.nameArabic}
            </p>
          )}
          <h4
            className="text-xl font-heading"
            style={{
              color: G.textPrimary,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 144, "SOFT" 20',
            }}
          >
            {qari.name}
          </h4>
          <p className="text-[11px] mt-1 tracking-wider uppercase" style={{ color: G.textTert }}>
            {[qari.country, qari.era].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* Quick facts grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {qari.riwayah && (
            <Fact label="Riwāyah" value={qari.riwayah} />
          )}
          {qari.tempo && (
            <Fact label="Tempo" value={TEMPO_LABEL[qari.tempo]} />
          )}
          <Fact label="Style" value={qari.styleLabel} fullSpan={qari.maqamSpecialty ? false : true} />
          {qari.maqamSpecialty && qari.maqamSpecialty.length > 0 && (
            <Fact
              label="Known maqāmāt"
              value={qari.maqamSpecialty.join(' · ')}
            />
          )}
        </div>

        {/* Tags */}
        {qari.tags && qari.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {qari.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2.5 py-1 rounded-full font-medium tracking-wide"
                style={{
                  background: 'rgba(212,162,70,0.10)',
                  border: `1px solid ${G.goldBorder}`,
                  color: G.gold,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {qari.bio && (
          <p
            className="text-[13px] leading-[1.7] mb-5 text-center"
            style={{ color: G.textSecond, letterSpacing: '0.005em' }}
          >
            {qari.bio}
          </p>
        )}

        {/* Signature — the one-line description of what makes this qari distinct */}
        {qari.signature && (
          <div
            className="rounded-2xl px-5 py-4 mb-4 relative"
            style={{
              background: 'rgba(212,162,70,0.04)',
              border: `1px solid ${G.goldBorder}`,
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.15em] mb-1.5 font-semibold"
              style={{ color: G.gold }}
            >
              Signature
            </p>
            <p className="text-[13px] leading-[1.6]" style={{ color: G.textPrimary }}>
              {qari.signature}
            </p>
          </div>
        )}

        {/* Recommended for */}
        {qari.recommendedFor && (
          <div
            className="rounded-2xl px-5 py-4 mb-2"
            style={{
              background: G.surface,
              border: `1px solid ${G.border}`,
            }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.15em] mb-1.5 font-semibold"
              style={{ color: G.textTert }}
            >
              Recommended for
            </p>
            <p className="text-[13px] leading-[1.6]" style={{ color: G.textSecond }}>
              {qari.recommendedFor}
            </p>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}

function Fact({ label, value, fullSpan }: { label: string; value: string; fullSpan?: boolean }) {
  return (
    <div
      className={`rounded-xl px-3.5 py-2.5 ${fullSpan ? 'col-span-2' : ''}`}
      style={{
        background: G.surface,
        border: `1px solid ${G.border}`,
      }}
    >
      <p
        className="text-[9px] uppercase tracking-[0.15em] mb-0.5 font-semibold"
        style={{ color: G.textTert }}
      >
        {label}
      </p>
      <p className="text-[12px] leading-tight" style={{ color: G.textPrimary }}>
        {value}
      </p>
    </div>
  );
}
