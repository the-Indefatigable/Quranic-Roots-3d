import React, { useState, useEffect } from 'react';
import { TENSE_COLORS } from '../../data/verbs';
import type { Bab, Tense } from '../../data/verbs';
import { fetchVerse } from '../../utils/verseCache';

/** Modal header content — tense info, morphological breakdown, verse context. */
export const ModalHeader: React.FC<{ tense: Tense; bab: Bab; rootLetters?: string[] }> = ({ tense, bab, rootLetters }) => {
  const tColor = TENSE_COLORS[tense.type] ?? '#ccc';

  // Sentence mode: fetch first reference verse
  const [verse, setVerse] = useState<{ arabic: string; english: string } | null | 'loading'>('loading');
  const firstRef = tense.references[0];
  useEffect(() => {
    if (!firstRef) { setVerse(null); return; }
    setVerse('loading');
    fetchVerse(firstRef).then(v => setVerse(v));
  }, [firstRef]);

  return (
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <div style={{ fontSize: '11px', color: '#999abb', marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Form {bab.romanNumeral} • {bab.semanticMeaning || 'Base Meaning'}
      </div>
      <h2 style={{ margin: 0, fontSize: '30px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', textShadow: `0 0 15px ${tColor}` }}>
        {tense.arabicName}
      </h2>
      <div style={{ color: tColor, fontSize: '14px', marginTop: '4px', fontWeight: 600, letterSpacing: '0.05em' }}>{tense.englishName}</div>
      <div style={{ color: '#fff', fontSize: '16px', marginTop: '6px', fontStyle: 'italic' }}>
        "{bab.verbMeaning || bab.meaning}"
      </div>

      {/* ── Morphological Breakdown ── */}
      {rootLetters && rootLetters.length >= 3 && (
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(255,153,0,0.05)', borderRadius: '12px', border: '1px solid rgba(255,153,0,0.15)', textAlign: 'left' }}>
          <div style={{ fontSize: '10px', color: '#ffd070', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px' }}>
            Morphological Structure
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Root tiles */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '10px', color: '#666688', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Root</div>
              <div style={{ display: 'flex', gap: '6px', direction: 'rtl' }}>
                {rootLetters.slice(0, 3).map((letter, i) => (
                  <div key={i} style={{ width: '34px', height: '34px', background: 'rgba(255,153,0,0.12)', border: '1px solid rgba(255,153,0,0.35)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Scheherazade New', serif", fontSize: '20px', color: '#ffd080' }}>
                    {letter}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: '18px', color: '#444466' }}>×</div>

            {/* Pattern */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{ fontSize: '10px', color: '#666688', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pattern (Form {bab.romanNumeral})</div>
              <div style={{ fontFamily: "'Scheherazade New', serif", fontSize: '26px', color: '#fff', direction: 'rtl', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '2px 14px' }}>
                {bab.arabicPattern}
              </div>
            </div>

            <div style={{ fontSize: '18px', color: '#444466' }}>=</div>

            {/* Mapping */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ fontSize: '10px', color: '#666688', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Letter map</div>
              {[['ف', rootLetters[0]], ['ع', rootLetters[1]], ['ل', rootLetters[2]]].map(([placeholder, actual]) => (
                <div key={placeholder} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '16px', color: '#888899', direction: 'rtl', minWidth: '16px', textAlign: 'center' }}>{placeholder}</span>
                  <span style={{ color: '#444466', fontSize: '11px' }}>→</span>
                  <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px', color: '#ffd080', direction: 'rtl' }}>{actual}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {bab.prepositions && bab.prepositions.length > 0 && (
        <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'inline-block', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', color: '#888899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>Preposition Modifiers (صِلَة)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {bab.prepositions.map((prep, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px', color: '#4a9eff', background: 'rgba(74,158,255,0.1)', padding: '0 8px', borderRadius: '4px', direction: 'rtl' }}>{prep.preposition}</span>
                <span style={{ color: '#ccc' }}>→</span>
                <span style={{ color: '#fff' }}>"{prep.meaning}"</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
        {tense.references.slice(0, 10).map((ref) => (
          <a key={ref} href={`https://quran.com/${ref.replace(':', '/')}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '11px', color: '#4a9eff', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: '6px', padding: '3px 8px', textDecoration: 'none' }}>
            {ref}
          </a>
        ))}
      </div>

      {/* ── Sentence Mode: Verse Context ── */}
      {firstRef && (
        <div style={{ marginTop: '18px', textAlign: 'left' }}>
          <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📖</span> Verse Context
            <span style={{ color: '#333355', fontWeight: 400, fontSize: '9px' }}>({firstRef})</span>
          </div>
          {verse === 'loading' ? (
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', color: 'rgba(255,215,0,0.3)', fontFamily: "'Scheherazade New', serif" }}>﴿ … ﴾</div>
            </div>
          ) : verse ? (
            <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontFamily: "'Scheherazade New', serif", fontSize: '22px', color: '#fff', direction: 'rtl', lineHeight: 1.8, textAlign: 'right', marginBottom: '10px' }}>
                ﴿ {verse.arabic} ﴾
              </div>
              <div style={{ fontSize: '12px', color: '#9999bb', lineHeight: 1.5, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                "{verse.english}"
              </div>
              <div style={{ marginTop: '6px', fontSize: '10px', color: '#444466' }}>
                — Surah {firstRef.split(':')[0]}, Verse {firstRef.split(':')[1]}
              </div>
            </div>
          ) : (
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', fontSize: '11px', color: '#333355', textAlign: 'center' }}>
              Verse unavailable offline
            </div>
          )}
        </div>
      )}
    </div>
  );
};
