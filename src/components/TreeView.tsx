/**
 * TreeView — 2D HTML tree showing root → babs → tenses → conjugations.
 * Full-screen overlay triggered when a root is clicked.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { TENSE_COLORS } from '../data/verbs';
import type { Bab, Tense, ConjugationForm } from '../data/verbs';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

// ── Generic Org Tree Node ──────────────────────────────────────────────────
const OrgNode: React.FC<{
  content: React.ReactNode;
  childrenNodes?: React.ReactNode[];
  lineColor?: string;
  isExpanded?: boolean;
}> = ({ content, childrenNodes, lineColor = 'rgba(255,255,255,0.3)', isExpanded = true }) => {
  const hasChildren = isExpanded && childrenNodes && childrenNodes.length > 0;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 1. Node Card Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {content}
      </div>
      
      {/* 2. Children Sub-tree with connecting lines */}
      {hasChildren && (
        <>
          {/* Vertical drop line from parent */}
          <div style={{ width: '2px', height: '30px', background: lineColor }} />
          
          {/* Children container with horizontal spanning lines */}
          <div style={{ display: 'flex', position: 'relative' }}>
            {childrenNodes.map((child, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === childrenNodes.length - 1;
              const isOnly = childrenNodes.length === 1;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', padding: '0 24px' }}>
                  {/* Top horizontal line bridging siblings */}
                  {!isOnly && (
                    <>
                      {/* Left horizontal line */}
                      {!isFirst && <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '2px', background: lineColor }} />}
                      {/* Right horizontal line */}
                      {!isLast && <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '2px', background: lineColor }} />}
                    </>
                  )}
                  
                  {/* Vertical drop line from horizontal bridge to child */}
                  <div style={{ width: '2px', height: '30px', background: lineColor }} />
                  
                  {/* Child Node wrapper */}
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

export const TreeView: React.FC = () => {
  const { selectedRoot, backToSpace } = useStore();
  const [visible, setVisible] = useState(false);
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set());
  const [activeTenseModal, setActiveTenseModal] = useState<{ tense: Tense; bab: Bab } | null>(null);
  const [zoom, setZoom] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 0.6 : 1);
  const outerRef = useRef<HTMLDivElement>(null);

  const root = verbRoots.find((r) => r.id === selectedRoot) ?? null;

  useEffect(() => {
    if (root) {
      requestAnimationFrame(() => setVisible(true));
    }
    return () => setVisible(false);
  }, [root]);

  // Reset expansions and zoom when root changes
  useEffect(() => {
    setExpandedBabs(new Set());
    setActiveTenseModal(null);
    setZoom(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.6 : 1);
  }, [selectedRoot]);

  // Swipe right = back to space (mobile gesture) — only when not scrolled right and no modal open
  useSwipeGesture({
    onSwipeRight: () => {
      if (!activeTenseModal && (outerRef.current?.scrollLeft ?? 0) < 10) {
        backToSpace();
      }
    },
  });

  if (!root) return null;

  const toggleBab = (id: string, element?: HTMLElement | null) => {
    setExpandedBabs((prev) => {
      const next = new Set(prev);
      const isExpanding = !next.has(id);
      
      if (isExpanding) {
        next.add(id);
        if (element && typeof window !== 'undefined' && window.innerWidth >= 768) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          }, 50); // slight delay to let DOM render children
        }
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!root) return;
    setExpandedBabs(new Set(root.babs.map(b => b.id)));
  };

  const collapseAll = () => {
    setExpandedBabs(new Set());
    setActiveTenseModal(null);
    setZoom(typeof window !== 'undefined' && window.innerWidth < 768 ? 0.6 : 1);
    recenterTree();
  };

  const recenterTree = () => {
    const container = document.getElementById('tree-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, left: (container.scrollWidth - container.clientWidth) / 2, behavior: 'smooth' });
    }
  };

  // Build the Root Content
  const rootContent = (
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
      <div
        style={{
          fontSize: '72px',
          fontFamily: "'Scheherazade New', serif",
          color: '#ffffff',
          direction: 'rtl',
          letterSpacing: '12px',
          textShadow: '0 0 30px #ff9900, 0 0 60px #ff990044',
          lineHeight: 1.2,
        }}
      >
        {root.root}
      </div>
      <div
        style={{
          fontSize: '22px',
          color: '#ddddff',
          marginTop: '8px',
          fontStyle: 'italic',
        }}
      >
        {root.meaning}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '20px', direction: 'rtl' }}>
        {root.rootLetters.map((letter, i) => (
          <div
            key={i}
            style={{
              width: '52px',
              height: '52px',
              background: 'rgba(255,153,0,0.1)',
              border: '1px solid rgba(255,153,0,0.35)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              fontFamily: "'Scheherazade New', serif",
              color: '#ffd080',
              textShadow: '0 0 10px rgba(255,153,0,0.6)',
            }}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );

  // Build the Bab Branches
  const babNodes = root.babs.map((bab) => {
    const isExpanded = expandedBabs.has(bab.id);
    const color = bab.color;
    const totalOccurrences = bab.tenses.reduce((sum, t) => sum + t.occurrences, 0);

    const babContent = (
      <div
        onClick={(e) => toggleBab(bab.id, e.currentTarget)}
        style={{
          width: '280px',
          background: isExpanded ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isExpanded ? color + 'aa' : color + '33'}`,
          borderRadius: '14px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: isExpanded ? `0 0 20px ${color}22` : 'none',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = color + '66';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isExpanded ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)';
          e.currentTarget.style.borderColor = isExpanded ? color + 'aa' : color + '33';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <span
                style={{
                  fontSize: '12px',
                  color,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  display: 'block',
                  marginBottom: '4px',
                }}
              >
                Form {bab.romanNumeral}
              </span>
              <span
                style={{
                  fontSize: '24px',
                  fontFamily: "'Scheherazade New', serif",
                  color: '#ffffff',
                  direction: 'rtl',
                  textShadow: `0 0 12px ${color}`,
                }}
              >
                {bab.arabicPattern}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#555577' }}>
              {totalOccurrences} occurrences
            </div>
            <div style={{ fontSize: '11px', color: '#444466', marginTop: '2px' }}>
              {bab.tenses.length} tenses
            </div>
          </div>
        </div>
        {/* Specific verb meaning for this root+form combo */}
        {bab.verbMeaning ? (
          <div style={{
            fontSize: '15px',
            color: '#e8eeff',
            marginTop: '8px',
            fontStyle: 'italic',
            fontWeight: 500,
          }}>
            "{bab.verbMeaning}"
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: '#999abb', marginTop: '6px' }}>
            {bab.meaning}
          </div>
        )}

        {bab.semanticMeaning && !bab.verbMeaning && (
          <div style={{
            fontSize: '11px',
            color: '#bbf',
            marginTop: '4px',
            background: 'rgba(100, 100, 255, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            {bab.semanticMeaning}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', background: '#050510', border: `1px solid ${color}aa`, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontSize: 10 }}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>
    );

    // Build the Tense Branches for this Bab (Vertical List / Accordion)
    const tensesAccordion = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px' }}>
        {bab.tenses.map((tense) => {
          const tnColor = TENSE_COLORS[tense.type] ?? '#aaaaaa';
          
          return (
            <div
              key={tense.id}
              onClick={() => setActiveTenseModal({ tense, bab })}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${tnColor}33`,
                borderLeft: `3px solid ${tnColor}88`,
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = `${tnColor}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.borderColor = `${tnColor}33`;
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span
                    style={{
                      fontSize: '20px',
                      fontFamily: "'Scheherazade New', serif",
                      color: '#ffffff',
                      direction: 'rtl',
                      display: 'block',
                      lineHeight: 1.2,
                    }}
                  >
                    {tense.arabicName}
                  </span>
                  <span style={{ fontSize: '11px', color: tnColor }}>{tense.englishName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#555577' }}>{tense.occurrences}x</div>
                  <div style={{ fontSize: '12px', color: tnColor, marginTop: '4px' }}>&#8594; View</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <OrgNode
        key={bab.id}
        lineColor={`${color}66`}
        content={babContent}
        isExpanded={isExpanded}
        childrenNodes={isExpanded ? [tensesAccordion] : undefined}
      />
    );
  });

  return (
    <div
      ref={outerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: '#02050f',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        overflow: 'auto', // Allow both horizontal and vertical scrolling natively
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,153,0,0.3) transparent',
      }}
    >
      {/* Back button */}
      <button
        onClick={backToSpace}
        style={{
          position: 'fixed',
          top: '24px',
          left: '24px',
          zIndex: 1001,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '10px 20px',
          color: '#aabbdd',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(74,158,255,0.15)';
          e.currentTarget.style.borderColor = 'rgba(74,158,255,0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
        }}
      >
        <span style={{ fontSize: '18px' }}>&#8592;</span> Back to Space
      </button>

      {/* Zoom controls */}
      <div
        className="tree-zoom-controls"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 1001,
          display: 'flex',
          gap: '8px',
          background: 'rgba(5, 5, 20, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '6px',
        }}
      >
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z - 0.1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'zoom-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          -
        </button>
        <button
          onClick={() => setZoom(1)}
          style={{
            padding: '0 12px',
            borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#aaa')}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#fff',
            fontSize: '18px',
            cursor: 'zoom-in',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
        >
          +
        </button>
      </div>

      {/* Quick Actions / Navigation HUD */}
      <div
        className="tree-actions-bar"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '250px',
          zIndex: 1001,
          display: 'flex',
          gap: '8px',
          background: 'rgba(5, 5, 20, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '6px',
        }}
      >
        <button
          onClick={collapseAll}
          style={{
            padding: '8px 16px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#aaa',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#aaa'; }}
        >
          Collapse All
        </button>
        <button
          onClick={expandAll}
          style={{
            padding: '8px 16px',
            borderRadius: '14px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#aaa',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#aaa'; }}
        >
          Expand All
        </button>
        <button
          onClick={recenterTree}
          style={{
            padding: '8px 16px',
            borderRadius: '14px',
            background: 'rgba(74, 158, 255, 0.1)',
            border: '1px solid rgba(74, 158, 255, 0.3)',
            color: '#4a9eff',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74, 158, 255, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(74, 158, 255, 0.1)'; }}
        >
          Recenter
        </button>
      </div>

      {/* Infinite Canvas Container */}
      <div
        id="tree-scroll-container"
        style={{
          display: 'inline-block',
          minWidth: '100vw', // Ensures it stretches full width but can exceed it without clamping
          padding: '100px 40px',
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <OrgNode
            lineColor="rgba(255,153,0,0.5)"
            content={rootContent}
            isExpanded={true}
            childrenNodes={babNodes}
          />
        </div>

        {/* Footer hint */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: '#333355',
            marginTop: '60px',
            lineHeight: 1.6,
          }}
        >
          Click a form to expand tenses · Click a tense to see conjugations
        </div>
      </div>

      {/* Focus Modal Overlay for Conjugations */}
      {activeTenseModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(5, 5, 10, 0.85)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out',
            padding: '12px',
          }}
          onClick={() => setActiveTenseModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(15, 15, 30, 0.95)',
              border: `1px solid ${TENSE_COLORS[activeTenseModal.tense.type] ?? '#ccc'}88`,
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '85vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              boxShadow: `0 20px 60px rgba(0,0,0,0.5)`,
              position: 'relative',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <button
              onClick={() => setActiveTenseModal(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#aaa',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#aaa'; }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#999abb', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Form {activeTenseModal.bab.romanNumeral} • {activeTenseModal.bab.semanticMeaning || 'Base Meaning'}
              </div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '32px', 
                fontFamily: "'Scheherazade New', serif", 
                color: '#fff', 
                direction: 'rtl',
                textShadow: `0 0 15px ${TENSE_COLORS[activeTenseModal.tense.type] ?? '#ccc'}`
              }}>
                {activeTenseModal.tense.arabicName}
              </h2>
              <div style={{ color: TENSE_COLORS[activeTenseModal.tense.type] ?? '#ccc', fontSize: '15px', marginTop: '6px', fontWeight: 600, letterSpacing: '0.05em' }}>
                {activeTenseModal.tense.englishName}
              </div>
              <div style={{ color: '#fff', fontSize: '18px', marginTop: '8px', fontStyle: 'italic' }}>
                "{activeTenseModal.bab.verbMeaning || activeTenseModal.bab.meaning}"
              </div>

              {activeTenseModal.bab.prepositions && activeTenseModal.bab.prepositions.length > 0 && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'inline-block',
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '11px', color: '#888899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', fontWeight: 600 }}>
                    Preposition Modifiers (صِلَة)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeTenseModal.bab.prepositions.map((prep, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
                        <span style={{ 
                          fontFamily: "'Scheherazade New', serif", 
                          fontSize: '20px', 
                          color: '#4a9eff',
                          background: 'rgba(74,158,255,0.1)',
                          padding: '0 8px',
                          borderRadius: '4px',
                          direction: 'rtl'
                        }}>
                          {prep.preposition}
                        </span>
                        <span style={{ color: '#ccc' }}>→</span>
                        <span style={{ color: '#fff' }}>"{prep.meaning}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                {activeTenseModal.tense.references.slice(0, 10).map((ref) => (
                  <a
                    key={ref}
                    href={`https://quran.com/${ref.replace(':', '/')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '11px',
                      color: '#4a9eff',
                      background: 'rgba(74,158,255,0.1)',
                      border: '1px solid rgba(74,158,255,0.25)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74,158,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(74,158,255,0.1)'}
                  >
                    {ref}
                  </a>
                ))}
              </div>
            </div>
            {(() => {
              const conjMap = new Map(activeTenseModal.tense.conjugation.map(c => [c.person, c]));
              const MATRIX_ROWS = [
                { id: '3m', label: '3rd Masc.', keys: ['3ms', '3md', '3mp'] },
                { id: '3f', label: '3rd Fem.',  keys: ['3fs', '3fd', '3fp'] },
                { id: '2m', label: '2nd Masc.', keys: ['2ms', '2md', '2mp'] },
                { id: '2f', label: '2nd Fem.',  keys: ['2fs', '2fd', '2fp'] },
                { id: '1',  label: '1st Person', keys: ['1s', null, '1p'] },
              ];
              
              const isAmr = activeTenseModal.tense.type === 'amr';
              const rowsToRender = isAmr ? MATRIX_ROWS.slice(2, 4) : MATRIX_ROWS;
              const tColor = TENSE_COLORS[activeTenseModal.tense.type] ?? '#ccc';

              return (
                <div style={{ marginTop: '32px' }}>
                  {/* Header Row */}
                  <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '80px' }}></div>
                    <div style={{ flex: 1, textAlign: 'center', color: '#888899', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Singular</div>
                    <div style={{ flex: 1, textAlign: 'center', color: '#888899', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Dual</div>
                    <div style={{ flex: 1, textAlign: 'center', color: '#888899', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Plural</div>
                  </div>
                  
                  {/* Data Rows */}
                  {rowsToRender.map(row => (
                    <div key={row.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '16px 0', alignItems: 'center' }}>
                      <div style={{ width: '80px', color: '#666688', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.4 }}>
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
                                  fontSize: isPlaceholder ? '16px' : '28px',
                                  color: isPlaceholder ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                  textShadow: isPlaceholder ? 'none' : `0 0 10px ${tColor}44`,
                                  direction: 'rtl',
                                  marginBottom: '6px'
                                }}>
                                  {isPlaceholder ? '—' : c.arabic}
                                </div>
                                <div style={{ color: '#aaaabb', fontSize: '11px', fontStyle: 'italic', textAlign: 'center' }}>
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
            })()}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (max-width: 768px) {
          .tree-zoom-controls {
            bottom: 16px !important;
            right: 10px !important;
          }
          .tree-actions-bar {
            bottom: 72px !important;
            right: 10px !important;
            left: 10px !important;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};
