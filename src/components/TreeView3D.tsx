import React, { useMemo, useState } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useStore, verbRoots } from '../store/useStore';
import type { Bab, Tense } from '../data/verbs';

const TENSE_COLORS: Record<string, string> = {
  madi: '#ffd700',
  mudari: '#00d4ff',
  amr: '#ff6b6b',
  passive_madi: '#c084fc',
  passive_mudari: '#86efac',
};

// ── Node Components ─────────────────────────────────────────────────────────

const RootNode: React.FC<{ root: any; position: [number, number, number] }> = ({ root, position }) => {
  const { backToSpace } = useStore();
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div style={{ textAlign: 'center', width: '300px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); backToSpace(); }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '12px',
            padding: '6px 16px',
            color: '#aabbdd',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '16px',
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
          &#8592; Back to Universe
        </button>
        <div
          style={{
            fontSize: '84px',
            fontFamily: "'Scheherazade New', serif",
            color: '#ffffff',
            direction: 'rtl',
            textShadow: '0 0 30px #ff9900, 0 0 60px #ff990044',
            lineHeight: 1.1,
          }}
        >
          {root.root}
        </div>
        <div style={{ fontSize: '24px', color: '#ddddff', fontStyle: 'italic', marginTop: '4px' }}>
          {root.meaning}
        </div>
      </div>
    </Html>
  );
};

const BabNode: React.FC<{ bab: Bab; position: [number, number, number]; isExpanded: boolean; onToggle: () => void }> = ({ bab, position, isExpanded, onToggle }) => {
  const color = bab.color;
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div
        onClick={onToggle}
        style={{
          width: '280px',
          background: isExpanded ? 'rgba(5, 10, 20, 0.8)' : 'rgba(10, 15, 25, 0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isExpanded ? color + 'aa' : color + '44'}`,
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          boxShadow: isExpanded ? `0 0 30px ${color}33` : `0 0 10px ${color}11`,
          transition: 'all 0.3s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = color + 'aa'}
        onMouseLeave={e => e.currentTarget.style.borderColor = isExpanded ? color + 'aa' : color + '44'}
      >
        <div style={{ fontSize: '12px', color, fontWeight: 700, letterSpacing: '0.1em' }}>FORM {bab.romanNumeral}</div>
        <div style={{ fontSize: '32px', fontFamily: "'Scheherazade New', serif", color: '#fff', textShadow: `0 0 15px ${color}`, direction: 'rtl', margin: '4px 0' }}>
          {bab.arabicPattern}
        </div>
        <div style={{ fontSize: '13px', color: '#ccc' }}>{bab.meaning}</div>
        <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', background: '#000', border: `1px solid ${color}44`, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontSize: 10 }}>
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>
    </Html>
  );
};

const TenseNode: React.FC<{ tense: Tense; position: [number, number, number]; isExpanded: boolean; onToggle: () => void }> = ({ tense, position, isExpanded, onToggle }) => {
  const color = TENSE_COLORS[tense.type] ?? '#aaaaaa';
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div
        onClick={onToggle}
        style={{
          width: '220px',
          background: isExpanded ? 'rgba(0,0,0,0.8)' : 'rgba(10,15,25,0.8)',
          backdropFilter: 'blur(8px)',
          border: `1px solid ${isExpanded ? color + '88' : color + '22'}`,
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer',
          boxShadow: isExpanded ? `0 0 20px ${color}22` : 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = color + '88'}
        onMouseLeave={e => e.currentTarget.style.borderColor = isExpanded ? color + '88' : color + '22'}
      >
        <div style={{ fontSize: '24px', fontFamily: "'Scheherazade New', serif", color: '#fff', textShadow: `0 0 10px ${color}`, direction: 'rtl' }}>{tense.arabicName}</div>
        <div style={{ fontSize: '12px', color }}>{tense.englishName}</div>
      </div>
    </Html>
  );
};

const ConjugationMatrix: React.FC<{ tense: Tense; position: [number, number, number] }> = ({ tense, position }) => {
  const color = TENSE_COLORS[tense.type] ?? '#aaaaaa';
  return (
    <Html position={position} center zIndexRange={[100, 0]}>
      <div style={{
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${color}33`,
        borderRadius: '12px',
        padding: '16px',
        width: '320px',
        boxShadow: `0 20px 40px rgba(0,0,0,0.5)`
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {tense.conjugation.map(c => (
              <tr key={c.person} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '6px', color: '#557', fontFamily: 'monospace', fontSize: '11px' }}>{c.person}</td>
                <td style={{ padding: '6px', fontFamily: "'Scheherazade New', serif", fontSize: '20px', direction: 'rtl', color: '#fff', textShadow: `0 0 6px ${color}66` }}>{c.arabic}</td>
                <td style={{ padding: '6px', color: '#aaa', fontSize: '11px' }}>{c.english}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Html>
  );
};

// ── Main Tree Layout ────────────────────────────────────────────────────────

const BAB_X_SPACING = 350;
const BAB_Y_OFFSET = -200;
const TENSE_X_SPACING = 250;
const TENSE_Y_OFFSET = -150;
const CONJ_Y_OFFSET = -250;

export const TreeView3D: React.FC = () => {
  const { selectedRoot } = useStore();
  const [expandedBabs, setExpandedBabs] = useState<Set<string>>(new Set());
  const [expandedTenses, setExpandedTenses] = useState<Set<string>>(new Set());

  const root = useMemo(() => verbRoots.find(r => r.id === selectedRoot), [selectedRoot]);

  if (!root) return null;

  const toggleBab = (id: string) => {
    setExpandedBabs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTense = (id: string) => {
    setExpandedTenses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Build Layout Coordinates
  const nodes: React.ReactNode[] = [];
  const edges: React.ReactNode[] = [];

  const rootPos: [number, number, number] = [0, 80, 0];
  nodes.push(<RootNode key="root" root={root} position={rootPos} />);

  const babs = root.babs;
  const totalBabsWidth = (babs.length - 1) * BAB_X_SPACING;
  const startBabX = -(totalBabsWidth / 2);

  babs.forEach((bab, bIdx) => {
    const babX = startBabX + (bIdx * BAB_X_SPACING);
    const babPos: [number, number, number] = [babX, rootPos[1] + BAB_Y_OFFSET, 0];
    
    // Line from Root to Bab
    edges.push(
      <Line 
        key={`e-root-bab-${bab.id}`} 
        points={[rootPos, [rootPos[0], rootPos[1] - 80, 0], [babPos[0], rootPos[1] - 80, 0], babPos]} 
        color={bab.color} 
        lineWidth={1} 
        transparent 
        opacity={0.3} 
      />
    );

    nodes.push(
      <BabNode 
        key={`bab-${bab.id}`} 
        bab={bab} 
        position={babPos} 
        isExpanded={expandedBabs.has(bab.id)} 
        onToggle={() => toggleBab(bab.id)} 
      />
    );

    if (expandedBabs.has(bab.id)) {
      const tenses = bab.tenses;
      const totalTensesWidth = (tenses.length - 1) * TENSE_X_SPACING;
      const startTenseX = babX - (totalTensesWidth / 2);

      tenses.forEach((tense, tIdx) => {
        const tenseX = startTenseX + (tIdx * TENSE_X_SPACING);
        const tensePos: [number, number, number] = [tenseX, babPos[1] + TENSE_Y_OFFSET, 0];

        // Line from Bab to Tense
        edges.push(
          <Line 
            key={`e-bab-tense-${tense.id}`} 
            points={[babPos, [babX, babPos[1] - 60, 0], [tenseX, babPos[1] - 60, 0], tensePos]} 
            color={TENSE_COLORS[tense.type] ?? '#aaa'} 
            lineWidth={1} 
            transparent 
            opacity={0.4} 
          />
        );

        nodes.push(
          <TenseNode 
            key={`tense-${tense.id}`} 
            tense={tense} 
            position={tensePos} 
            isExpanded={expandedTenses.has(tense.id)} 
            onToggle={() => toggleTense(tense.id)} 
          />
        );

        if (expandedTenses.has(tense.id)) {
          const conjPos: [number, number, number] = [tenseX, tensePos[1] + CONJ_Y_OFFSET, 0];
          
          edges.push(
            <Line 
              key={`e-tense-conj-${tense.id}`} 
              points={[tensePos, conjPos]} 
              color={TENSE_COLORS[tense.type] ?? '#aaa'} 
              lineWidth={1} 
              transparent 
              opacity={0.2} 
            />
          );

          nodes.push(
            <ConjugationMatrix 
              key={`conj-${tense.id}`} 
              tense={tense} 
              position={conjPos} 
            />
          );
        }
      });
    }
  });

  return (
    <group>
      {edges}
      {nodes}
    </group>
  );
};
