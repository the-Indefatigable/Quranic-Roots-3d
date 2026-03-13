import React, { useState } from 'react';
import { TENSE_COLORS } from '../data/verbs';
import type { Bab, Tense } from '../data/verbs';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

export const MobileDrillDown: React.FC<{ root: any; backToSpace: () => void; visible: boolean }> = ({ root, backToSpace, visible }) => {
  const [selectedBab, setSelectedBab] = useState<Bab | null>(null);
  const [selectedTense, setSelectedTense] = useState<{ tense: Tense; bab: Bab } | null>(null);

  // Swipe handlers for navigating back
  useSwipeGesture({
    onSwipeRight: () => {
      if (selectedTense) {
        setSelectedTense(null);
      } else if (selectedBab) {
        setSelectedBab(null);
      } else {
        backToSpace();
      }
    },
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900, background: '#02050f',
      overflowY: 'auto', overflowX: 'hidden', paddingBottom: '40px',
      color: '#fff', scrollbarWidth: 'none',
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(20px)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>
      {/* Header / Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: 'rgba(2, 5, 15, 0.9)',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        {selectedTense ? (
          <button onClick={() => setSelectedTense(null)} style={{ background: 'transparent', border: 'none', color: '#4a9eff', fontSize: '24px', padding: 0 }}>←</button>
        ) : selectedBab ? (
          <button onClick={() => setSelectedBab(null)} style={{ background: 'transparent', border: 'none', color: '#4a9eff', fontSize: '24px', padding: 0 }}>←</button>
        ) : (
          <button onClick={backToSpace} style={{ background: 'transparent', border: 'none', color: '#4a9eff', fontSize: '24px', padding: 0 }}>←</button>
        )}
        <div style={{ flex: 1, textAlign: 'center', fontSize: '18px', fontWeight: 600, letterSpacing: '2px', fontFamily: "'Scheherazade New', serif", direction: 'rtl' }}>
          {selectedTense ? selectedTense.tense.arabicName : selectedBab ? selectedBab.arabicPattern : root.root}
        </div>
        <div style={{ width: '24px' }} /> {/* Spacer */}
      </div>

      <div style={{ padding: '20px', animation: 'fadeIn 0.3s ease-out' }}>
        {/* VIEW 1: Root Details & Babs List */}
        {!selectedBab && !selectedTense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Root Info */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '64px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', textShadow: '0 0 20px rgba(255,153,0,0.5)', lineHeight: 1 }}>{root.root}</div>
              <div style={{ fontSize: '18px', color: '#ddddff', marginTop: '12px', fontStyle: 'italic' }}>{root.meaning}</div>
            </div>

            <div style={{ fontSize: '12px', color: '#888899', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, paddingLeft: '4px' }}>Forms (Babs)</div>
            
            {/* Babs List */}
            {root.babs.map((bab: Bab) => (
              <div key={bab.id} onClick={() => setSelectedBab(bab)} style={{
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${bab.color}44`, borderLeft: `4px solid ${bab.color}`,
                borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: bab.color, fontWeight: 600, marginBottom: '4px' }}>Form {bab.romanNumeral}</div>
                  <div style={{ fontSize: '28px', fontFamily: "'Scheherazade New', serif", direction: 'rtl' }}>{bab.arabicPattern}</div>
                  <div style={{ fontSize: '14px', color: '#ccc', marginTop: '4px' }}>{bab.verbMeaning || bab.meaning}</div>
                </div>
                <div style={{ color: '#666', fontSize: '20px' }}>›</div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: Bab Details & Tenses List */}
        {selectedBab && !selectedTense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'slideLeft 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: `1px solid ${selectedBab.color}33` }}>
               <div style={{ fontSize: '12px', color: selectedBab.color, fontWeight: 600, marginBottom: '8px' }}>Form {selectedBab.romanNumeral}</div>
               <div style={{ fontSize: '48px', fontFamily: "'Scheherazade New', serif", direction: 'rtl', color: '#fff' }}>{selectedBab.arabicPattern}</div>
               <div style={{ fontSize: '16px', color: '#e8eeff', marginTop: '12px', fontStyle: 'italic' }}>"{selectedBab.verbMeaning || selectedBab.meaning}"</div>
            </div>

            <div style={{ fontSize: '12px', color: '#888899', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, paddingLeft: '4px' }}>Tenses</div>

            {selectedBab.tenses.map((tense: Tense) => {
               const tnColor = TENSE_COLORS[tense.type] ?? '#aaaaaa';
               return (
                 <div key={tense.id} onClick={() => setSelectedTense({ tense, bab: selectedBab })} style={{
                   background: 'rgba(255,255,255,0.03)', border: `1px solid ${tnColor}33`, borderLeft: `4px solid ${tnColor}88`,
                   borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                 }}>
                   <div>
                     <div style={{ fontSize: '24px', fontFamily: "'Scheherazade New', serif", direction: 'rtl', color: '#fff' }}>{tense.arabicName}</div>
                     <div style={{ fontSize: '13px', color: tnColor, marginTop: '4px' }}>{tense.englishName}</div>
                   </div>
                   <div style={{ color: '#666', fontSize: '20px' }}>›</div>
                 </div>
               );
            })}
          </div>
        )}

        {/* VIEW 3: Conjugation Matrix (Mobile Optimized) */}
        {selectedTense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '36px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', textShadow: `0 0 15px ${TENSE_COLORS[selectedTense.tense.type] ?? '#ccc'}` }}>
                  {selectedTense.tense.arabicName}
                </h2>
                <div style={{ color: TENSE_COLORS[selectedTense.tense.type] ?? '#ccc', fontSize: '16px', marginTop: '8px', fontWeight: 600 }}>
                  {selectedTense.tense.englishName}
                </div>
            </div>

            {(() => {
              const conjMap = new Map(selectedTense.tense.conjugation.map(c => [c.person, c]));
              const MATRIX_ROWS = [
                { id: '3m', label: '3rd Masc.', keys: ['3ms', '3md', '3mp'] },
                { id: '3f', label: '3rd Fem.',  keys: ['3fs', '3fd', '3fp'] },
                { id: '2m', label: '2nd Masc.', keys: ['2ms', '2md', '2mp'] },
                { id: '2f', label: '2nd Fem.',  keys: ['2fs', '2fd', '2fp'] },
                { id: '1',  label: '1st Person', keys: ['1s', null, '1p'] },
              ];
              const isAmr = selectedTense.tense.type === 'amr';
              const rowsToRender = isAmr ? MATRIX_ROWS.slice(2, 4) : MATRIX_ROWS;
              const tColor = TENSE_COLORS[selectedTense.tense.type] ?? '#ccc';

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {rowsToRender.map(row => (
                    <div key={row.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>
                       <div style={{ fontSize: '12px', color: '#888899', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                         {row.label}
                       </div>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          {row.keys.map((key, i) => {
                             const c = key ? conjMap.get(key) : null;
                             const isPlaceholder = !c || c.arabic === '-';
                             const colLabels = ['Singular', 'Dual', 'Plural'];
                             return (
                               <div key={key || `empty-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                 <div style={{ fontSize: '10px', color: '#555566', marginBottom: '8px', textTransform: 'uppercase' }}>{colLabels[i]}</div>
                                 {c ? (
                                   <>
                                     <div style={{ fontFamily: isPlaceholder ? 'monospace' : "'Scheherazade New', serif", fontSize: isPlaceholder ? '16px' : '26px', color: isPlaceholder ? 'rgba(255,255,255,0.1)' : '#fff', direction: 'rtl', textShadow: isPlaceholder ? 'none' : `0 0 10px ${tColor}44`, marginBottom: '4px' }}>
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
                    </div>
                  ))}
                </div>
              );
            })()}

          </div>
        )}
      </div>
      <style>{`
        @keyframes slideLeft { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};
