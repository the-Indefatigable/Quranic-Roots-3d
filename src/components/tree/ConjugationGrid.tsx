import React from 'react';
import { TENSE_COLORS } from '../../data/verbs';
import type { Bab, Tense } from '../../data/verbs';

/** Conjugation matrix table — shared between desktop modal and mobile bottom sheet. */
export const ConjugationGrid: React.FC<{ tense: Tense; bab: Bab }> = ({ tense, bab }) => {
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
