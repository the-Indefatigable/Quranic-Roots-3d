import { create } from 'zustand';
import Fuse from 'fuse.js';
import { verbRoots, onDataLoaded } from '../data/verbs';
import type { VerbRoot } from '../data/verbs';
import { nounsList } from '../data/nouns';
import type { Noun } from '../data/nouns';

export type ViewMode = 'space' | 'tree' | 'quiz' | 'explore' | 'stats';
export type SpaceView = '3d' | 'list';
export type ExplorerTab = 'verbs' | 'nouns';

interface Store {
  viewMode: ViewMode;
  spaceView: SpaceView;
  selectedRoot: string | null;
  selectedNoun: string | null;
  explorerTab: ExplorerTab;
  expandedBab: string | null;
  expandedTense: string | null;
  searchQuery: string;
  searchResults: string[] | null; // null means show all
  previousViewMode: ViewMode | null; // where we came from before entering tree
  filteredRootIds: string[] | null; // current filtered list from ExplorePanel (null = all)
  filteredNounIds: string[] | null;

  simulationActive: boolean;
  simulationIndex: number;

  isAdmin: boolean;
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;

  setViewMode: (mode: ViewMode) => void;
  setSpaceView: (v: SpaceView) => void;
  setSelectedRoot: (id: string | null) => void;
  setSelectedNoun: (id: string | null) => void;
  setExplorerTab: (tab: ExplorerTab) => void;
  setExpandedBab: (id: string | null) => void;
  setExpandedTense: (id: string | null) => void;
  setSearch: (q: string) => void;
  setFilteredRoots: (ids: string[] | null) => void;
  setFilteredNouns: (ids: string[] | null) => void;
  backToSpace: () => void;

  startSimulation: () => void;
  stopSimulation: () => void;
  nextSimStep: () => void;
  prevSimStep: () => void;
  jumpToSimStep: (idx: number) => void;
}

// Lean Fuse index — built on demand so it captures async data loads
let fuseInstance: Fuse<{ rootId: string; text: string }> | null = null;

export function rebuildSearchIndex() {
  const fuseItems: { rootId: string; text: string }[] = [];
  verbRoots.forEach((root) => {
    fuseItems.push({ rootId: root.id, text: root.root });
    fuseItems.push({ rootId: root.id, text: root.meaning });
    root.babs.forEach((bab) => {
      fuseItems.push({ rootId: root.id, text: bab.meaning });
      if (bab.arabicPattern) fuseItems.push({ rootId: root.id, text: bab.arabicPattern });
      if (bab.semanticMeaning) fuseItems.push({ rootId: root.id, text: bab.semanticMeaning });
      if (bab.verbMeaning)     fuseItems.push({ rootId: root.id, text: bab.verbMeaning });
      if (bab.masdar)          fuseItems.push({ rootId: root.id, text: bab.masdar });
      if (bab.faaeil)          fuseItems.push({ rootId: root.id, text: bab.faaeil });
      if (bab.mafool)          fuseItems.push({ rootId: root.id, text: bab.mafool });
      if (bab.prepositions) {
        bab.prepositions.forEach(p => {
          fuseItems.push({ rootId: root.id, text: p.preposition });
          fuseItems.push({ rootId: root.id, text: p.meaning });
        });
      }
    });
  });

  fuseInstance = new Fuse(fuseItems, {
    keys: ['text'],
    threshold: 0.15, // Extra strict matching to avoid single letter matches
    distance: 50,
    ignoreLocation: true,
    includeScore: true,
  });
}

function searchRoots(query: string): string[] | null {
  if (!query.trim()) return null;
  
  if (!fuseInstance) {
    rebuildSearchIndex();
  }
  
  // Re-check just in case verbRoots is still empty
  if (!fuseInstance) return null;
  
  const results = fuseInstance.search(query);
  const seen = new Set<string>();
  const ids: string[] = [];
  const MAX_SEARCH_RESULTS = 15;
  for (const r of results) {
    if (!seen.has(r.item.rootId)) {
      seen.add(r.item.rootId);
      ids.push(r.item.rootId);
      if (ids.length >= MAX_SEARCH_RESULTS) break;
    }
  }
  return ids;
}

// Read initial root from URL — SSR-safe
function getInitialRoot(): string | null {
  if (typeof window === 'undefined') return null;
  const pathMatch = window.location.pathname.match(/^\/root\/(.+)/);
  if (pathMatch) return decodeURIComponent(pathMatch[1]);
  return new URLSearchParams(window.location.search).get('root');
}
const initialRoot = getInitialRoot();
const isMobileInit = typeof window !== 'undefined' && window.innerWidth < 768;

export const useStore = create<Store>((set) => ({
  viewMode: initialRoot ? 'tree' : (isMobileInit ? 'explore' : 'space'),
  spaceView: '3d',
  selectedRoot: initialRoot,
  selectedNoun: null,
  explorerTab: 'verbs',

  expandedBab: null,
  expandedTense: null,
  searchQuery: '',
  searchResults: null,
  previousViewMode: null,
  filteredRootIds: null,
  filteredNounIds: null,

  simulationActive: false,
  simulationIndex: 0,

  isAdmin: false,
  adminLogin: (password: string) => {
    if (password === 'admin') {
      set({ isAdmin: true });
      return true;
    }
    return false;
  },
  adminLogout: () => set({ isAdmin: false }),

  setViewMode: (mode) => set({ viewMode: mode, selectedRoot: null, selectedNoun: null, expandedBab: null, expandedTense: null, simulationActive: false, previousViewMode: null }),
  setSpaceView: (v) => set({ spaceView: v }),
  setExplorerTab: (tab) => set({ explorerTab: tab }),

  setSelectedRoot: (id) =>
    set((state) => {
      if (id === null) {
        const target = state.previousViewMode ?? 'explore';
        return { selectedRoot: null, selectedNoun: null, expandedBab: null, expandedTense: null, simulationActive: false, viewMode: target, previousViewMode: null };
      }
      const toggled = state.selectedRoot === id ? null : id;

      return {
        selectedRoot: toggled,
        selectedNoun: null,
        expandedBab: null,
        expandedTense: null,
        viewMode: toggled ? 'tree' : (state.previousViewMode ?? 'explore'),
        previousViewMode: toggled ? (state.viewMode !== 'tree' ? state.viewMode : state.previousViewMode) : null,
      };
    }),

  setSelectedNoun: (id) =>
    set((state) => {
      if (id === null) {
        const target = state.previousViewMode ?? 'explore';
        return { selectedNoun: null, selectedRoot: null, expandedBab: null, expandedTense: null, simulationActive: false, viewMode: target, previousViewMode: null };
      }
      return {
        selectedNoun: id,
        selectedRoot: null,
        expandedBab: null,
        expandedTense: null,
        viewMode: 'tree',
        previousViewMode: state.viewMode !== 'tree' ? state.viewMode : state.previousViewMode,
      };
    }),

  setExpandedBab: (id) =>
    set((state) => ({
      expandedBab: state.expandedBab === id ? null : id,
      expandedTense: null,
    })),

  setExpandedTense: (id) =>
    set((state) => ({
      expandedTense: state.expandedTense === id ? null : id,
    })),

  setSearch: (q) =>
    set(() => ({
      searchQuery: q,
      searchResults: searchRoots(q),
    })),

  setFilteredRoots: (ids) => set({ filteredRootIds: ids }),
  setFilteredNouns: (ids) => set({ filteredNounIds: ids }),

  backToSpace: () =>
    set((state) => {
      const target = state.previousViewMode ?? 'explore';
      return {
        viewMode: target,
        selectedRoot: null,
        selectedNoun: null,
        expandedBab: null,
        expandedTense: null,
        simulationActive: false,
        previousViewMode: null,
      };
    }),

  startSimulation: () => set({ simulationActive: true, selectedRoot: null }),
  stopSimulation: () => set({ simulationActive: false }),
  nextSimStep: () => set(state => ({
    simulationIndex: Math.min(state.simulationIndex + 1, verbRoots.length - 1)
  })),
  prevSimStep: () => set(state => ({
    simulationIndex: Math.max(state.simulationIndex - 1, 0)
  })),
  jumpToSimStep: (idx) => set({
    simulationIndex: Math.max(0, Math.min(idx, verbRoots.length - 1))
  }),
}));

// Register callback so verbs.ts rebuilds search index after data loads
// (avoids circular import — verbs.ts no longer imports from this file)
onDataLoaded(rebuildSearchIndex);

export { verbRoots };
export type { VerbRoot };
export { nounsList };
export type { Noun };
