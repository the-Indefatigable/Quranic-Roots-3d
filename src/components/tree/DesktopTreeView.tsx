import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore, verbRoots } from '../../store/useStore';
import { TENSE_COLORS } from '../../data/verbs';
import type { Bab, Tense, VerbRoot } from '../../data/verbs';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { OrgNode } from './OrgNode';
import { ConjugationGrid } from './ConjugationGrid';
import { ModalHeader } from './ModalHeader';
import { NounsSection } from './NounsSection';
import { AdminEditableText } from './AdminEditableText';

export const DesktopTreeView: React.FC<{
  root: VerbRoot;
  backToSpace: () => void;
  visible: boolean;
}> = ({ root, backToSpace, visible }) => {
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set());
  const [activeTenseModal, setActiveTenseModal] = useState<{ tense: Tense; bab: Bab } | null>(null);
  const [zoom, setZoom] = useState(1);
  const outerRef = useRef<HTMLDivElement>(null);
  const { setSelectedRoot } = useStore();
  const filteredRootIds  = useStore(s => s.filteredRootIds);
  const previousViewMode = useStore(s => s.previousViewMode);

  // Prev / next — use filtered list if came from explore, else all by frequency
  const navigationRoots = useMemo(() => {
    if (filteredRootIds && previousViewMode === 'explore') {
      return filteredRootIds.map(id => verbRoots.find(r => r.id === id)).filter((r): r is VerbRoot => !!r);
    }
    return verbRoots.slice().sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
  }, [filteredRootIds, previousViewMode]);
  const currentIdx = navigationRoots.findIndex(r => r.id === root.id);
  const goPrev = currentIdx > 0 ? () => setSelectedRoot(navigationRoots[currentIdx - 1].id) : null;
  const goNext = currentIdx < navigationRoots.length - 1 ? () => setSelectedRoot(navigationRoots[currentIdx + 1].id) : null;

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

  const isAdmin = useStore(s => s.isAdmin);
  const expandAll  = () => setExpandedBabs(new Set(root.babs.map(b => b.id)));
  const collapseAll = () => { setExpandedBabs(new Set()); setActiveTenseModal(null); setZoom(1); recenterTree(); };
  const downloadRootJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(root, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${root.id}.json`; a.click();
    URL.revokeObjectURL(url);
  }, [root]);
  const recenterTree = () => {
    const c = document.getElementById('tree-scroll-container');
    if (c) c.scrollTo({ top: 0, left: (c.scrollWidth - c.clientWidth) / 2, behavior: 'smooth' });
  };

  const rootContent = (
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
      <div className="arabic" style={{ fontSize: '72px', color: '#ffffff', letterSpacing: '12px', textShadow: '0 0 30px #ff9900, 0 0 60px #ff990044', lineHeight: 1.2 }}>
        {root.root}
      </div>
      <div style={{ fontSize: '22px', color: '#ddddff', marginTop: '8px', fontStyle: 'italic' }}>
        <AdminEditableText value={root.meaning} onSave={v => {
          root.meaning = v;
          fetch(`/api/roots/${encodeURIComponent(root.id)}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ meaning: v }),
          }).catch(console.error);
        }} style={{ color: '#ddddff' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '20px', direction: 'rtl' }}>
        {root.rootLetters.map((letter, i) => (
          <div key={i} className="arabic" style={{ width: '52px', height: '52px', background: 'rgba(255,153,0,0.1)', border: '1px solid rgba(255,153,0,0.35)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#ffd080', textShadow: '0 0 10px rgba(255,153,0,0.6)' }}>
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
      <div onClick={(e) => toggleBab(bab.id, e.currentTarget)} className="hover-row" style={{ width: '280px', background: isExpanded ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isExpanded ? color + 'aa' : color + '33'}`, borderRadius: '14px', padding: '16px', cursor: 'pointer', transition: 'all 0.25s ease', boxShadow: isExpanded ? `0 0 20px ${color}22` : 'none', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', color, fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Form {bab.romanNumeral}</span>
              <span className="arabic" style={{ fontSize: '24px', color: '#ffffff', textShadow: `0 0 12px ${color}` }}>{bab.arabicPattern}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#555577' }}>{totalOccurrences} occurrences</div>
            <div style={{ fontSize: '11px', color: '#444466', marginTop: '2px' }}>{bab.tenses.length} tenses</div>
          </div>
        </div>
        {bab.verbMeaning ? (
          <div style={{ fontSize: '15px', color: '#e8eeff', marginTop: '8px', fontStyle: 'italic', fontWeight: 500 }}>
            "<AdminEditableText value={bab.verbMeaning} onSave={v => {
              bab.verbMeaning = v;
              if ((bab as unknown as Record<string, unknown>)._formDbId) {
                fetch(`/api/forms/${(bab as unknown as Record<string, unknown>)._formDbId}`, {
                  method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ verbMeaning: v }),
                }).catch(console.error);
              }
            }} style={{ color: '#e8eeff' }} />"
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#999abb', marginTop: '6px' }}>
            <AdminEditableText value={bab.meaning} onSave={v => {
              bab.meaning = v;
              if ((bab as unknown as Record<string, unknown>)._formDbId) {
                fetch(`/api/forms/${(bab as unknown as Record<string, unknown>)._formDbId}`, {
                  method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ meaning: v }),
                }).catch(console.error);
              }
            }} style={{ color: '#999abb' }} />
          </div>
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
            <div key={tense.id} onClick={() => setActiveTenseModal({ tense, bab })} className="hover-row" style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: `1px solid ${tnColor}33`, borderLeft: `3px solid ${tnColor}88`, borderRadius: '8px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span className="arabic" style={{ fontSize: '20px', color: '#ffffff', display: 'block', lineHeight: 1.2 }}>{tense.arabicName}</span>
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
        <NounsSection bab={bab} color={color} />
      </div>
    );

    return (
      <OrgNode key={bab.id} lineColor={`${color}66`} content={babContent} isExpanded={isExpanded} childrenNodes={isExpanded ? [tensesAccordion] : undefined} />
    );
  });

  return (
    <div ref={outerRef} style={{ position: 'fixed', inset: 0, zIndex: 900, background: '#02050f', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', overflow: 'auto', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'opacity 0.4s ease, transform 0.4s ease', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,153,0,0.3) transparent' }}>

      {/* Back + Prev/Next nav */}
      <div style={{ position: 'fixed', top: '24px', left: '24px', zIndex: 1001, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button onClick={backToSpace} className="btn-ghost" style={{ borderRadius: '12px', padding: '10px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>←</span> Back
        </button>
        <button onClick={goPrev ?? undefined} disabled={!goPrev} title="Previous root"
          className="btn-ghost" style={{ borderRadius: '12px', padding: '10px 16px', fontSize: '18px' }}>‹</button>
        <button onClick={goNext ?? undefined} disabled={!goNext} title="Next root"
          className="btn-ghost" style={{ borderRadius: '12px', padding: '10px 16px', fontSize: '18px' }}>›</button>
      </div>

      {/* Zoom controls */}
      <div className="glass" style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1001, display: 'flex', gap: '8px', borderRadius: '20px', padding: '6px' }}>
        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="btn-subtle" style={{ width: '36px', height: '36px', borderRadius: '14px', fontSize: '18px', cursor: 'zoom-out', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</button>
        <button onClick={() => setZoom(1)} className="btn-subtle" style={{ padding: '0 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>{Math.round(zoom * 100)}%</button>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="btn-subtle" style={{ width: '36px', height: '36px', borderRadius: '14px', fontSize: '18px', cursor: 'zoom-in', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>

      {/* Actions bar */}
      <div className="glass" style={{ position: 'fixed', bottom: '32px', right: '250px', zIndex: 1001, display: 'flex', gap: '8px', borderRadius: '20px', padding: '6px' }}>
        {[{ label: 'Collapse All', action: collapseAll }, { label: 'Expand All', action: expandAll }].map(({ label, action }) => (
          <button key={label} onClick={action} className="btn-subtle" style={{ padding: '8px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</button>
        ))}
        <button onClick={recenterTree} className="btn-accent" style={{ padding: '8px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>Recenter</button>
        {isAdmin && (
          <button onClick={downloadRootJson} style={{ padding: '8px 16px', borderRadius: '14px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', cursor: 'pointer' }}>
            Download JSON
          </button>
        )}
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
            <button onClick={() => setActiveTenseModal(null)} className="btn-close" style={{ position: 'absolute', top: '20px', right: '20px' }}>✕</button>
            <ModalHeader tense={activeTenseModal.tense} bab={activeTenseModal.bab} rootLetters={root.rootLetters} />
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
