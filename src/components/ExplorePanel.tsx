import React, { useState, useMemo } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { BAB_COLORS } from '../data/verbs';

const FORMS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const TENSE_OPTS = [
  { key: 'madi',          label: 'Past (Māḍī)'        },
  { key: 'mudari',        label: 'Present (Muḍāriʿ)'  },
  { key: 'amr',           label: 'Imperative (Amr)'    },
  { key: 'passive_madi',  label: 'Pass. Past'          },
  { key: 'passive_mudari',label: 'Pass. Present'       },
];

type SortKey = 'freq' | 'alpha' | 'forms';

export const ExplorePanel: React.FC = () => {
  const { setSelectedRoot } = useStore();

  const [selectedForms, setSelectedForms]   = useState<Set<string>>(new Set());
  const [selectedTenses, setSelectedTenses] = useState<Set<string>>(new Set());
  const [minFreq, setMinFreq]               = useState(0);
  const [sortKey, setSortKey]               = useState<SortKey>('freq');
  const [search, setSearch]                 = useState('');
  const [filtersOpen, setFiltersOpen]       = useState(false);

  const toggleSet = (s: Set<string>, key: string) => {
    const next = new Set(s);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  };

  const filtered = useMemo(() => {
    let roots = [...verbRoots];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      roots = roots.filter(r =>
        r.root.includes(search.trim()) ||
        r.meaning.toLowerCase().includes(q) ||
        r.rootLetters.join('').includes(search.trim())
      );
    }

    if (selectedForms.size > 0) {
      roots = roots.filter(r => r.babs.some(b => selectedForms.has(b.form)));
    }

    if (selectedTenses.size > 0) {
      roots = roots.filter(r =>
        r.babs.some(b => b.tenses.some(t => selectedTenses.has(t.type)))
      );
    }

    if (minFreq > 0) {
      roots = roots.filter(r => (r.totalFreq ?? 0) >= minFreq);
    }

    if (sortKey === 'freq')  roots.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
    if (sortKey === 'alpha') roots.sort((a, b) => a.root.localeCompare(b.root));
    if (sortKey === 'forms') roots.sort((a, b) => b.babs.length - a.babs.length);

    return roots;
  }, [search, selectedForms, selectedTenses, minFreq, sortKey]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: '#02050f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '80px',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
            Data Explorer
          </div>
          <div style={{ fontSize: '20px', color: '#fff', fontWeight: 600 }}>
            {filtered.length} <span style={{ color: '#555577', fontWeight: 400, fontSize: '13px' }}>of {verbRoots.length} roots</span>
          </div>
        </div>
        {/* Active filter count badge */}
        {(selectedForms.size + selectedTenses.size + (minFreq > 0 ? 1 : 0) + (search ? 1 : 0)) > 0 && (
          <div style={{ fontSize: '11px', color: '#ffd700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '10px', padding: '2px 8px' }}>
            {selectedForms.size + selectedTenses.size + (minFreq > 0 ? 1 : 0) + (search ? 1 : 0)} active
          </div>
        )}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            padding: '8px 14px', borderRadius: '20px',
            border: `1px solid ${filtersOpen ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            background: filtersOpen ? 'rgba(74,158,255,0.1)' : 'transparent',
            color: filtersOpen ? '#4a9eff' : '#666688',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}
        >
          Filters {filtersOpen ? '▲' : '▼'}
        </button>
      </div>

      {/* Collapsible Filters */}
      {filtersOpen && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Arabic or English..."
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '9px 14px',
              color: '#fff', fontSize: '14px',
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />

          {/* Verb Forms */}
          <div>
            <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Verb Form</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {FORMS.map(f => {
                const active = selectedForms.has(f);
                const color = BAB_COLORS[f] ?? '#aaa';
                return (
                  <button key={f} onClick={() => setSelectedForms(toggleSet(selectedForms, f))} style={{ padding: '4px 10px', borderRadius: '16px', border: `1px solid ${active ? color + 'cc' : color + '33'}`, background: active ? color + '22' : 'transparent', color: active ? color : '#666688', cursor: 'pointer', fontSize: '11px', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
                    Form {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tenses */}
          <div>
            <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Tense</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {TENSE_OPTS.map(({ key, label }) => {
                const active = selectedTenses.has(key);
                return (
                  <button key={key} onClick={() => setSelectedTenses(toggleSet(selectedTenses, key))} style={{ padding: '4px 10px', borderRadius: '16px', border: `1px solid ${active ? 'rgba(74,158,255,0.6)' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(74,158,255,0.15)' : 'transparent', color: active ? '#4a9eff' : '#666688', cursor: 'pointer', fontSize: '11px', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort + Min Freq + Clear */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              {(['freq','alpha','forms'] as SortKey[]).map(k => (
                <button key={k} onClick={() => setSortKey(k)} style={{ padding: '4px 10px', borderRadius: '16px', border: `1px solid ${sortKey===k ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`, background: sortKey===k ? 'rgba(255,215,0,0.1)' : 'transparent', color: sortKey===k ? '#ffd700' : '#555577', cursor: 'pointer', fontSize: '11px', fontWeight: sortKey===k ? 700 : 400, transition: 'all 0.15s' }}>
                  {k === 'freq' ? '↓ Freq' : k === 'alpha' ? 'A→Z' : '↓ Forms'}
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555577', fontSize: '11px' }}>
              Min:
              <input type="number" min={0} value={minFreq} onChange={e => setMinFreq(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '52px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 7px', color: '#fff', fontSize: '11px', outline: 'none' }} />
            </label>
            {(selectedForms.size > 0 || selectedTenses.size > 0 || minFreq > 0 || search) && (
              <button onClick={() => { setSelectedForms(new Set()); setSelectedTenses(new Set()); setMinFreq(0); setSearch(''); }} style={{ padding: '4px 10px', borderRadius: '16px', border: '1px solid rgba(255,100,100,0.3)', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '11px' }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }}>
        {filtered.map((root, idx) => (
          <div
            key={root.id}
            onClick={() => setSelectedRoot(root.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ color: '#333355', fontSize: '11px', minWidth: '28px', fontFamily: 'monospace' }}>
              #{idx + 1}
            </span>
            <span style={{
              fontSize: '28px',
              fontFamily: "'Scheherazade New', serif",
              color: '#fff',
              direction: 'rtl',
              minWidth: '80px',
              textAlign: 'right',
            }}>
              {root.root}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#ccd', marginBottom: '4px' }}>{root.meaning}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {root.babs.map(b => (
                  <span key={b.id} style={{
                    fontSize: '10px',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    border: `1px solid ${b.color}44`,
                    color: b.color,
                    background: b.color + '11',
                  }}>
                    {b.romanNumeral}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '48px' }}>
              <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 600 }}>{root.totalFreq ?? 0}</div>
              <div style={{ fontSize: '10px', color: '#333355' }}>occurrences</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
