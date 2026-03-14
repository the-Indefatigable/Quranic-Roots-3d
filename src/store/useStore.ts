import { create } from 'zustand';
import Fuse from 'fuse.js';
import { verbRoots } from '../data/verbs';
import type { VerbRoot } from '../data/verbs';

export type ViewMode = 'space' | 'tree' | 'quiz' | 'explore' | 'stats';
export type SpaceView = '3d' | 'list';

interface Store {
  viewMode: ViewMode;
  spaceView: SpaceView;
  selectedRoot: string | null;
  expandedBab: string | null;
  expandedTense: string | null;
  searchQuery: string;
  searchResults: string[] | null; // null means show all
  previousViewMode: ViewMode | null; // where we came from before entering tree
  filteredRootIds: string[] | null; // current filtered list from ExplorePanel (null = all)

  simulationActive: boolean;
  simulationIndex: number;

  setViewMode: (mode: ViewMode) => void;
  setSpaceView: (v: SpaceView) => void;
  setSelectedRoot: (id: string | null) => void;
  setExpandedBab: (id: string | null) => void;
  setExpandedTense: (id: string | null) => void;
  setSearch: (q: string) => void;
  setFilteredRoots: (ids: string[] | null) => void;
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

  expandedBab: null,
  expandedTense: null,
  searchQuery: '',
  searchResults: null,
  previousViewMode: null,
  filteredRootIds: null,

  simulationActive: false,
  simulationIndex: 0,

  setViewMode: (mode) => set({ viewMode: mode, selectedRoot: null, expandedBab: null, expandedTense: null, simulationActive: false, previousViewMode: null }),
  setSpaceView: (v) => set({ spaceView: v }),

  setSelectedRoot: (id) =>
    set((state) => {
      if (id === null) {
        window.history.pushState({}, '', window.location.pathname);
        const target = state.previousViewMode ?? 'explore';
        return { selectedRoot: null, expandedBab: null, expandedTense: null, simulationActive: false, viewMode: target, previousViewMode: null };
      }
      const toggled = state.selectedRoot === id ? null : id;

      if (typeof window !== 'undefined') {
        if (toggled) {
          window.history.pushState({}, '', `/root/${encodeURIComponent(toggled)}`);
        } else {
          window.history.pushState({}, '', '/');
        }
      }

      return {
        selectedRoot: toggled,
        expandedBab: null,
        expandedTense: null,
        viewMode: toggled ? 'tree' : (state.previousViewMode ?? 'explore'),
        // Only record previousViewMode when entering tree, not when navigating within tree (prev/next)
        previousViewMode: toggled ? (state.viewMode !== 'tree' ? state.viewMode : state.previousViewMode) : null,
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

  backToSpace: () =>
    set((state) => {
      const target = state.previousViewMode ?? 'explore';
      if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
      return {
        viewMode: target,
        selectedRoot: null,
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

// Setup event listener to handle browser native "Back" and "Forward" buttons
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    const pathMatch = window.location.pathname.match(/^\/root\/(.+)/);
    const rootId = pathMatch ? decodeURIComponent(pathMatch[1]) : null;

    if (rootId) {
      useStore.setState({ selectedRoot: rootId, viewMode: 'tree', expandedBab: null, expandedTense: null, simulationActive: false });
    } else {
      const currentState = useStore.getState();
      const target = currentState.previousViewMode ?? 'explore';
      useStore.setState({ selectedRoot: null, viewMode: target, expandedBab: null, expandedTense: null, simulationActive: false, previousViewMode: null });
    }
  });
}

export { verbRoots };
export type { VerbRoot };
