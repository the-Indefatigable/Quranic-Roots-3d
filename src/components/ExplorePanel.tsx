import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { BAB_COLORS } from '../data/verbs';
import { SURAHS, SURAH_MAP } from '../data/surahs';

const FORMS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
const TENSE_OPTS = [
  { key: 'madi',          label: 'Past (Māḍī)'       },
  { key: 'mudari',        label: 'Present (Muḍāriʿ)' },
  { key: 'amr',           label: 'Imperative (Amr)'  },
  { key: 'passive_madi',  label: 'Pass. Past'         },
  { key: 'passive_mudari',label: 'Pass. Present'      },
];

type SortKey = 'freq' | 'alpha' | 'forms' | 'surah';

// Precomputed surahIndex loaded from public/data/surahIndex.json
// Format: { [surahNum]: { [rootId]: firstAyah } }
type RawSurahIndex = Record<string, Record<string, number>>;
let cachedSurahIndex: Map<number, Map<string, number>> | null = null;
let surahIndexLoading = false;
const surahIndexCallbacks: Array<() => void> = [];

function loadSurahIndex(onReady: () => void) {
  if (cachedSurahIndex) { onReady(); return; }
  surahIndexCallbacks.push(onReady);
  if (surahIndexLoading) return;
  surahIndexLoading = true;
  fetch('/data/surahIndex.json')
    .then(r => r.json() as Promise<RawSurahIndex>)
    .then(raw => {
      const idx = new Map<number, Map<string, number>>();
      for (const [s, roots] of Object.entries(raw)) {
        const m = new Map<string, number>();
        for (const [rootId, ayah] of Object.entries(roots)) m.set(rootId, ayah);
        idx.set(Number(s), m);
      }
      cachedSurahIndex = idx;
      surahIndexCallbacks.forEach(cb => cb());
      surahIndexCallbacks.length = 0;
    })
    .catch(() => { surahIndexLoading = false; });
}

export const ExplorePanel: React.FC = () => {
  const { setSelectedRoot } = useStore();

  const [selectedForms, setSelectedForms]   = useState<Set<string>>(new Set());
  const [selectedTenses, setSelectedTenses] = useState<Set<string>>(new Set());
  const [minFreq, setMinFreq]               = useState(0);
  const [sortKey, setSortKey]               = useState<SortKey>('freq');
  const [search, setSearch]                 = useState('');
  const [filtersOpen, setFiltersOpen]       = useState(false);
  const [surahMode, setSurahMode]           = useState(false);
  const [selectedSurah, setSelectedSurah]   = useState<number | null>(null);
  const [surahSearch, setSurahSearch]       = useState('');
  const [surahIndexReady, setSurahIndexReady] = useState(!!cachedSurahIndex);

  const toggleSet = (s: Set<string>, key: string) => {
    const next = new Set(s); next.has(key) ? next.delete(key) : next.add(key); return next;
  };

  // Load surahIndex lazily when user opens surah mode
  useEffect(() => {
    if (surahMode && !surahIndexReady) {
      loadSurahIndex(() => setSurahIndexReady(true));
    }
  }, [surahMode, surahIndexReady]);

  const surahIndex = surahIndexReady ? cachedSurahIndex! : new Map<number, Map<string, number>>();

  // How many roots appear in each surah (for badge)
  const surahRootCount = useMemo(() => {
    const counts = new Map<number, number>();
    surahIndex.forEach((rootMap, s) => counts.set(s, rootMap.size));
    return counts;
  }, [surahIndex]);

  // Filtered + sorted roots
  const { filtered, surahFirstAyah } = useMemo(() => {
    let roots = [...verbRoots];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      roots = roots.filter(r =>
        r.root.includes(search.trim()) ||
        r.meaning.toLowerCase().includes(q) ||
        r.rootLetters.join('').includes(search.trim())
      );
    }
    if (selectedForms.size > 0)
      roots = roots.filter(r => r.babs.some(b => selectedForms.has(b.form)));
    if (selectedTenses.size > 0)
      roots = roots.filter(r => r.babs.some(b => b.tenses?.some(t => selectedTenses.has(t.type))));
    if (minFreq > 0)
      roots = roots.filter(r => (r.totalFreq ?? 0) >= minFreq);

    // Surah filter — restrict to roots in selected surah
    let surahFirstAyah: Map<string, number> | null = null;
    if (selectedSurah !== null) {
      const rootMap = surahIndex.get(selectedSurah) ?? new Map<string, number>();
      surahFirstAyah = rootMap;
      roots = roots.filter(r => rootMap.has(r.id));
    }

    // Sort
    const sk = selectedSurah !== null ? 'surah' : sortKey;
    if (sk === 'surah' && surahFirstAyah) {
      roots.sort((a, b) => (surahFirstAyah!.get(a.id) ?? 999) - (surahFirstAyah!.get(b.id) ?? 999));
    } else if (sk === 'freq')  roots.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
    else if (sk === 'alpha')   roots.sort((a, b) => a.root.localeCompare(b.root));
    else if (sk === 'forms')   roots.sort((a, b) => b.babs.length - a.babs.length);

    return { filtered: roots, surahFirstAyah };
  }, [search, selectedForms, selectedTenses, minFreq, sortKey, selectedSurah, surahIndex]);

  // Surah picker list
  const filteredSurahs = useMemo(() => {
    const q = surahSearch.trim().toLowerCase();
    return SURAHS.filter(s =>
      !q ||
      s.english.toLowerCase().includes(q) ||
      s.arabic.includes(q) ||
      String(s.number).startsWith(q)
    );
  }, [surahSearch]);

  const activeFilterCount =
    selectedForms.size + selectedTenses.size +
    (minFreq > 0 ? 1 : 0) + (search ? 1 : 0) + (selectedSurah !== null ? 1 : 0);

  const clearAll = () => {
    setSelectedForms(new Set()); setSelectedTenses(new Set());
    setMinFreq(0); setSearch(''); setSelectedSurah(null); setSurahSearch(''); setSurahMode(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: '#02050f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '80px',
    }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
            Data Explorer
          </div>
          <div style={{ fontSize: '20px', color: '#fff', fontWeight: 600 }}>
            {filtered.length}
            <span style={{ color: '#555577', fontWeight: 400, fontSize: '13px' }}> of {verbRoots.length} roots</span>
            {selectedSurah !== null && (
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 400, marginLeft: '8px' }}>
                · {SURAH_MAP.get(selectedSurah)?.english}
              </span>
            )}
          </div>
        </div>
        {activeFilterCount > 0 && (
          <div style={{ fontSize: '11px', color: '#ffd700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)', borderRadius: '10px', padding: '2px 8px', flexShrink: 0 }}>
            {activeFilterCount} active
          </div>
        )}
        <button
          onClick={() => setFiltersOpen(o => !o)}
          style={{
            padding: '8px 14px', borderRadius: '20px', flexShrink: 0,
            border: `1px solid ${filtersOpen ? 'rgba(74,158,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
            background: filtersOpen ? 'rgba(74,158,255,0.1)' : 'transparent',
            color: filtersOpen ? '#4a9eff' : '#666688',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
          }}
        >
          Filters {filtersOpen ? '▲' : '▼'}
        </button>
      </div>

      {/* ── Collapsible Filters ── */}
      {filtersOpen && (
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0, overflowY: 'auto', maxHeight: '55vh' }}>

          {/* Search */}
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search Arabic or English..."
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 14px', color: '#fff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' }}
          />

          {/* ── Surah filter ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em' }}>By Surah</div>
              {selectedSurah !== null && (
                <button onClick={() => { setSelectedSurah(null); setSurahSearch(''); setSurahMode(false); }}
                  style={{ fontSize: '11px', color: '#ff6b6b', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
                  Clear ✕
                </button>
              )}
            </div>

            {/* Active surah pill */}
            {selectedSurah !== null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.4)', borderRadius: '12px' }}>
                <span style={{ color: '#a78bfa', fontFamily: "'Scheherazade New', serif", fontSize: '20px', direction: 'rtl' }}>
                  {SURAH_MAP.get(selectedSurah)?.arabic}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#c4b5fd', fontWeight: 600 }}>
                    {SURAH_MAP.get(selectedSurah)?.english}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666688' }}>
                    Surah {selectedSurah} · {surahRootCount.get(selectedSurah) ?? 0} roots
                  </div>
                </div>
                <button onClick={() => setSurahMode(m => !m)}
                  style={{ fontSize: '11px', color: '#a78bfa', background: 'transparent', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', padding: '3px 8px', cursor: 'pointer' }}>
                  Change
                </button>
              </div>
            ) : (
              <button onClick={() => setSurahMode(m => !m)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px dashed rgba(167,139,250,0.3)', background: 'transparent', color: '#666688', cursor: 'pointer', fontSize: '13px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>📖</span> Browse roots by Surah…
              </button>
            )}

            {/* Surah picker dropdown */}
            {surahMode && (
              <div style={{ marginTop: '8px', background: 'rgba(5,5,20,0.95)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <input
                    autoFocus
                    type="text" value={surahSearch} onChange={e => setSurahSearch(e.target.value)}
                    placeholder="Search surah name or number…"
                    style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div style={{ maxHeight: '220px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  {filteredSurahs.map(surah => {
                    const count = surahRootCount.get(surah.number) ?? 0;
                    if (count === 0) return null;
                    const isSelected = selectedSurah === surah.number;
                    return (
                      <div
                        key={surah.number}
                        onClick={() => { setSelectedSurah(surah.number); setSurahMode(false); setSurahSearch(''); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 14px', cursor: 'pointer',
                          background: isSelected ? 'rgba(167,139,250,0.12)' : 'transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = isSelected ? 'rgba(167,139,250,0.12)' : 'transparent'}
                      >
                        {/* Number */}
                        <span style={{ fontSize: '11px', color: '#555577', fontFamily: 'monospace', minWidth: '24px', textAlign: 'right' }}>
                          {surah.number}
                        </span>
                        {/* Arabic name */}
                        <span style={{ fontSize: '18px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', minWidth: '72px', textAlign: 'right' }}>
                          {surah.arabic}
                        </span>
                        {/* English name */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: isSelected ? '#c4b5fd' : '#ccd' }}>{surah.english}</div>
                          <div style={{ fontSize: '10px', color: '#444466' }}>{surah.verses} verses</div>
                        </div>
                        {/* Root count */}
                        <span style={{ fontSize: '11px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderRadius: '8px', padding: '2px 8px', flexShrink: 0 }}>
                          {count} roots
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Verb Forms */}
          <div>
            <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Verb Form</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {FORMS.map(f => {
                const active = selectedForms.has(f);
                const color = BAB_COLORS[f] ?? '#aaa';
                return (
                  <button key={f} onClick={() => setSelectedForms(toggleSet(selectedForms, f))}
                    style={{ padding: '4px 10px', borderRadius: '16px', border: `1px solid ${active ? color + 'cc' : color + '33'}`, background: active ? color + '22' : 'transparent', color: active ? color : '#666688', cursor: 'pointer', fontSize: '11px', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
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
                  <button key={key} onClick={() => setSelectedTenses(toggleSet(selectedTenses, key))}
                    style={{ padding: '4px 10px', borderRadius: '16px', border: `1px solid ${active ? 'rgba(74,158,255,0.6)' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(74,158,255,0.15)' : 'transparent', color: active ? '#4a9eff' : '#666688', cursor: 'pointer', fontSize: '11px', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
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
                <button key={k} onClick={() => setSortKey(k)}
                  style={{ padding: '4px 10px', borderRadius: '16px', border: `1px solid ${sortKey===k && selectedSurah===null ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.08)'}`, background: sortKey===k && selectedSurah===null ? 'rgba(255,215,0,0.1)' : 'transparent', color: sortKey===k && selectedSurah===null ? '#ffd700' : '#555577', cursor: 'pointer', fontSize: '11px', fontWeight: sortKey===k ? 700 : 400, transition: 'all 0.15s' }}>
                  {k === 'freq' ? '↓ Freq' : k === 'alpha' ? 'A→Z' : '↓ Forms'}
                </button>
              ))}
              {selectedSurah !== null && (
                <div style={{ padding: '4px 10px', borderRadius: '16px', border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '11px', fontWeight: 700 }}>
                  ↓ Ayah order
                </div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#555577', fontSize: '11px' }}>
              Min:
              <input type="number" min={0} value={minFreq} onChange={e => setMinFreq(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '52px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '3px 7px', color: '#fff', fontSize: '11px', outline: 'none' }} />
            </label>
            {activeFilterCount > 0 && (
              <button onClick={clearAll}
                style={{ padding: '4px 10px', borderRadius: '16px', border: '1px solid rgba(255,100,100,0.3)', background: 'transparent', color: '#ff6b6b', cursor: 'pointer', fontSize: '11px' }}>
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Results list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#333355', padding: '48px 0', fontSize: '14px' }}>No roots match</div>
        )}
        {filtered.map((root, idx) => {
          const firstAyah = selectedSurah !== null ? surahFirstAyah?.get(root.id) : undefined;
          return (
            <div
              key={root.id}
              onClick={() => setSelectedRoot(root.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onTouchStart={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Index / ayah marker */}
              <div style={{ minWidth: '32px', textAlign: 'right', flexShrink: 0 }}>
                {firstAyah !== undefined ? (
                  <div style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderRadius: '6px', padding: '2px 5px', fontFamily: 'monospace' }}>
                    :{firstAyah}
                  </div>
                ) : (
                  <span style={{ color: '#333355', fontSize: '11px', fontFamily: 'monospace' }}>#{idx+1}</span>
                )}
              </div>

              {/* Arabic root */}
              <span style={{ fontSize: '28px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', minWidth: '76px', textAlign: 'right', flexShrink: 0 }}>
                {root.root}
              </span>

              {/* Meaning + badges */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#ccd', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {root.meaning}
                </div>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {root.babs.map(b => (
                    <span key={b.id} style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', border: `1px solid ${b.color}44`, color: b.color, background: b.color + '11' }}>
                      {b.romanNumeral}
                    </span>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div style={{ textAlign: 'right', minWidth: '44px', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 600 }}>{root.totalFreq ?? 0}</div>
                <div style={{ fontSize: '9px', color: '#333355' }}>times</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
