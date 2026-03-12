import React, { useRef } from 'react';
import { useStore, verbRoots } from '../store/useStore';

export const SearchPanel: React.FC = () => {
  const { searchQuery, searchResults, setSearch, setSelectedRoot } = useStore();
  const arabicRef = useRef<HTMLInputElement>(null);

  const hasQuery = searchQuery.trim().length > 0;
  // searchResults is null when no search active, array when searching
  const matchedRoots = hasQuery && searchResults !== null
    ? verbRoots.filter((r) => searchResults.includes(r.id))
    : [];

  return (
    <div
      className="mobile-search-panel"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        width: '280px',
        background: 'rgba(5, 8, 30, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(74, 158, 255, 0.25)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,158,255,0.08)',
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .mobile-search-panel {
            top: 10px !important;
            right: 10px !important;
            left: 10px !important;
            width: auto !important;
          }
        }
      `}</style>
      <div
        style={{
          fontSize: '11px',
          color: '#4a9eff',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '12px',
          fontWeight: 600,
        }}
      >
        Search Quranic Roots
      </div>

      {/* Arabic input */}
      <div style={{ marginBottom: '8px', position: 'relative' }}>
        <input
          ref={arabicRef}
          type="text"
          dir="rtl"
          placeholder="بحث..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(74,158,255,0.3)',
            borderRadius: '8px',
            padding: '9px 12px',
            color: '#ffffff',
            fontSize: '18px',
            fontFamily: "'Scheherazade New', serif",
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(74,158,255,0.7)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(74,158,255,0.3)')}
        />
      </div>

      {/* English input */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          dir="ltr"
          placeholder="Search in English..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(74,158,255,0.3)',
            borderRadius: '8px',
            padding: '9px 12px',
            color: '#ffffff',
            fontSize: '13px',
            fontFamily: 'system-ui, sans-serif',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'rgba(74,158,255,0.7)')}
          onBlur={(e) => (e.target.style.borderColor = 'rgba(74,158,255,0.3)')}
        />
      </div>

      {/* Results chips */}
      {hasQuery && (
        <div>
          {matchedRoots.length === 0 ? (
            <div style={{ fontSize: '12px', color: '#555577', textAlign: 'center', padding: '8px 0' }}>
              No matches found
            </div>
          ) : (
            <>
              <div style={{ fontSize: '10px', color: '#555577', marginBottom: '8px', letterSpacing: '0.08em' }}>
                {matchedRoots.length} root{matchedRoots.length !== 1 ? 's' : ''} found
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {matchedRoots.map((root) => (
                  <button
                    key={root.id}
                    onClick={() => setSelectedRoot(root.id)}
                    style={{
                      background: 'rgba(74,158,255,0.12)',
                      border: '1px solid rgba(74,158,255,0.4)',
                      borderRadius: '20px',
                      padding: '6px 12px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,158,255,0.28)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,158,255,0.7)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,158,255,0.12)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,158,255,0.4)';
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        fontFamily: "'Scheherazade New', serif",
                        direction: 'rtl',
                        textShadow: '0 0 8px rgba(74,158,255,0.7)',
                      }}
                    >
                      {root.root}
                    </span>
                    <span style={{ fontSize: '11px', color: '#8ab8dd' }}>{root.meaning}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hint */}
      {!hasQuery && (
        <div style={{ fontSize: '11px', color: '#333355', lineHeight: 1.5 }}>
          Type Arabic or English to search across roots, forms and conjugations.
        </div>
      )}

      {/* Clear button */}
      {searchQuery && (
        <button
          onClick={() => setSearch('')}
          style={{
            marginTop: '10px',
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '6px',
            color: '#666688',
            fontSize: '11px',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#aaaacc')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#666688')}
        >
          Clear search
        </button>
      )}
    </div>
  );
};
