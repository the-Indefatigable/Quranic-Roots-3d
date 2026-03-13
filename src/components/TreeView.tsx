/**
 * TreeView — 2D HTML tree showing root → babs → tenses → conjugations.
 * Desktop: horizontal org-chart tree.
 * Mobile: vertical accordion with sticky header + bottom-sheet modal.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { TENSE_COLORS } from '../data/verbs';
import type { Bab, Tense } from '../data/verbs';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { MobileDrillDown } from './TreeViewMobile';

// ── Generic Org Tree Node (desktop only) ──────────────────────────────────────
const OrgNode: React.FC<{
  content: React.ReactNode;
  childrenNodes?: React.ReactNode[];
  lineColor?: string;
  isExpanded?: boolean;
}> = ({ content, childrenNodes, lineColor = 'rgba(255,255,255,0.3)', isExpanded = true }) => {
  const hasChildren = isExpanded && childrenNodes && childrenNodes.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>{content}</div>
      {hasChildren && (
        <>
          <div style={{ width: '2px', height: '30px', background: lineColor }} />
          <div style={{ display: 'flex', position: 'relative' }}>
            {childrenNodes.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === childrenNodes.length - 1;
              const isOnly = childrenNodes.length === 1;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 24px' }}>
                  {!isOnly && (
                    <>
                      {!isFirst && <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '2px', background: lineColor }} />}
                      {!isLast  && <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '2px', background: lineColor }} />}
                    </>
                  )}
                  <div style={{ width: '2px', height: '30px', background: lineColor }} />
                  {child}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ── Conjugation grid (shared between desktop modal and mobile bottom sheet) ───
const ConjugationGrid: React.FC<{ tense: Tense; bab: Bab }> = ({ tense, bab }) => {
  const tColor = TENSE_COLORS[tense.type] ?? '#ccc';
  const conjMap = new Map(tense.conjugation.map(c => [c.person, c]));
  const MATRIX_ROWS = [
    { id: '3m', label: '3rd Masc.', keys: ['3ms', '3md', '3mp'] },
    { id: '3f', label: '3rd Fem.',  keys: ['3fs', '3fd', '3fp'] },
    { id: '2m', label: '2nd Masc.', keys: ['2ms', '2md', '2mp'] },
    { id: '2f', label: '2nd Fem.',  keys: ['2fs', '2fd', '2fp'] },
    { id: '1',  label: '1st Person', keys: ['1s', null, '1p'] },
  ];
  const isAmr = tense.type === 'amr';
  const rowsToRender = isAmr ? MATRIX_ROWS.slice(2, 4) : MATRIX_ROWS;

  return (
    <div style={{ marginTop: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '8px' }}>
        <div style={{ width: '74px' }} />
        {['Singular', 'Dual', 'Plural'].map(h => (
          <div key={h} style={{ flex: 1, textAlign: 'center', color: '#888899', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
        ))}
      </div>
      {rowsToRender.map(row => (
        <div key={row.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '14px 0', alignItems: 'center' }}>
          <div style={{ width: '74px', color: '#666688', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>
            {row.label.split(' ').map((lbl, i) => <div key={i}>{lbl}</div>)}
          </div>
          {row.keys.map((key, i) => {
            const c = key ? conjMap.get(key) : null;
            const isPlaceholder = !c || c.arabic === '-';
            return (
              <div key={key || `empty-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {c ? (
                  <>
                    <div style={{
                      fontFamily: isPlaceholder ? 'monospace' : "'Scheherazade New', serif",
                      fontSize: isPlaceholder ? '16px' : '26px',
                      color: isPlaceholder ? 'rgba(255,255,255,0.08)' : '#ffffff',
                      textShadow: isPlaceholder ? 'none' : `0 0 10px ${tColor}44`,
                      direction: 'rtl',
                      marginBottom: '4px',
                    }}>
                      {isPlaceholder ? '—' : c.arabic}
                    </div>
                    <div style={{ color: '#aaaabb', fontSize: '10px', fontStyle: 'italic', textAlign: 'center' }}>
                      {isPlaceholder ? '' : c.transliteration}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.05)', fontSize: '16px' }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ── Modal header content (shared) ─────────────────────────────────────────────
const ModalHeader: React.FC<{ tense: Tense; bab: Bab }> = ({ tense, bab }) => {
  const tColor = TENSE_COLORS[tense.type] ?? '#ccc';
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

      <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
        {tense.references.slice(0, 10).map((ref) => (
          <a key={ref} href={`https://quran.com/${ref.replace(':', '/')}`} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '11px', color: '#4a9eff', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.25)', borderRadius: '6px', padding: '3px 8px', textDecoration: 'none' }}>
            {ref}
          </a>
        ))}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  MOBILE LAYOUT
// ═════════════════════════════════════════════════════════════════════════════
const MobileTreeView: React.FC<{
  root: NonNullable<ReturnType<typeof verbRoots.find>>;
  backToSpace: () => void;
  visible: boolean;
}> = ({ root, backToSpace, visible }) => {
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<{ tense: Tense; bab: Bab } | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const sheetTouchRef = useRef<{ startY: number; startScrollTop: number }>({ startY: 0, startScrollTop: 0 });
  const sheetRef = useRef<HTMLDivElement>(null);

  // Animate sheet in after mount
  useEffect(() => {
    if (activeModal) {
      requestAnimationFrame(() => setSheetVisible(true));
    } else {
      setSheetVisible(false);
    }
  }, [activeModal]);

  const openModal = (tense: Tense, bab: Bab) => {
    setActiveModal({ tense, bab });
  };

  const closeModal = () => {
    setSheetVisible(false);
    setTimeout(() => setActiveModal(null), 280);
  };

  // Swipe right → back to space (only when no modal open)
  useSwipeGesture({
    onSwipeRight: () => { if (!activeModal) backToSpace(); },
  });

  const toggleBab = (id: string) => {
    setExpandedBabs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allExpanded = root.babs.every(b => expandedBabs.has(b.id));

  const toggleAll = () => {
    if (allExpanded) setExpandedBabs(new Set());
    else setExpandedBabs(new Set(root.babs.map(b => b.id)));
  };

  // Next / prev root sorted by Quranic frequency
  const { setSelectedRoot } = useStore();
  const sortedRoots = verbRoots.slice().sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
  const currentIdx = sortedRoots.findIndex(r => r.id === root.id);
  const goPrev = currentIdx > 0 ? () => setSelectedRoot(sortedRoots[currentIdx - 1].id) : null;
  const goNext = currentIdx < sortedRoots.length - 1 ? () => setSelectedRoot(sortedRoots[currentIdx + 1].id) : null;

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
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(2,5,15,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        {/* Back */}
        <button onClick={backToSpace} style={{
          flexShrink: 0,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px', padding: '8px 14px', color: '#aabbdd',
          cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ fontSize: '16px' }}>←</span> Back
        </button>

        {/* Root word centred */}
        <div style={{ flex: 1, textAlign: 'center', overflow: 'hidden' }}>
          <div style={{
            fontSize: '36px', fontFamily: "'Scheherazade New', serif",
            color: '#ffffff', direction: 'rtl', letterSpacing: '8px',
            textShadow: '0 0 20px #ff9900, 0 0 40px #ff990033',
            lineHeight: 1.2, whiteSpace: 'nowrap',
          }}>
            {root.root}
          </div>
          <div style={{ fontSize: '13px', color: '#ddddff', fontStyle: 'italic', marginTop: '2px', opacity: 0.8 }}>
            {root.meaning}
          </div>
        </div>

        {/* Expand / collapse all toggle + prev/next */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={toggleAll} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 10px', color: '#778899', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
            {allExpanded ? '⊟' : '⊞'}
          </button>
          <button onClick={goPrev ?? undefined} disabled={!goPrev} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 10px', color: goPrev ? '#aabbdd' : '#333355', cursor: goPrev ? 'pointer' : 'default', fontSize: '14px' }}>
            ‹
          </button>
          <button onClick={goNext ?? undefined} disabled={!goNext} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 10px', color: goNext ? '#aabbdd' : '#333355', cursor: goNext ? 'pointer' : 'default', fontSize: '14px' }}>
            ›
          </button>
        </div>
      </div>

      {/* ── Root letter tiles ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '18px 16px 0', direction: 'rtl' }}>
        {root.rootLetters.map((letter, i) => (
          <div key={i} style={{
            width: '48px', height: '48px',
            background: 'rgba(255,153,0,0.08)', border: '1px solid rgba(255,153,0,0.3)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontFamily: "'Scheherazade New', serif",
            color: '#ffd080', textShadow: '0 0 10px rgba(255,153,0,0.5)',
          }}>
            {letter}
          </div>
        ))}
      </div>

      {/* ── Bab accordion list ── */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {root.babs.map(bab => {
          const isExpanded = expandedBabs.has(bab.id);
          const color = bab.color;
          const totalOcc = bab.tenses.reduce((s, t) => s + t.occurrences, 0);

          return (
            <div key={bab.id} style={{
              background: isExpanded ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isExpanded ? color + 'aa' : color + '33'}`,
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'border-color 0.2s, background 0.2s',
              boxShadow: isExpanded ? `0 0 18px ${color}18` : 'none',
            }}>
              {/* Bab header — tap to toggle */}
              <div onClick={() => toggleBab(bab.id)} style={{
                padding: '14px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                {/* Form badge */}
                <div style={{
                  flexShrink: 0, width: '44px', height: '44px',
                  background: `${color}18`, border: `1px solid ${color}55`,
                  borderRadius: '10px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '9px', color, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Form</span>
                  <span style={{ fontSize: '15px', color, fontWeight: 800 }}>{bab.romanNumeral}</span>
                </div>

                {/* Pattern + meaning */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '22px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', textShadow: `0 0 10px ${color}88`, lineHeight: 1.2 }}>
                    {bab.arabicPattern}
                  </div>
                  <div style={{ fontSize: '13px', color: '#ccd', fontStyle: 'italic', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {bab.verbMeaning ? `"${bab.verbMeaning}"` : bab.meaning}
                  </div>
                </div>

                {/* Occurrence count + chevron */}
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#666688' }}>{totalOcc}×</div>
                  <div style={{ fontSize: '16px', color: color, marginTop: '4px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>›</div>
                </div>
              </div>

              {/* Tense chips — shown when expanded */}
              {isExpanded && (
                <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${color}22` }}>
                  {bab.semanticMeaning && (
                    <div style={{ fontSize: '11px', color: '#aaaacc', background: 'rgba(100,100,255,0.08)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', margin: '10px 0 12px' }}>
                      {bab.semanticMeaning}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: bab.semanticMeaning ? '0' : '12px' }}>
                    {bab.tenses.map(tense => {
                      const tnColor = TENSE_COLORS[tense.type] ?? '#aaa';
                      return (
                        <button key={tense.id} onClick={() => openModal(tense, bab)} style={{
                          background: `${tnColor}14`,
                          border: `1px solid ${tnColor}55`,
                          borderRadius: '20px',
                          padding: '8px 14px',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '8px',
                          transition: 'background 0.15s, border-color 0.15s',
                          WebkitTapHighlightColor: 'transparent',
                        }}>
                          <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px', color: '#fff', direction: 'rtl' }}>{tense.arabicName}</span>
                          <span style={{ fontSize: '10px', color: tnColor, fontWeight: 600 }}>{tense.englishName}</span>
                          <span style={{ fontSize: '10px', color: '#555577' }}>{tense.occurrences}×</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom sheet backdrop ── */}
      {activeModal && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 1999,
            background: sheetVisible ? 'rgba(5,5,10,0.7)' : 'rgba(5,5,10,0)',
            backdropFilter: sheetVisible ? 'blur(6px)' : 'none',
            WebkitBackdropFilter: sheetVisible ? 'blur(6px)' : 'none',
            transition: 'background 0.28s, backdrop-filter 0.28s',
          }}
        />
      )}

      {/* ── Bottom sheet ── */}
      {activeModal && (
        <div
          ref={sheetRef}
          onClick={e => e.stopPropagation()}
          onTouchStart={e => {
            sheetTouchRef.current = {
              startY: e.touches[0].clientY,
              startScrollTop: sheetRef.current?.scrollTop ?? 0,
            };
          }}
          onTouchEnd={e => {
            const dy = e.changedTouches[0].clientY - sheetTouchRef.current.startY;
            // Close only on hard downward swipe (>100px) starting from near top of sheet
            if (dy > 100 && sheetTouchRef.current.startScrollTop <= 4) closeModal();
          }}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2000,
            background: 'rgba(10,10,25,0.97)',
            border: `1px solid ${TENSE_COLORS[activeModal.tense.type] ?? '#ccc'}55`,
            borderBottom: 'none',
            borderRadius: '24px 24px 0 0',
            padding: '0 20px 32px',
            maxHeight: '88vh',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            transform: sheetVisible ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.6)',
          }}
        >
          {/* Drag handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 6px' }}>
            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
          </div>

          {/* Close button */}
          <button onClick={closeModal} style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'rgba(255,255,255,0.06)', border: 'none',
            color: '#aaa', width: '32px', height: '32px', borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
          }}>✕</button>

          <ModalHeader tense={activeModal.tense} bab={activeModal.bab} />
          <ConjugationGrid tense={activeModal.tense} bab={activeModal.bab} />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      `}</style>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  DESKTOP LAYOUT (unchanged)
// ═════════════════════════════════════════════════════════════════════════════
const DesktopTreeView: React.FC<{
  root: NonNullable<ReturnType<typeof verbRoots.find>>;
  backToSpace: () => void;
  visible: boolean;
}> = ({ root, backToSpace, visible }) => {
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set());
  const [activeTenseModal, setActiveTenseModal] = useState<{ tense: Tense; bab: Bab } | null>(null);
  const [zoom, setZoom] = useState(1);
  const outerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setExpandedBabs(new Set());
    setActiveTenseModal(null);
    setZoom(1);
  }, [root.id]);

  useSwipeGesture({
    onSwipeRight: () => {
      if (!activeTenseModal && (outerRef.current?.scrollLeft ?? 0) < 10) backToSpace();
    },
  });

  const toggleBab = (id: string, element?: HTMLElement | null) => {
    setExpandedBabs(prev => {
      const next = new Set(prev);
      const isExpanding = !next.has(id);
      if (isExpanding) {
        next.add(id);
        if (element) setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }), 50);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const expandAll  = () => setExpandedBabs(new Set(root.babs.map(b => b.id)));
  const collapseAll = () => { setExpandedBabs(new Set()); setActiveTenseModal(null); setZoom(1); recenterTree(); };
  const recenterTree = () => {
    const c = document.getElementById('tree-scroll-container');
    if (c) c.scrollTo({ top: 0, left: (c.scrollWidth - c.clientWidth) / 2, behavior: 'smooth' });
  };

  const rootContent = (
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
      <div style={{ fontSize: '72px', fontFamily: "'Scheherazade New', serif", color: '#ffffff', direction: 'rtl', letterSpacing: '12px', textShadow: '0 0 30px #ff9900, 0 0 60px #ff990044', lineHeight: 1.2 }}>
        {root.root}
      </div>
      <div style={{ fontSize: '22px', color: '#ddddff', marginTop: '8px', fontStyle: 'italic' }}>{root.meaning}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '20px', direction: 'rtl' }}>
        {root.rootLetters.map((letter, i) => (
          <div key={i} style={{ width: '52px', height: '52px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.35)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontFamily: "'Scheherazade New', serif", color: '#ffd080', textShadow: '0 0 10px rgba(255,153,0,0.6)' }}>
            {letter}
          </div>
        ))}
      </div>
    </div>
  );

  const babNodes = root.babs.map(bab => {
    const isExpanded = expandedBabs.has(bab.id);
    const color = bab.color;
    const totalOccurrences = bab.tenses.reduce((sum, t) => sum + t.occurrences, 0);

    const babContent = (
      <div onClick={(e) => toggleBab(bab.id, e.currentTarget)} style={{ width: '280px', background: isExpanded ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isExpanded ? color + 'aa' : color + '33'}`, borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: isExpanded ? `0 0 20px ${color}22` : 'none', position: 'relative' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = color + '66'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = isExpanded ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = isExpanded ? color + 'aa' : color + '33'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Form {bab.romanNumeral}</span>
              <span style={{ fontSize: '24px', fontFamily: "'Scheherazade New', serif", color: '#ffffff', direction: 'rtl', textShadow: `0 0 12px ${color}` }}>{bab.arabicPattern}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#555577' }}>{totalOccurrences} occurrences</div>
            <div style={{ fontSize: '11px', color: '#444466', marginTop: '2px' }}>{bab.tenses.length} tenses</div>
          </div>
        </div>
        {bab.verbMeaning ? (
          <div style={{ fontSize: '15px', color: '#e8eeff', marginTop: '8px', fontStyle: 'italic', fontWeight: 500 }}>"{bab.verbMeaning}"</div>
        ) : (
          <div style={{ fontSize: '13px', color: '#999abb', marginTop: '6px' }}>{bab.meaning}</div>
        )}
        {bab.semanticMeaning && !bab.verbMeaning && (
          <div style={{ fontSize: '11px', color: '#bbf', marginTop: '4px', background: 'rgba(100,100,255,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>{bab.semanticMeaning}</div>
        )}
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', background: '#050510', border: `1px solid ${color}aa`, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 10 }}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>
    );

    const tensesAccordion = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
        {bab.tenses.map(tense => {
          const tnColor = TENSE_COLORS[tense.type] ?? '#aaaaaa';
          return (
            <div key={tense.id} onClick={() => setActiveTenseModal({ tense, bab })} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${tnColor}33`, borderLeft: `3px solid ${tnColor}88`, borderRadius: '8px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${tnColor}66`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = `${tnColor}33`; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '20px', fontFamily: "'Scheherazade New', serif", color: '#ffffff', direction: 'rtl', display: 'block', lineHeight: 1.2 }}>{tense.arabicName}</span>
                  <span style={{ fontSize: '11px', color: tnColor }}>{tense.englishName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#555577' }}>{tense.occurrences}x</div>
                  <div style={{ fontSize: '12px', color: tnColor, marginTop: '4px' }}>→ View</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <OrgNode key={bab.id} lineColor={`${color}66`} content={babContent} isExpanded={isExpanded} childrenNodes={isExpanded ? [tensesAccordion] : undefined} />
    );
  });

  return (
    <div ref={outerRef} style={{ position: 'fixed', inset: 0, zIndex: 900, background: '#02050f', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', overflow: 'auto', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.4s ease, transform 0.4s ease', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,153,0,0.3) transparent' }}>

      <button onClick={backToSpace} style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 1001, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 20px', color: '#aabbdd', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,158,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(74,158,255,0.4)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
      >
        <span style={{ fontSize: '18px' }}>←</span> Back to Space
      </button>

      {/* Zoom controls */}
      <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1001, display: 'flex', gap: '8px', background: 'rgba(5,5,20,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px' }}>
        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} style={{ width: '36px', height: '36px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
        >-</button>
        <button onClick={() => setZoom(1)} style={{ padding: '0 12px', borderRadius: '14px', background: 'transparent', border: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em' }}
          onMouseEnter={e => e.currentTarget.style.color='#fff'} onMouseLeave={e => e.currentTarget.style.color='#aaa'}
        >{Math.round(zoom * 100)}%</button>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} style={{ width: '36px', height: '36px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', fontSize: '18px', cursor: 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
        >+</button>
      </div>

      {/* Actions bar */}
      <div style={{ position: 'fixed', bottom: '32px', right: '250px', zIndex: 1001, display: 'flex', gap: '8px', background: 'rgba(5,5,20,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '6px' }}>
        {[{ label: 'Collapse All', action: collapseAll }, { label: 'Expand All', action: expandAll }].map(({ label, action }) => (
          <button key={label} onClick={action} style={{ padding: '8px 16px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#aaa'; }}
          >{label}</button>
        ))}
        <button onClick={recenterTree} style={{ padding: '8px 16px', borderRadius: '14px', background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.3)', color: '#4a9eff', fontSize: '12px', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(74,158,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(74,158,255,0.1)'}
        >Recenter</button>
      </div>

      {/* Canvas */}
      <div id="tree-scroll-container" style={{ display: 'inline-block', minWidth: '100vw', padding: '100px 40px', transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <OrgNode lineColor="rgba(255,153,0,0.5)" content={rootContent} isExpanded={true} childrenNodes={babNodes} />
        </div>
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#333355', marginTop: '60px', lineHeight: 1.6 }}>
          Click a form to expand tenses · Click a tense to see conjugations
        </div>
      </div>

      {/* Desktop conjugation modal */}
      {activeTenseModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease-out', padding: '12px' }} onClick={() => setActiveTenseModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(15,15,30,0.95)', border: `1px solid ${TENSE_COLORS[activeTenseModal.tense.type] ?? '#ccc'}88`, borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative', animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)' }}>
            <button onClick={() => setActiveTenseModal(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#aaa', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#aaa'; }}
            >✕</button>
            <ModalHeader tense={activeTenseModal.tense} bab={activeTenseModal.bab} />
            <ConjugationGrid tense={activeTenseModal.tense} bab={activeTenseModal.bab} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px) scale(0.95) } to { opacity:1; transform:translateY(0) scale(1) } }
      `}</style>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  ROOT EXPORT — picks layout based on screen width
// ═════════════════════════════════════════════════════════════════════════════
export const TreeView: React.FC = () => {
  const { selectedRoot, backToSpace } = useStore();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const root = verbRoots.find(r => r.id === selectedRoot) ?? null;

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    if (root) requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, [root]);

  if (!root) return null;

  return isMobile
    ? <MobileDrillDown root={root} backToSpace={backToSpace} visible={visible} />
    : <DesktopTreeView root={root} backToSpace={backToSpace} visible={visible} />;
};
