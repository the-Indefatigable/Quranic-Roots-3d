/**
 * NounDetailView — full-screen detail page for a selected noun.
 * Visual style matches the verb TreeView (mobile + desktop).
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { nounsList, NOUN_TYPE_COLORS, NOUN_TYPE_LABELS } from '../data/nouns';
import type { Noun } from '../data/nouns';
import { verbRoots } from '../data/verbs';
import { fetchVerse } from '../utils/verseCache';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

export const NounDetailView: React.FC<{
  nounId: string;
  backToSpace: () => void;
  visible: boolean;
}> = ({ nounId, backToSpace, visible }) => {
  const { setSelectedNoun, setSelectedRoot } = useStore();
  const filteredNounIds = useStore(s => s.filteredNounIds);
  const previousViewMode = useStore(s => s.previousViewMode);

  const noun = useMemo(() => nounsList.find(n => n.id === nounId) ?? null, [nounId]);

  // Navigation through filtered noun list
  const navigationNouns = useMemo(() => {
    if (filteredNounIds && previousViewMode === 'explore') {
      return filteredNounIds.map(id => nounsList.find(n => n.id === id)).filter((n): n is Noun => !!n);
    }
    return nounsList;
  }, [filteredNounIds, previousViewMode]);

  const currentIdx = navigationNouns.findIndex(n => n.id === nounId);
  const goPrev = currentIdx > 0 ? () => setSelectedNoun(navigationNouns[currentIdx - 1].id) : null;
  const goNext = currentIdx < navigationNouns.length - 1 ? () => setSelectedNoun(navigationNouns[currentIdx + 1].id) : null;

  // Verse fetch for first reference
  const [verse, setVerse] = useState<{ arabic: string; english: string } | null | 'loading'>('loading');
  const firstRef = noun?.references[0];

  useEffect(() => {
    if (!firstRef) { setVerse(null); return; }
    setVerse('loading');
    fetchVerse(firstRef).then(v => setVerse(v));
  }, [firstRef]);

  // Swipe right to go back
  useSwipeGesture({
    onSwipeRight: () => backToSpace(),
  });

  // Check if this noun's root matches a verb root
  const matchingVerbRoot = useMemo(() => {
    if (!noun) return null;
    return verbRoots.find(r => r.root === noun.root || r.rootLetters.join('') === noun.root) ?? null;
  }, [noun]);

  if (!noun) return null;

  const typeColor = NOUN_TYPE_COLORS[noun.type] ?? '#4a9eff';
  const typeLabel = NOUN_TYPE_LABELS[noun.type] ?? { en: noun.type, ar: noun.typeAr };
  const rootLetters = noun.root.split('');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: '#02050f',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(20px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
    }}>

      {/* ── Sticky header ── */}
      <div className="glass-heavy" style={{
        position: 'sticky', top: 0, zIndex: 10,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={backToSpace} className="btn-ghost" style={{
          flexShrink: 0, borderRadius: '10px', padding: '8px 14px',
          fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ fontSize: '16px' }}>←</span> Back
        </button>

        <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden' }}>
          <div className="arabic" style={{
            fontSize: '36px', color: '#ffffff', letterSpacing: '4px',
            textShadow: `0 0 20px ${typeColor}, 0 0 40px ${typeColor}33`,
            lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {noun.lemma}
          </div>
          <div style={{ fontSize: '13px', color: '#ddddff', fontStyle: 'italic', marginTop: '2px', opacity: 0.8 }}>
            {noun.meaning}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={goPrev ?? undefined} disabled={!goPrev}
            className="btn-ghost" style={{ borderRadius: '10px', padding: '8px 10px', fontSize: '14px' }}>‹</button>
          <button onClick={goNext ?? undefined} disabled={!goNext}
            className="btn-ghost" style={{ borderRadius: '10px', padding: '8px 10px', fontSize: '14px' }}>›</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '24px 20px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>

        {/* Type badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '16px',
          background: `${typeColor}10`, border: `1px solid ${typeColor}44`,
          marginBottom: '20px',
        }}>
          <span className="arabic" style={{ fontSize: '22px', color: typeColor }}>{typeLabel.ar}</span>
          <span style={{ color: '#444466' }}>·</span>
          <span style={{ fontSize: '14px', color: typeColor, fontWeight: 600 }}>{typeLabel.en}</span>
          {noun.baab && (
            <>
              <span style={{ color: '#444466' }}>·</span>
              <span style={{ fontSize: '12px', color: '#888899' }}>Form {noun.baab}</span>
            </>
          )}
        </div>

        {/* Meaning */}
        <div style={{
          padding: '16px 20px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>
            Meaning
          </div>
          <div style={{ fontSize: '16px', color: '#e8eeff', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{noun.meaning}"
          </div>
        </div>

        {/* Root connection */}
        <div style={{
          padding: '16px 20px', borderRadius: '14px',
          background: 'rgba(255,153,0,0.04)', border: '1px solid rgba(255,153,0,0.15)',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '10px', color: '#ffd070', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '12px' }}>
            Root
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', direction: 'rtl', marginBottom: '12px' }}>
            {rootLetters.map((letter, i) => (
              <div key={i} className="arabic" style={{
                width: '48px', height: '48px',
                background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.3)',
                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', color: '#ffd080', textShadow: '0 0 10px rgba(255,153,0,0.5)',
              }}>
                {letter}
              </div>
            ))}
          </div>
          {matchingVerbRoot && (
            <button
              onClick={() => setSelectedRoot(matchingVerbRoot.id)}
              className="btn-accent"
              style={{
                display: 'block', width: '100%', padding: '10px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 600, textAlign: 'center',
              }}
            >
              View verb root "{matchingVerbRoot.meaning}"
            </button>
          )}
        </div>

        {/* Verse context */}
        <div style={{
          padding: '16px 20px', borderRadius: '14px',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Verse Context
            {firstRef && <span style={{ color: '#333355', fontWeight: 400, fontSize: '9px' }}>({firstRef})</span>}
          </div>
          {verse === 'loading' ? (
            <div style={{ padding: '14px', textAlign: 'center' }}>
              <div className="arabic" style={{ fontSize: '20px', color: 'rgba(255,215,0,0.3)' }}>﴿ … ﴾</div>
            </div>
          ) : verse ? (
            <>
              <div className="arabic" style={{ fontSize: '22px', color: '#fff', lineHeight: 1.8, textAlign: 'right', marginBottom: '10px' }}>
                ﴿ {verse.arabic} ﴾
              </div>
              <div style={{ fontSize: '12px', color: '#9999bb', lineHeight: 1.5, fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                "{verse.english}"
              </div>
              {firstRef && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: '#444466' }}>
                  — Surah {firstRef.split(':')[0]}, Verse {firstRef.split(':')[1]}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: '11px', color: '#333355', textAlign: 'center' }}>
              Verse unavailable offline
            </div>
          )}
        </div>

        {/* All references */}
        {noun.references.length > 0 && (
          <div style={{
            padding: '16px 20px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '10px' }}>
              Quranic References ({noun.references.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {noun.references.slice(0, 30).map((ref) => (
                <a key={ref} href={`https://quran.com/${ref.replace(':', '/')}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '11px', color: '#4a9eff', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: '6px', padding: '3px 8px', textDecoration: 'none' }}>
                  {ref}
                </a>
              ))}
              {noun.references.length > 30 && (
                <span style={{ fontSize: '11px', color: '#444466', padding: '3px 8px' }}>
                  +{noun.references.length - 30} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Frequency */}
        <div style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: '#333355' }}>
          Appears in {noun.references.length} verse{noun.references.length !== 1 ? 's' : ''} in the Quran
        </div>
      </div>
    </div>
  );
};
