import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore, verbRoots } from '../store/useStore';
import { BAB_COLORS } from '../data/verbs';
import type { VerbRoot } from '../data/verbs';
import { nounsList, nounSurahIndex, NOUN_TYPE_COLORS, NOUN_TYPE_LABELS } from '../data/nouns';
import type { Noun } from '../data/nouns';
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

const NOUN_TYPE_OPTS = Object.entries(NOUN_TYPE_LABELS).map(([key, { en }]) => ({ key, label: en }));

type SortKey = 'freq' | 'alpha' | 'forms' | 'surah';
type QuickFilter = 'all' | 50 | 100 | 300;

// Discriminated union for mixed surah view
type ExploreItem =
  | { kind: 'verb'; data: VerbRoot; firstAyah?: number }
  | { kind: 'noun'; data: Noun; firstAyah?: number };

// ── Surah index for verbs (lazy-loaded, promise-cached) ────────────────────
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
        surahIndexPromise = null;
        return new Map() as SurahIndex;
      });
  }
  return surahIndexPromise;
}

export const ExplorePanel: React.FC = () => {
  const setSelectedRoot  = useStore(s => s.setSelectedRoot);
  const setSelectedNoun  = useStore(s => s.setSelectedNoun);
  const setViewMode      = useStore(s => s.setViewMode);
  const setSpaceView     = useStore(s => s.setSpaceView);
  const setFilteredRoots = useStore(s => s.setFilteredRoots);
  const setFilteredNouns = useStore(s => s.setFilteredNouns);
  const explorerTab      = useStore(s => s.explorerTab);
  const setExplorerTab   = useStore(s => s.setExplorerTab);

  const [selectedForms, setSelectedForms]   = useState<Set<string>>(new Set());
  const [selectedTenses, setSelectedTenses] = useState<Set<string>>(new Set());
  const [selectedNounTypes, setSelectedNounTypes] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey]               = useState<SortKey>('freq');
  const [search, setSearch]                 = useState('');
  const [quickFilter, setQuickFilter]       = useState<QuickFilter>('all');
  const [showAdvanced, setShowAdvanced]     = useState(false);
  const [showForms, setShowForms]           = useState(false);
  const [showNounTypes, setShowNounTypes]   = useState(false);
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
    surahIndex.forEach((rootMap, s) => {
      const nounMap = nounSurahIndex.get(s);
      counts.set(s, rootMap.size + (nounMap?.size ?? 0));
    });
    // Add surahs that only have nouns
    nounSurahIndex.forEach((nounMap, s) => {
      if (!counts.has(s)) counts.set(s, nounMap.size);
    });
    return counts;
  }, [surahIndex]);

  // ── Filtering logic ──
  const isNounTab = explorerTab === 'nouns';
  const isSurahMode = selectedSurah !== null;

  // Top-N by frequency
  const topNIds = useMemo(() => {
    if (quickFilter === 'all') return null;
    if (isNounTab && !isSurahMode) {
      const sorted = [...nounsList].sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0)).slice(0, quickFilter);
      return new Set(sorted.map(n => n.id));
    }
    const sorted = [...verbRoots].sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0)).slice(0, quickFilter);
    return new Set(sorted.map(r => r.id));
  }, [quickFilter, isNounTab, isSurahMode]);

  // O(1) lookup maps — rebuilt only when data changes
  const verbsById = useMemo(() => new Map(verbRoots.map(r => [r.id, r])), [verbRoots.length]);
  const nounsById = useMemo(() => new Map(nounsList.map(n => [n.id, n])), [nounsList.length]);

  // Build the items list
  const { items, verbCount, nounCount } = useMemo(() => {
    // ── Surah mode: mixed verbs + nouns ──
    if (isSurahMode) {
      const verbMap = surahIndex.get(selectedSurah!) ?? new Map<string, number>();
      const nounMap = nounSurahIndex.get(selectedSurah!) ?? new Map<string, number>();

      const mixed: ExploreItem[] = [];

      // Verbs in this surah
      for (const [rootId, ayah] of verbMap) {
        const root = verbsById.get(rootId);
        if (!root) continue;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (!root.root.includes(search.trim()) && !root.meaning.toLowerCase().includes(q)) continue;
        }
        mixed.push({ kind: 'verb', data: root, firstAyah: ayah });
      }

      // Nouns in this surah
      for (const [nounId, ayah] of nounMap) {
        const noun = nounsById.get(nounId);
        if (!noun) continue;
        if (search.trim()) {
          const q = search.trim().toLowerCase();
          if (!noun.lemmaClean.includes(search.trim()) && !noun.meaning.toLowerCase().includes(q)) continue;
        }
        mixed.push({ kind: 'noun', data: noun, firstAyah: ayah });
      }

      // Sort by ayah order
      mixed.sort((a, b) => (a.firstAyah ?? 999) - (b.firstAyah ?? 999));

      return {
        items: mixed,
        verbCount: mixed.filter(i => i.kind === 'verb').length,
        nounCount: mixed.filter(i => i.kind === 'noun').length,
      };
    }

    // ── Non-surah: verbs or nouns depending on tab ──
    if (isNounTab) {
      let nouns = [...nounsList];
      if (topNIds) nouns = nouns.filter(n => topNIds.has(n.id));
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        nouns = nouns.filter(n =>
          n.lemmaClean.includes(search.trim()) ||
          n.lemma.includes(search.trim()) ||
          n.meaning.toLowerCase().includes(q) ||
          n.root.includes(search.trim())
        );
      }
      if (selectedNounTypes.size > 0)
        nouns = nouns.filter(n => selectedNounTypes.has(n.type));

      if (sortKey === 'freq') nouns.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
      else if (sortKey === 'alpha') nouns.sort((a, b) => a.lemmaClean.localeCompare(b.lemmaClean));

      const nounItems: ExploreItem[] = nouns.map(n => ({ kind: 'noun', data: n }));
      return { items: nounItems, verbCount: 0, nounCount: nouns.length };
    }

    // Verbs tab
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

    if (sortKey === 'freq') roots.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
    else if (sortKey === 'alpha') roots.sort((a, b) => a.root.localeCompare(b.root));
    else if (sortKey === 'forms') roots.sort((a, b) => b.babs.length - a.babs.length);

    const verbItems: ExploreItem[] = roots.map(r => ({ kind: 'verb', data: r }));
    return { items: verbItems, verbCount: roots.length, nounCount: 0 };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedForms, selectedTenses, selectedNounTypes, sortKey, selectedSurah, surahIndex, topNIds, isNounTab, verbsById, nounsById]);

  // Publish filtered lists to store for prev/next navigation
  useEffect(() => {
    const verbIds = items.filter(i => i.kind === 'verb').map(i => i.data.id);
    const nounIds = items.filter(i => i.kind === 'noun').map(i => i.data.id);
    setFilteredRoots(verbIds.length > 0 ? verbIds : null);
    setFilteredNouns(nounIds.length > 0 ? nounIds : null);
  }, [items, setFilteredRoots, setFilteredNouns]);

  const filteredSurahs = useMemo(() => {
    const q = surahSearch.trim().toLowerCase();
    return SURAHS.filter(s =>
      !q || s.english.toLowerCase().includes(q) || s.arabic.includes(q) || String(s.number).startsWith(q)
    );
  }, [surahSearch]);

  const hasFilters = selectedForms.size > 0 || selectedTenses.size > 0 || selectedNounTypes.size > 0 || search || selectedSurah !== null || quickFilter !== 'all';

  const clearAll = () => {
    setSelectedForms(new Set()); setSelectedTenses(new Set()); setSelectedNounTypes(new Set());
    setSearch(''); setSelectedSurah(null); setSurahSearch(''); setSurahPickerOpen(false);
    setQuickFilter('all');
  };

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const activeFilterCount =
    selectedForms.size + selectedTenses.size + selectedNounTypes.size +
    (quickFilter !== 'all' ? 1 : 0) +
    (selectedSurah !== null ? 1 : 0) +
    (search ? 1 : 0);

  const totalCount = isSurahMode ? items.length : (isNounTab ? nounsList.length : verbRoots.length);

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
            {items.length}
            <span style={{ color: '#444466', fontWeight: 400, fontSize: '12px' }}> / {totalCount} {isSurahMode ? 'items' : (isNounTab ? 'nouns' : 'roots')}</span>
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

      {/* ── Verbs / Nouns toggle (hidden in surah mode) ── */}
      {!isSurahMode && (
        <div style={{ padding: '10px 20px 0', display: 'flex', gap: '0', flexShrink: 0 }}>
          <div style={{
            display: 'flex', borderRadius: '12px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)',
          }}>
            {(['verbs', 'nouns'] as const).map(tab => {
              const active = explorerTab === tab;
              return (
                <button key={tab} onClick={() => setExplorerTab(tab)} style={{
                  padding: '7px 20px', border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(74,158,255,0.15)' : 'transparent',
                  color: active ? '#4a9eff' : '#555577',
                  fontSize: '13px', fontWeight: active ? 700 : 400,
                  transition: 'all 0.15s',
                  borderRight: tab === 'verbs' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                }}>
                  {tab === 'verbs' ? 'Verbs' : 'Nouns'}
                  <span style={{ fontSize: '10px', color: '#444466', marginLeft: '5px' }}>
                    {tab === 'verbs' ? verbRoots.length : nounsList.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Results sub-header (sort + count) ── */}
      <div style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ fontSize: '12px', color: '#444466', flex: 1 }}>
          {isSurahMode ? (
            <>
              {verbCount} verb{verbCount !== 1 ? 's' : ''} + {nounCount} noun{nounCount !== 1 ? 's' : ''}
              <span style={{ color: '#a78bfa' }}> · {SURAH_MAP.get(selectedSurah!)?.english} · sorted by ayah</span>
            </>
          ) : (
            <>{items.length} {isNounTab ? 'noun' : 'root'}{items.length !== 1 ? 's' : ''}</>
          )}
        </span>
        {!isSurahMode && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {(isNounTab
              ? [['freq', '↓ Freq'], ['alpha', 'A→Z']] as [SortKey, string][]
              : [['freq', '↓ Freq'], ['alpha', 'A→Z'], ['forms', '⊞ Forms']] as [SortKey, string][]
            ).map(([k, lbl]) => (
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
        {items.length === 0 && (
          <div style={{ textAlign: 'center', color: '#333355', padding: '48px 0', fontSize: '14px' }}>No results match</div>
        )}
        {items.map((item, idx) => {
          if (item.kind === 'verb') {
            const root = item.data;
            return (
              <div key={`v-${root.id}`} onClick={() => setSelectedRoot(root.id)}
                className="hover-row"
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>

                <div style={{ minWidth: '30px', textAlign: 'right', flexShrink: 0 }}>
                  {item.firstAyah !== undefined ? (
                    <div style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderRadius: '5px', padding: '1px 5px', fontFamily: 'monospace' }}>:{item.firstAyah}</div>
                  ) : (
                    <span style={{ color: '#2a2a44', fontSize: '10px', fontFamily: 'monospace' }}>#{idx + 1}</span>
                  )}
                </div>

                {/* V badge in surah mode */}
                {isSurahMode && (
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#4a9eff', background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>V</span>
                )}

                <span className="arabic" style={{ fontSize: '28px', color: '#fff', minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>
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
          }

          // Noun item
          const noun = item.data;
          const typeColor = NOUN_TYPE_COLORS[noun.type] ?? '#4a9eff';
          const typeLabel = NOUN_TYPE_LABELS[noun.type]?.en ?? noun.type;

          return (
            <div key={`n-${noun.id}-${noun.root}`} onClick={() => setSelectedNoun(noun.id)}
              className="hover-row"
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '11px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>

              <div style={{ minWidth: '30px', textAlign: 'right', flexShrink: 0 }}>
                {item.firstAyah !== undefined ? (
                  <div style={{ fontSize: '10px', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', borderRadius: '5px', padding: '1px 5px', fontFamily: 'monospace' }}>:{item.firstAyah}</div>
                ) : (
                  <span style={{ color: '#2a2a44', fontSize: '10px', fontFamily: 'monospace' }}>#{idx + 1}</span>
                )}
              </div>

              {/* N badge in surah mode */}
              {isSurahMode && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>N</span>
              )}

              <span className="arabic" style={{ fontSize: '28px', color: '#fff', minWidth: '72px', textAlign: 'right', flexShrink: 0 }}>
                {noun.lemma}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: '#ccd', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {noun.meaning}
                </div>
                <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', border: `1px solid ${typeColor}44`, color: typeColor, background: typeColor + '11' }}>
                  {typeLabel}
                </span>
              </div>

              <div style={{ textAlign: 'right', minWidth: '40px', flexShrink: 0 }}>
                <div style={{ fontSize: '13px', color: '#ffd700', fontWeight: 600 }}>{noun.totalFreq ?? 0}</div>
                <div style={{ fontSize: '9px', color: '#2a2a44' }}>verses</div>
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
                  placeholder={isNounTab ? 'Search a noun or meaning…' : 'Search a root or meaning…'}
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
                      {f === 'all' ? `All ${isNounTab ? 'nouns' : 'roots'}` : `Top ${f}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Verb Form — only shown on verbs tab */}
            {!isNounTab && (
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
                          <span className="arabic" style={{ fontSize: '18px', color: active ? '#fff' : '#aaabb8', lineHeight: 1.3 }}>{info.pattern}</span>
                          <span style={{ fontSize: '10px', color: active ? color : '#555577', fontWeight: 700, letterSpacing: '0.05em' }}>Form {form}</span>
                          <span style={{ fontSize: '9px', color: active ? '#aabbdd' : '#3a3a55', textAlign: 'center', lineHeight: 1.2 }}>{info.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Noun Type — only shown on nouns tab */}
            {isNounTab && (
              <div style={{ padding: '16px 20px 0' }}>
                <button onClick={() => setShowNounTypes(o => !o)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Noun Type</span>
                    {selectedNounTypes.size > 0 && (
                      <span style={{ fontSize: '10px', color: '#4a9eff', background: 'rgba(74,158,255,0.15)', borderRadius: '8px', padding: '1px 7px', fontWeight: 700 }}>
                        {selectedNounTypes.size} selected
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#444466', transform: showNounTypes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {showNounTypes && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingBottom: '12px' }}>
                    {NOUN_TYPE_OPTS.map(({ key, label }) => {
                      const active = selectedNounTypes.has(key);
                      const color = NOUN_TYPE_COLORS[key] ?? '#aaa';
                      return (
                        <button key={key} onClick={() => setSelectedNounTypes(toggleSet(selectedNounTypes, key))}
                          style={{ padding: '7px 14px', borderRadius: '16px', border: `1px solid ${active ? color + 'cc' : color + '28'}`, background: active ? color + '18' : 'transparent', color: active ? color : '#555577', cursor: 'pointer', fontSize: '12px', fontWeight: active ? 700 : 400, transition: 'all 0.15s' }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                      <span className="arabic" style={{ fontSize: '20px', color: '#a78bfa' }}>{SURAH_MAP.get(selectedSurah)?.arabic}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', color: '#c4b5fd', fontWeight: 600 }}>{SURAH_MAP.get(selectedSurah)?.english}</div>
                        <div style={{ fontSize: '10px', color: '#555577' }}>Surah {selectedSurah} · {surahRootCount.get(selectedSurah) ?? 0} items</div>
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
                            className="hover-row"
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', cursor: 'pointer', background: isSel ? 'rgba(167,139,250,0.12)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '10px', color: '#444466', fontFamily: 'monospace', minWidth: '22px', textAlign: 'right' }}>{surah.number}</span>
                            <span className="arabic" style={{ fontSize: '17px', color: '#fff', minWidth: '60px', textAlign: 'right' }}>{surah.arabic}</span>
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

            {/* Advanced: Tense filter — only for verbs tab */}
            {!isNounTab && (
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
                          <span className="arabic" style={{ fontSize: '14px' }}>{arabic}</span>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Spacer for nouns tab when no tense filter */}
            {isNounTab && <div style={{ height: '24px' }} />}
          </div>
        </div>
      )}
    </div>
  );
};
