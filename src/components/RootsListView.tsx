/**
 * RootsListView — 2-column card grid of all roots, sorted by Quranic frequency.
 * Visually distinct from ExplorePanel (which is a filter/data table).
 * Mobile-default alternative to the 3D space.
 */
import React, { useState, useMemo } from 'react';
import { useStore, verbRoots } from '../store/useStore';

export const RootsListView: React.FC = () => {
  const { setSelectedRoot } = useStore();
  const [search, setSearch] = useState('');

  // Computed at render time (not module time) so verbRoots is already populated
  const sorted = useMemo(
    () => [...verbRoots].sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [verbRoots.length],  // re-sort if roots load later
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(r =>
      r.root.includes(search.trim()) ||
      r.meaning.toLowerCase().includes(q)
    );
  }, [search, sorted]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#02050f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '70px',
    }}>
      {/* Header + search */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(2,5,15,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
          {filtered.length} Quranic Roots
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search Arabic or English..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#fff', fontSize: '15px',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      {/* Card grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '12px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        alignContent: 'start',
      }}>
        {filtered.map((root, idx) => {
          const primaryColor = root.babs[0]?.color ?? '#4a9eff';
          return (
            <div
              key={root.id}
              onClick={() => setSelectedRoot(root.id)}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}08 0%, rgba(2,5,15,0.6) 100%)`,
                border: `1px solid ${primaryColor}28`,
                borderRadius: '18px',
                padding: '16px 12px 14px',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: '6px',
                position: 'relative',
                WebkitTapHighlightColor: 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
                minHeight: '110px',
              }}
              onTouchStart={e => { e.currentTarget.style.borderColor = primaryColor + '66'; e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor}18 0%, rgba(2,5,15,0.8) 100%)`; }}
              onTouchEnd={e => { e.currentTarget.style.borderColor = primaryColor + '28'; e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor}08 0%, rgba(2,5,15,0.6) 100%)`; }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = primaryColor + '55'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = primaryColor + '28'; }}
            >
              {/* Frequency badge top-right */}
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                fontSize: '10px', color: '#ffd700', fontWeight: 700,
                background: 'rgba(255,215,0,0.08)', borderRadius: '8px', padding: '1px 6px',
              }}>
                {root.totalFreq ?? 0}×
              </div>

              {/* Arabic root — centrepiece */}
              <div style={{
                fontSize: '42px',
                fontFamily: "'Scheherazade New', serif",
                color: '#ffffff',
                direction: 'rtl',
                textShadow: `0 0 20px ${primaryColor}55, 0 0 40px ${primaryColor}22`,
                lineHeight: 1.2,
                marginTop: '4px',
              }}>
                {root.root}
              </div>

              {/* English meaning */}
              <div style={{
                fontSize: '11px', color: '#9999bb', textAlign: 'center',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                width: '100%', paddingBottom: '2px',
              }}>
                {root.meaning}
              </div>

              {/* Form badges */}
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {root.babs.map(b => (
                  <span key={b.id} style={{
                    fontSize: '9px', padding: '1px 5px', borderRadius: '4px',
                    border: `1px solid ${b.color}44`, color: b.color, background: b.color + '11',
                  }}>
                    {b.romanNumeral}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#333355', padding: '40px 0', fontSize: '14px' }}>
            No roots found
          </div>
        )}
      </div>
    </div>
  );
};
