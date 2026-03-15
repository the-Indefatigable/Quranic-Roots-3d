import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { BAB_COLORS } from '../data/verbs';
import { SURAHS, SURAH_MAP } from '../data/surahs';

// Form info: Arabic pattern + beginner-friendly description
const FORM_INFO: Record<string, { pattern: string; desc: string }> = {
  'I':    { pattern: 'فَعَلَ',       desc: 'Base meaning'     },
  'II':   { pattern: 'فَعَّلَ',      desc: 'Intensive'        },
  'III':  { pattern: 'فَاعَلَ',      desc: 'Mutual action'    },
  'IV':   { pattern: 'أَفْعَلَ',     desc: 'Causative'        },
  'V':    { pattern: 'تَفَعَّلَ',    desc: 'Reflexive of II'  },
  'VI':   { pattern: 'تَفَاعَلَ',    desc: 'Mutual/Pretend'   },
  'VII':  { pattern: 'اِنْفَعَلَ',    desc: 'Passive'          },
  'VIII': { pattern: 'اِفْتَعَلَ',    desc: 'Reflexive'        },
  'IX':   { pattern: 'اِفْعَلَّ',     desc: 'Color/State'      },
  'X':    { pattern: 'اِسْتَفْعَلَ',  desc: 'To seek/consider' },
};

const TENSE_OPTS = [
  { key: 'madi',          label: 'Past',         arabic: 'ماضٍ'          },
  { key: 'mudari',        label: 'Present',      arabic: 'مُضَارِع'      },
  { key: 'amr',           label: 'Imperative',   arabic: 'أَمْر'         },
  { key: 'passive_madi',  label: 'Pass. Past',   arabic: 'مجهول ماضٍ'    },
  { key: 'passive_mudari',label: 'Pass. Present',arabic: 'مجهول مضارع'   },
];

type SortKey = 'freq' | 'alpha' | 'forms' | 'surah';
type QuickFilter = 'all' | 50 | 100 | 300;

// ── Surah index (lazy-loaded, promise-cached) ────────────────────────────────
type RawSurahIndex = Record<string, Record<string, number>>;
type SurahIndex = Map<number, Map<string, number>>;
let surahIndexPromise: Promise<SurahIndex> | null = null;

function fetchSurahIndex(): Promise<SurahIndex> {
  if (!surahIndexPromise) {
    surahIndexPromise = fetch('/data/surahIndex.json')
      .then(r => r.json() as Promise<RawSurahIndex>)
      .then(raw => {
        const idx: SurahIndex = new Map();
        for (const [s, roots] of Object.entries(raw)) {
          const m = new Map<string, number>();
          for (const [rootId, ayah] of Object.entries(roots)) m.set(rootId, ayah);
          idx.set(Number(s), m);
        }
        return idx;
      })
      .catch(() => {
        surahIndexPromise = null; // allow retry on failure
        return new Map() as SurahIndex;
      });
  }
  return surahIndexPromise;
}

export const ExplorePanel: React.FC = () => {
  const setSelectedRoot  = useStore(s => s.setSelectedRoot);
  const setViewMode      = useStore(s => s.setViewMode);
  const setSpaceView     = useStore(s => s.setSpaceView);
  const setFilteredRoots = useStore(s => s.setFilteredRoots);

  const [selectedForms, setSelectedForms]   = useState<Set<string>>(new Set());
  const [selectedTenses, setSelectedTenses] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey]               = useState<SortKey>('freq');
  const [search, setSearch]                 = useState('');
  const [quickFilter, setQuickFilter]       = useState<QuickFilter>('all');
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [showForms, setShowForms]           = useState(false);
  const [surahPickerOpen, setSurahPickerOpen] = useState(false);
  const [selectedSurah, setSelectedSurah]   = useState<number | null>(null);
  const [surahSearch, setSurahSearch]       = useState('');
  const [surahIndex, setSurahIndex] = useState<SurahIndex>(new Map());
  const searchRef = useRef<HTMLInputElement>(null);

  const toggleSet = (s: Set<string>, key: string) => {
    const next = new Set(s); next.has(key) ? next.delete(key) : next.add(key); return next;
  };

  useEffect(() => {
    if (surahPickerOpen && surahIndex.size === 0) {
      fetchSurahIndex().then(idx => { if (idx.size > 0) setSurahIndex(idx); });
    }
  }, [surahPickerOpen, surahIndex.size]);

  const surahRootCount = useMemo(() => {
    const counts = new Map<number, number>();
    surahIndex.forEach((rootMap, s) => counts.set(s, rootMap.size));
    return counts;
  }, [surahIndex]);

  // Top-N roots by frequency for quick filter
  const topNIds = useMemo(() => {
    if (quickFilter === 'all') return null;
    const sorted = [...verbRoots].sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0)).slice(0, quickFilter);
    return new Set(sorted.map(r => r.id));
  }, [quickFilter]);

  const { filtered, surahFirstAyah } = useMemo(() => {
    let roots = [...verbRoots];

    if (topNIds) roots = roots.filter(r => topNIds.has(r.id));
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

    let surahFirstAyah: Map<string, number> | null = null;
    if (selectedSurah !== null) {
      const rootMap = surahIndex.get(selectedSurah) ?? new Map<string, number>();
      surahFirstAyah = rootMap;
      roots = roots.filter(r => rootMap.has(r.id));
    }

    const sk = selectedSurah !== null ? 'surah' : sortKey;
    if (sk === 'surah' && surahFirstAyah) {
      roots.sort((a, b) => (surahFirstAyah!.get(a.id) ?? 999) - (surahFirstAyah!.get(b.id) ?? 999));
    } else if (sk === 'freq')  roots.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
    else if (sk === 'alpha')   roots.sort((a, b) => a.root.localeCompare(b.root));
    else if (sk === 'forms')   roots.sort((a, b) => b.babs.length - a.babs.length);

    return { filtered: roots, surahFirstAyah };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedForms, selectedTenses, sortKey, selectedSurah, surahIndex, topNIds, verbRoots.length]);

  // Publish filtered list to store so TreeView can use it for prev/next
  useEffect(() => {
    setFilteredRoots(filtered.map(r => r.id));
  }, [filtered, setFilteredRoots]);

  const filteredSurahs = useMemo(() => {
    const q = surahSearch.trim().toLowerCase();
    return SURAHS.filter(s =>
      !q || s.english.toLowerCase().includes(q) || s.arabic.includes(q) || String(s.number).startsWith(q)
    );
  }, [surahSearch]);

  const hasFilters = selectedForms.size > 0 || selectedTenses.size > 0 || search || selectedSurah !== null || quickFilter !== 'all';

  const clearAll = () => {
    setSelectedForms(new Set()); setSelectedTenses(new Set());
    setSearch(''); setSelectedSurah(null); setSurahSearch(''); setSurahPickerOpen(false);
    setQuickFilter('all');
  };

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const activeFilterCount =
    selectedForms.size + selectedTenses.size +
    (quickFilter !== 'all' ? 1 : 0) +
    (selectedSurah !== null ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: '#02050f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '72px',
    }}>

      {/* ── Sticky Header ── */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
        background: 'rgba(2,5,15,0.95)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
            Explore
          </div>
          <div style={{ fontSize: '18px', color: '#fff', fontWeight: 600, marginTop: '1px' }}>
            {filtered.length}
            <span style={{ color: '#444466', fontWeight: 400, fontSize: '12px' }}> / {verbRoots.length} roots</span>
          </div>
        </div>

        {/* Filter button */}
        <button
          onClick={() => setShowFilterSheet(true)}
          style={{
            height: '36px', padding: '0 14px', borderRadius: '18px', cursor: 'pointer',
            border: `1px solid ${activeFilterCount > 0 ? 'rgba(74,158,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
            background: activeFilterCount > 0 ? 'rgba(74,158,255,0.12)' : 'rgba(255,255,255,0.04)',
            color: activeFilterCount > 0 ? '#4a9eff' : '#888899',
            fontSize: '13px', fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
          ⊞ Filter
          {activeFilterCount > 0 && (
            <span style={{ background: '#4a9eff', color: '#000', borderRadius: '10px', fontSize: '10px', fontWeight: 700, padding: '1px 6px', lineHeight: 1.4 }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button onClick={clearAll} style={{ fontSize: '11px', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '10px', padding: '4px 10px', cursor: 'pointer', flexShrink: 0 }}>
            ✕
          </button>
        )}

        <button
          onClick={() => { setSpaceView('3d'); setViewMode('space'); }}
          style={{ height: '36px', padding: '0 14px', borderRadius: '18px', border: '1px solid rgba(74,158,255,0.3)', background: 'rgba(74,158,255,0.08)', color: '#4a9eff', cursor: 'pointer', fontSize: '12px', fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
          ✦ 3D
        </button>
      </div>

      {/* ── Results sub-header (sort + count) ── */}
      <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize: '12px', color: '#444466', flex: 1 }}>
          {filtered.length} root{filtered.length !== 1 ? 's' : ''}
          {selectedSurah !== null && <span style={{ color: '#a78bfa' }}> · {SURAH_MAP.get(selectedSurah)?.english} · sorted by ayah</span>}
        </span>
        {selectedSurah === null && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {([['freq', '↓ Freq'], ['alpha', 'A→Z'], ['forms', '⊞ Forms']] as [SortKey, string][]).map(([k, lbl]) => (
              <button key={k} onClick={() => setSortKey(k)}
                style={{ padding: '4px 10px', borderRadius: '12px', border: `1px solid ${sortKey === k ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.07)'}`, background: sortKey === k ? 'rgba(255,215,0,0.08)' : 'transparent', color: sortKey === k ? '#ffd700' : '#444466', cursor: 'pointer', fontSize: '11px', fontWeight: sortKey === k ? 700 : 400, transition: 'all 0.15s' }}>
                {lbl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Results list ── */}
      <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#333355', padding: '48px 0', fontSize: '14px' }}>No roots match</div>
        )}
        {filtered.map((root, idx) => {
          const firstAyah = selectedSurah !== null ? surahFirstAyah?.get(root.id) : undefined;
          return (
            <div key={root.id} onClick={() => setSelectedRoot(root.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onTouchStart={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onTouchEnd={e => e.currentTarget.style.background = 'transparent'}>

              <div style={{ minWidth: '30px', textAlign: 'right', flexShrink: 0 }}>
                {firstAyah !== undefined ? (
                  <div style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderRadius: '5px', padding: '1px 5px', fontFamily: 'monospace' }}>:{firstAyah}</div>
                ) : (
                  <span style={{ color: '#2a2a44', fontSize: '10px', fontFamily: 'monospace' }}>#{idx + 1}</span>
                )}
              </div>

              <span style={{ fontSize: '28px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>
                {root.root}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#ccd', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {root.meaning}
                </div>
                <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                  {root.babs.map(b => (
                    <span key={b.id} style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', border: `1px solid ${b.color}44`, color: b.color, background: b.color + '11' }}>
                      {b.romanNumeral}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'right', minWidth: '40px', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 600 }}>{root.totalFreq ?? 0}</div>
                <div style={{ fontSize: '9px', color: '#2a2a44' }}>times</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Sheet (full-screen overlay) ── */}
      {showFilterSheet && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 800,
          background: '#02050f',
          display: 'flex', flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          animation: 'slideUp 0.25s ease',
        }}>
          <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

          {/* Sheet header */}
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ flex: 1, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Filters</div>
            {hasFilters && (
              <button onClick={clearAll} style={{ fontSize: '11px', color: '#ff6b6b', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', borderRadius: '10px', padding: '4px 10px', cursor: 'pointer' }}>
                Clear all
              </button>
            )}
            <button onClick={() => setShowFilterSheet(false)}
              style={{ height: '36px', padding: '0 18px', borderRadius: '18px', border: '1px solid rgba(74,158,255,0.4)', background: 'rgba(74,158,255,0.12)', color: '#4a9eff', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
              Done
            </button>
          </div>

          {/* Sheet body — scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

            {/* Search */}
            <div style={{ padding: '16px 20px 0' }}>
              <div style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>Search</div>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', opacity: 0.4 }}>🔍</span>
                <input
                  ref={searchRef}
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search a root or meaning…"
                  style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px 10px 36px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(74,158,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                {search && (
                  <button onClick={() => setSearch('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}>✕</button>
                )}
              </div>
            </div>

            {/* Quick filters */}
            <div style={{ padding: '16px 20px 0' }}>
              <div style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '8px' }}>Show</div>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                {(['all', 50, 100, 300] as QuickFilter[]).map(f => {
                  const active = quickFilter === f;
                  return (
                    <button key={String(f)} onClick={() => setQuickFilter(f)}
                      style={{ padding: '7px 16px', borderRadius: '16px', border: `1px solid ${active ? 'rgba(74,158,255,0.5)' : 'rgba(255,255,255,0.08)'}`, background: active ? 'rgba(74,158,255,0.12)' : 'transparent', color: active ? '#4a9eff' : '#555577', cursor: 'pointer', fontSize: '13px', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
                      {f === 'all' ? 'All roots' : `Top ${f}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verb Form */}
            <div style={{ padding: '16px 20px 0' }}>
              <button onClick={() => setShowForms(o => !o)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Verb Form</span>
                  {selectedForms.size > 0 && (
                    <span style={{ fontSize: '10px', color: '#4a9eff', background: 'rgba(74,158,255,0.15)', borderRadius: '8px', padding: '1px 7px', fontWeight: 700 }}>
                      {selectedForms.size} selected
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#444466', transform: showForms ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {showForms && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', paddingBottom: '12px' }}>
                  {Object.entries(FORM_INFO).map(([form, info]) => {
                    const active = selectedForms.has(form);
                    const color = BAB_COLORS[form] ?? '#aaa';
                    return (
                      <button key={form} onClick={() => setSelectedForms(toggleSet(selectedForms, form))}
                        style={{ padding: '10px 8px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.15s', border: `1px solid ${active ? color + 'cc' : color + '28'}`, background: active ? color + '18' : 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', boxShadow: active ? `0 0 12px ${color}22` : 'none' }}>
                        <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px', color: active ? '#fff' : '#aaabb8', direction: 'rtl', lineHeight: 1.3 }}>{info.pattern}</span>
                        <span style={{ fontSize: '10px', color: active ? color : '#555577', fontWeight: 700, letterSpacing: '0.05em' }}>Form {form}</span>
                        <span style={{ fontSize: '9px', color: active ? '#aabbdd' : '#3a3a55', textAlign: 'center', lineHeight: 1.2 }}>{info.desc}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* By Surah */}
            <div style={{ padding: '16px 20px 0' }}>
              <button onClick={() => setSurahPickerOpen(o => !o)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>By Surah</span>
                  {selectedSurah !== null && (
                    <span style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.15)', borderRadius: '8px', padding: '1px 7px', fontWeight: 700 }}>
                      {SURAH_MAP.get(selectedSurah)?.english}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#444466', transform: surahPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {surahPickerOpen && (
                <>
                  {selectedSurah !== null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '12px', marginBottom: '8px' }}>
                      <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '20px', color: '#a78bfa', direction: 'rtl' }}>{SURAH_MAP.get(selectedSurah)?.arabic}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#c4b5fd', fontWeight: 600 }}>{SURAH_MAP.get(selectedSurah)?.english}</div>
                        <div style={{ fontSize: '10px', color: '#555577' }}>Surah {selectedSurah} · {surahRootCount.get(selectedSurah) ?? 0} roots</div>
                      </div>
                      <button onClick={() => { setSelectedSurah(null); setSurahSearch(''); }} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', fontSize: '16px', padding: '0 2px' }}>✕</button>
                    </div>
                  )}
                  <div style={{ marginBottom: '8px', background: 'rgba(5,5,20,0.98)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <input autoFocus type="text" value={surahSearch} onChange={e => setSurahSearch(e.target.value)}
                        placeholder="Search surah…"
                        style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', outline: 'none' }} />
                    </div>
                    <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                      {filteredSurahs.map(surah => {
                        const count = surahRootCount.get(surah.number) ?? 0;
                        if (count === 0) return null;
                        const isSel = selectedSurah === surah.number;
                        return (
                          <div key={surah.number}
                            onClick={() => { setSelectedSurah(surah.number); setSurahPickerOpen(false); setSurahSearch(''); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', background: isSel ? 'rgba(167,139,250,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.07)'}
                            onMouseLeave={e => e.currentTarget.style.background = isSel ? 'rgba(167,139,250,0.12)' : 'transparent'}>
                            <span style={{ fontSize: '10px', color: '#444466', fontFamily: 'monospace', minWidth: '22px', textAlign: 'right' }}>{surah.number}</span>
                            <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '17px', color: '#fff', direction: 'rtl', minWidth: '60px', textAlign: 'right' }}>{surah.arabic}</span>
                            <div style={{ flex: 1, fontSize: '13px', color: isSel ? '#c4b5fd' : '#ccd' }}>{surah.english}</div>
                            <span style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderRadius: '6px', padding: '1px 6px' }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Advanced: Tense filter */}
            <div style={{ padding: '16px 20px 24px' }}>
              <button onClick={() => setShowAdvanced(o => !o)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Tense</span>
                  {selectedTenses.size > 0 && <span style={{ color: '#4a9eff', background: 'rgba(74,158,255,0.15)', borderRadius: '8px', padding: '1px 7px', fontSize: '10px', fontWeight: 700 }}>{selectedTenses.size}</span>}
                </div>
                <span style={{ fontSize: '12px', color: '#444466', transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
              </button>
              {showAdvanced && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TENSE_OPTS.map(({ key, label, arabic }) => {
                    const active = selectedTenses.has(key);
                    return (
                      <button key={key} onClick={() => setSelectedTenses(toggleSet(selectedTenses, key))}
                        style={{ padding: '7px 14px', borderRadius: '16px', border: `1px solid ${active ? 'rgba(74,158,255,0.5)' : 'rgba(255,255,255,0.08)'}`, background: active ? 'rgba(74,158,255,0.12)' : 'transparent', color: active ? '#4a9eff' : '#555577', cursor: 'pointer', fontSize: '12px', fontWeight: active ? 700 : 400, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '14px', direction: 'rtl' }}>{arabic}</span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
