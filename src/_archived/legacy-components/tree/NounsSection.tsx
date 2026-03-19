import React from 'react';
import type { Bab } from '../../data/verbs';

/** Nouns display — shared between desktop and mobile tree views. */
export const NounsSection: React.FC<{ bab: Bab; color: string }> = ({ bab, color }) => {
  const hasNouns = bab.masdar || bab.faaeil || bab.mafool ||
    bab.masdarNeedsApi || bab.faaeilNeedsApi || bab.mafoolNeedsApi ||
    (bab.prepositions && bab.prepositions.length > 0);

  if (!hasNouns) return null;

  const NounItem: React.FC<{ label: string; arabic: string; value: string | null | undefined; needsApi?: boolean }> = ({ label, arabic, value, needsApi }) => {
    if (!value && !needsApi) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ minWidth: '120px', fontSize: '11px', color: '#666688' }}>
          <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '13px', color: '#aaaacc', direction: 'rtl' }}>{arabic}</span>
          {' '}{label}
        </div>
        {value ? (
          <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '22px', color: '#fff', direction: 'rtl', textShadow: `0 0 8px ${color}66` }}>{value}</span>
        ) : (
          <span style={{ fontSize: '11px', color: '#444466', fontStyle: 'italic' }}>varies by root</span>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: `1px solid ${color}22` }}>
      <div style={{ fontSize: '10px', color: color, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>
        Nouns (الأسماء)
      </div>
      <NounItem label="Verbal Noun" arabic="مصدر" value={bab.masdar} needsApi={bab.masdarNeedsApi} />
      <NounItem label="Active Participle" arabic="اسم فاعل" value={bab.faaeil} needsApi={bab.faaeilNeedsApi} />
      <NounItem label="Passive Participle" arabic="اسم مفعول" value={bab.mafool} needsApi={bab.mafoolNeedsApi} />
      {bab.prepositions && bab.prepositions.length > 0 && (
        <div style={{ paddingTop: '6px' }}>
          <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
            Particles (صِلَة)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {bab.prepositions.map((prep, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(74,158,255,0.07)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: '8px', padding: '4px 10px' }}>
                <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '17px', color: '#4a9eff', direction: 'rtl' }}>{prep.preposition}</span>
                <span style={{ fontSize: '11px', color: '#888899' }}>→ "{prep.meaning}"</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
