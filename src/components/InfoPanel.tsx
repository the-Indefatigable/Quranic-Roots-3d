import React, { useEffect, useState } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { TENSE_COLORS } from '../data/verbs';
import type { Bab, Tense } from '../data/verbs';

// Forward store setters into child cards via context (avoids prop drilling)
type PanelActions = {
  setExpandedBab: (id: string | null) => void;
  setExpandedTense: (id: string | null) => void;
  expandedBab: string | null;
  expandedTense: string | null;
};
const PanelCtx = React.createContext<PanelActions>({
  setExpandedBab: () => {},
  setExpandedTense: () => {},
  expandedBab: null,
  expandedTense: null,
});

export const InfoPanel: React.FC = () => {
  const { selectedRoot, expandedBab, expandedTense, setSelectedRoot, setExpandedBab, setExpandedTense } = useStore();
  const [visible, setVisible] = useState(false);

  const root = verbRoots.find((r) => r.id === selectedRoot) ?? null;
  const bab = root?.babs.find((b) => b.id === expandedBab) ?? null;
  const tense = bab?.tenses.find((t) => t.id === expandedTense) ?? null;

  useEffect(() => {
    if (root) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [root]);

  if (!root) return null;

  return (
    <PanelCtx.Provider value={{ setExpandedBab, setExpandedTense, expandedBab, expandedTense }}>
    <div
      className="mobile-info-panel"
      style={{
        position: 'fixed',
        left: '20px',
        top: '50%',
        transform: `translateY(-50%) translateX(${visible ? '0' : '-120%'})`,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), bottom 0.4s',
        zIndex: 1000,
        width: '320px',
        maxHeight: '85vh',
        overflowY: 'auto',
        background: 'rgba(5, 8, 20, 0.65)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.1) transparent',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .mobile-info-panel {
            top: auto !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(${visible ? '0' : '150%'}) !important;
            width: calc(100% - 40px) !important;
            max-height: 40vh !important;
          }
        }
      `}</style>
      {/* Close button */}
      <button
        onClick={() => setSelectedRoot(null)}
        style={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          color: '#aaaacc',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1',
          transition: 'all 0.15s',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,100,100,0.2)';
          (e.currentTarget as HTMLButtonElement).style.color = '#ffaaaa';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)';
          (e.currentTarget as HTMLButtonElement).style.color = '#aaaacc';
        }}
      >
        x
      </button>

      {/* Root letters — large display */}
      <div
        style={{
          fontSize: '52px',
          fontFamily: "'Scheherazade New', serif",
          color: '#ffffff',
          direction: 'rtl',
          textAlign: 'center',
          letterSpacing: '8px',
          textShadow: '0 4px 12px rgba(0,0,0,0.5)',
          marginBottom: '4px',
          lineHeight: 1.2,
        }}
      >
        {root.root}
      </div>

      {/* English meaning */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '17px',
          color: '#ddddff',
          marginBottom: '16px',
          fontStyle: 'italic',
        }}
      >
        {(() => {
          const m = root.meaning;
          const isEnglish = m.includes(' ') || m.startsWith('to ');
          if (isEnglish) return m;
          return <span style={{ color: '#666677', fontSize: '13px' }}>Transliteration: {m}</span>;
        })()}
      </div>

      <div
        style={{
          height: '1px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)',
          marginBottom: '18px',
        }}
      />

      {/* Root letters breakdown */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', color: '#666688', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Root Letters
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', direction: 'rtl' }}>
          {root.rootLetters.map((letter, i) => (
            <div
              key={i}
              style={{
                width: '44px',
                height: '44px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontFamily: "'Scheherazade New', serif",
                color: '#e2e8f0',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Bābs list */}
      <div style={{ fontSize: '10px', color: '#666688', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
        Babs / Forms Used
      </div>
      {root.babs.map((b) => (
        <BabCard key={b.id} bab={b} isActive={b.id === expandedBab} />
      ))}

      {/* Expanded bab: show its tenses */}
      {bab && (
        <>
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${bab.color}66, transparent)`,
              margin: '14px 0',
            }}
          />
          <div style={{ fontSize: '10px', color: '#666688', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Tenses — Form {bab.romanNumeral}
          </div>
          {bab.tenses.map((t) => (
            <TenseCard key={t.id} tense={t} isActive={t.id === expandedTense} />
          ))}
        </>
      )}

      {/* Expanded tense: show full conjugation table */}
      {tense && (
        <>
          <div
            style={{
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${tense.color}66, transparent)`,
              margin: '14px 0',
            }}
          />
          <div style={{ fontSize: '10px', color: '#666688', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Conjugation — {tense.englishName}
          </div>
          <ConjugationTable tense={tense} />
        </>
      )}

      <div style={{ fontSize: '10px', color: '#333355', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }}>
        Click a bāb to see tenses · Click a tense to see conjugation
      </div>
    </div>
    </PanelCtx.Provider>
  );
};

// ── Bab Card ──────────────────────────────────────────────────────────────────
const BabCard: React.FC<{ bab: Bab; isActive: boolean }> = React.memo(({ bab, isActive }) => {
  const color = bab.color;
  const totalOccurrences = bab.tenses.reduce((sum, t) => sum + t.occurrences, 0);
  const { setExpandedBab, setExpandedTense } = React.useContext(PanelCtx);

  return (
    <div
      onClick={() => { setExpandedBab(bab.id); setExpandedTense(null); }}
      style={{
        background: isActive ? `rgba(255,255,255,0.05)` : 'rgba(255,255,255,0.01)',
        border: `1px solid ${isActive ? color + '88' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '8px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isActive ? `0 8px 24px rgba(0,0,0,0.4)` : 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = `rgba(255,255,255,0.03)`;
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span
            style={{
              fontSize: '11px',
              color,
              fontWeight: 700,
              letterSpacing: '0.05em',
              display: 'block',
              marginBottom: '2px',
            }}
          >
            Form {bab.romanNumeral}
          </span>
          <span
            style={{
              fontSize: '18px',
              fontFamily: "'Scheherazade New', serif",
              color: '#ffffff',
              direction: 'rtl',
              textShadow: `0 0 8px ${color}`,
            }}
          >
            {bab.arabicPattern}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#555577', marginTop: '2px' }}>
            ×{totalOccurrences} total
          </div>
          <div style={{ fontSize: '10px', color: '#444466', marginTop: '2px' }}>
            {bab.tenses.length} tenses
          </div>
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#999abb', marginTop: '5px', lineHeight: 1.3 }}>
        {bab.meaning}
      </div>
    </div>
  );
});

// ── Tense Card ────────────────────────────────────────────────────────────────
const TenseCard: React.FC<{ tense: Tense; isActive: boolean }> = React.memo(({ tense, isActive }) => {
  const color = TENSE_COLORS[tense.type] ?? '#aaaaaa';
  const { setExpandedTense } = React.useContext(PanelCtx);

  return (
    <div
      onClick={() => setExpandedTense(tense.id)}
      style={{
        background: isActive ? `rgba(255,255,255,0.05)` : 'rgba(255,255,255,0.01)',
        border: `1px solid ${isActive ? color + '88' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: '10px',
        padding: '10px 14px',
        marginBottom: '8px',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isActive ? `0 8px 24px rgba(0,0,0,0.4)` : 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = `rgba(255,255,255,0.03)`;
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = `rgba(255,255,255,0.01)`;
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
              textShadow: `0 0 10px ${color}`,
              display: 'block',
              lineHeight: 1.3,
            }}
          >
            {tense.arabicName}
          </span>
          <span style={{ fontSize: '11px', color }}>{tense.englishName}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#555577' }}>×{tense.occurrences}</div>
          <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '3px', maxWidth: '100px', justifyContent: 'flex-end' }}>
            {tense.references.slice(0, 3).map((ref) => (
              <a
                key={ref}
                href={`https://quran.com/${ref.replace(':', '/')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: '9px',
                  color: '#4a9eff',
                  background: 'rgba(74,158,255,0.1)',
                  border: '1px solid rgba(74,158,255,0.25)',
                  borderRadius: '5px',
                  padding: '1px 5px',
                  textDecoration: 'none',
                }}
              >
                {ref}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// ── Conjugation Table ─────────────────────────────────────────────────────────
const ConjugationTable: React.FC<{ tense: Tense }> = React.memo(({ tense }) => {
  const color = TENSE_COLORS[tense.type] ?? '#aaaaaa';

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
      <tbody>
        {tense.conjugation.map((c) => (
          <tr key={c.person} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <td style={{ padding: '4px 4px', color: '#555577', fontFamily: 'monospace', fontSize: '10px', width: '32px' }}>
              {c.person}
            </td>
            <td
              style={{
                padding: '4px 4px',
                fontFamily: "'Scheherazade New', serif",
                fontSize: '16px',
                direction: 'rtl',
                color: '#ffffff',
                textAlign: 'right',
                textShadow: `0 0 6px ${color}88`,
              }}
            >
              {c.arabic}
            </td>
            <td style={{ padding: '4px 4px', color: '#888899', fontSize: '10px', fontStyle: 'italic' }}>
              {c.transliteration}
            </td>
            <td style={{ padding: '4px 4px', color: '#aaaaaa', fontSize: '10px' }}>
              {c.english}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
