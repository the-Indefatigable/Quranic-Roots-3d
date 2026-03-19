import React, { useState } from 'react';
import { TENSE_COLORS } from '../../data/verbs';
import type { Bab, Tense, ConjugationForm } from '../../data/verbs';
import { useStore } from '../../store/useStore';

/** Inline edit popover for a single conjugation cell. */
const EditCell: React.FC<{
  conj: ConjugationForm;
  tColor: string;
  onSave: (arabic: string, transliteration: string) => void;
  onClose: () => void;
}> = ({ conj, tColor, onSave, onClose }) => {
  const [arabic, setArabic] = useState(conj.arabic);
  const [translit, setTranslit] = useState(conj.transliteration);

  return (
    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'rgba(15,15,30,0.98)', border: `1px solid ${tColor}66`, borderRadius: '12px', padding: '12px', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
      <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>Arabic</div>
      <input value={arabic} onChange={e => setArabic(e.target.value)} autoFocus
        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '20px', fontFamily: "'Scheherazade New', serif", direction: 'rtl', outline: 'none', boxSizing: 'border-box' }} />
      <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px', marginTop: '8px', textTransform: 'uppercase' }}>Transliteration</div>
      <input value={translit} onChange={e => setTranslit(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
        <button onClick={() => { onSave(arabic, translit); onClose(); }}
          style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(34,197,94,0.2)', color: '#22c55e', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Save</button>
        <button onClick={onClose}
          style={{ flex: 1, padding: '6px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.05)', color: '#888', cursor: 'pointer', fontSize: '12px' }}>Cancel</button>
      </div>
    </div>
  );
};

/** Conjugation matrix table — shared between desktop modal and mobile bottom sheet. */
export const ConjugationGrid: React.FC<{ tense: Tense; bab: Bab }> = ({ tense, bab }) => {
  const isAdmin = useStore(s => s.isAdmin);
  const tColor = TENSE_COLORS[tense.type] ?? '#ccc';
  const conjMap = new Map((tense.conjugation ?? []).map(c => [c.person, c]));
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const MATRIX_ROWS = [
    { id: '3m', label: '3rd Masc.', keys: ['3ms', '3md', '3mp'] },
    { id: '3f', label: '3rd Fem.',  keys: ['3fs', '3fd', '3fp'] },
    { id: '2m', label: '2nd Masc.', keys: ['2ms', '2md', '2mp'] },
    { id: '2f', label: '2nd Fem.',  keys: ['2fs', '2fd', '2fp'] },
    { id: '1',  label: '1st Person', keys: ['1s', null, '1p'] },
  ];
  const isAmr = tense.type === 'amr';
  const rowsToRender = isAmr ? MATRIX_ROWS.slice(2, 4) : MATRIX_ROWS;

  const handleSave = (person: string, arabic: string, transliteration: string) => {
    const conj = tense.conjugation?.find(c => c.person === person);
    if (conj) {
      conj.arabic = arabic;
      conj.transliteration = transliteration;
      forceUpdate(n => n + 1);

      // Persist to database
      const dbId = (tense as unknown as Record<string, unknown>)._tenseDbId;
      if (dbId) {
        fetch(`/api/tenses/${dbId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conjugations: tense.conjugation }),
        }).catch(console.error);
      }
    }
  };

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
            const isEditing = isAdmin && editingKey === key;
            return (
              <div key={key || `empty-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {c ? (
                  <>
                    <div style={{
                      fontFamily: isPlaceholder ? 'monospace' : "'Scheherazade New', serif",
                      fontSize: isPlaceholder ? '16px' : '26px',
                      color: isPlaceholder ? 'rgba(255,255,255,0.08)' : '#ffffff',
                      textShadow: isPlaceholder ? 'none' : `0 0 10px ${tColor}44`,
                      direction: 'rtl',
                      marginBottom: '4px',
                      cursor: isAdmin ? 'pointer' : 'default',
                      borderBottom: isAdmin ? '1px dashed rgba(34,197,94,0.3)' : 'none',
                      paddingBottom: isAdmin ? '2px' : 0,
                    }} onClick={() => isAdmin && key && setEditingKey(editingKey === key ? null : key)}>
                      {isPlaceholder ? '—' : c.arabic}
                    </div>
                    <div style={{ color: '#aaaabb', fontSize: '10px', fontStyle: 'italic', textAlign: 'center' }}>
                      {isPlaceholder ? '' : c.transliteration}
                    </div>
                    {isEditing && (
                      <EditCell conj={c} tColor={tColor} onSave={(ar, tr) => handleSave(key!, ar, tr)} onClose={() => setEditingKey(null)} />
                    )}
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
