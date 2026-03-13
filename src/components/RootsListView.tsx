/**
 * RootsListView — flat scrollable list of all roots, sorted by Quranic frequency.
 * Mobile-default alternative to the 3D space for browsing roots.
 */
import React, { useState, useMemo } from 'react';
import { useStore, verbRoots } from '../store/useStore';

const sortedByFreq = [...verbRoots].sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));

export const RootsListView: React.FC = () => {
  const { setSelectedRoot } = useStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedByFreq;
    return sortedByFreq.filter(r =>
      r.root.includes(search.trim()) ||
      r.meaning.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#02050f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '70px',
    }}>
      {/* Search bar */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(2,5,15,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search Arabic or English..."
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '10px 14px',
            color: '#fff', fontSize: '15px',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />
        <div style={{ fontSize: '11px', color: '#333355', marginTop: '6px', paddingLeft: '4px' }}>
          {filtered.length} roots · sorted by Quranic frequency
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {filtered.map((root, idx) => (
          <div
            key={root.id}
            onClick={() => setSelectedRoot(root.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
            onTouchStart={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Rank */}
            <span style={{ color: '#222244', fontSize: '11px', minWidth: '26px', fontFamily: 'monospace', flexShrink: 0 }}>
              {idx + 1}
            </span>

            {/* Arabic root */}
            <span style={{
              fontSize: '30px', fontFamily: "'Scheherazade New', serif",
              color: '#fff', direction: 'rtl',
              minWidth: '72px', textAlign: 'right', flexShrink: 0,
              textShadow: '0 0 12px rgba(255,153,0,0.25)',
            }}>
              {root.root}
            </span>

            {/* Meaning + form badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', color: '#ccd', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {root.meaning}
              </div>
              <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
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

            {/* Frequency */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '14px', color: '#ffd700', fontWeight: 600 }}>{root.totalFreq ?? 0}</div>
              <div style={{ fontSize: '9px', color: '#333355' }}>times</div>
            </div>

            <span style={{ color: '#333355', fontSize: '14px', flexShrink: 0 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
};
