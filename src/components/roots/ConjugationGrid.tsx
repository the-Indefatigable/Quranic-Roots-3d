'use client';

import { useState } from 'react';

interface ConjugationForm {
  person: string;
  arabic: string;
  transliteration: string;
}

interface TenseData {
  type: string;
  arabicName: string;
  englishName: string;
  occurrences: number;
  conjugation: ConjugationForm[];
}

const TENSE_ACCENTS: Record<string, string> = {
  madi: 'text-amber-400',
  mudari: 'text-cyan-400',
  amr: 'text-rose-400',
  passive_madi: 'text-purple-400',
  passive_mudari: 'text-correct',
};

const TENSE_BG: Record<string, string> = {
  madi: 'bg-amber-400/10',
  mudari: 'bg-cyan-400/10',
  amr: 'bg-rose-400/10',
  passive_madi: 'bg-purple-400/10',
  passive_mudari: 'bg-correct/10',
};

const MATRIX_ROWS = [
  { id: '3m', label: '3rd Masc.', keys: ['3ms', '3md', '3mp'] },
  { id: '3f', label: '3rd Fem.', keys: ['3fs', '3fd', '3fp'] },
  { id: '2m', label: '2nd Masc.', keys: ['2ms', '2md', '2mp'] },
  { id: '2f', label: '2nd Fem.', keys: ['2fs', '2fd', '2fp'] },
  { id: '1', label: '1st Person', keys: ['1s', null, '1p'] },
];

export function ConjugationGrid({ tense }: { tense: TenseData }) {
  const conjMap = new Map((tense.conjugation ?? []).map((c) => [c.person, c]));
  const isAmr = tense.type === 'amr';
  const rows = isAmr ? MATRIX_ROWS.slice(2, 4) : MATRIX_ROWS;
  const accent = TENSE_ACCENTS[tense.type] || 'text-white';

  return (
    <div className="mt-4 -mx-4 px-4 overflow-x-auto">
      <div className="min-w-[340px]">
        {/* Column headers */}
        <div className="flex border-b border-border-light pb-3 mb-2">
          <div className="w-16 sm:w-20 shrink-0" />
          {['Singular', 'Dual', 'Plural'].map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-text-tertiary uppercase tracking-widest">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <div key={row.id} className="flex items-center border-b border-border-light py-2.5 sm:py-3">
            <div className="w-16 sm:w-20 shrink-0 text-[10px] text-text-tertiary uppercase tracking-wider leading-tight">
              {row.label}
            </div>
            {row.keys.map((key, i) => {
              const c = key ? conjMap.get(key) : null;
              const isEmpty = !c || c.arabic === '-';
              return (
                <div key={key || `empty-${i}`} className="flex-1 flex flex-col items-center justify-center min-w-0">
                  {c && !isEmpty ? (
                    <>
                      <span className={`font-arabic text-lg sm:text-xl ${accent} leading-relaxed`} dir="rtl">
                        {c.arabic}
                      </span>
                      <span className="text-[10px] text-white/30 italic mt-0.5 truncate max-w-full">
                        {c.transliteration}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/[0.06] text-sm">—</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TenseAccordion({ tenses }: { tenses: TenseData[] }) {
  const [openTense, setOpenTense] = useState<string | null>(
    tenses.find((t) => t.occurrences > 0)?.type || tenses[0]?.type || null
  );

  if (!tenses.length) return null;

  return (
    <div className="space-y-2">
      {tenses.map((tense) => {
        const isOpen = openTense === tense.type;
        const accent = TENSE_ACCENTS[tense.type] || 'text-white';
        const bg = TENSE_BG[tense.type] || 'bg-surface';

        return (
          <div key={tense.type} className="bg-surface rounded-xl shadow-card overflow-hidden">
            <button
              onClick={() => setOpenTense(isOpen ? null : tense.type)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-canvas transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`font-arabic text-lg ${accent}`}>{tense.arabicName}</span>
                <span className="text-xs text-text-secondary">{tense.englishName}</span>
              </div>
              <div className="flex items-center gap-2">
                {tense.occurrences > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${bg} ${accent}`}>
                    {tense.occurrences}x
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>

            {isOpen && tense.conjugation?.length > 0 && (
              <div className="px-4 pb-4">
                <ConjugationGrid tense={tense} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
