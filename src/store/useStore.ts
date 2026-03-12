import { create } from 'zustand';
import Fuse from 'fuse.js';
import { verbRoots } from '../data/verbs';
import type { VerbRoot } from '../data/verbs';

export type ViewMode = 'space' | 'tree' | 'quiz' | 'explore' | 'stats';

interface Store {
  viewMode: ViewMode;
  selectedRoot: string | null;
  expandedBab: string | null;
  expandedTense: string | null;
  searchQuery: string;
  searchResults: string[] | null; // null means show all

  simulationActive: boolean;
  simulationIndex: number;

  setViewMode: (mode: ViewMode) => void;
  setSelectedRoot: (id: string | null) => void;
  setExpandedBab: (id: string | null) => void;
  setExpandedTense: (id: string | null) => void;
  setSearch: (q: string) => void;
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
      fuseItems.push({ rootId: root.id, text: bab.arabicPattern });
      if (bab.semanticMeaning) {
        fuseItems.push({ rootId: root.id, text: bab.semanticMeaning });
      }
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

// Read initial root from URL if present
const params = new URLSearchParams(window.location.search);
const initialRoot = params.get('root') ?? null;

export const useStore = create<Store>((set) => ({
  viewMode: initialRoot ? 'tree' : 'space',
  selectedRoot: initialRoot,

  expandedBab: null,
  expandedTense: null,
  searchQuery: '',
  searchResults: null,
  
  simulationActive: false,
  simulationIndex: 0,

  setViewMode: (mode) => set({ viewMode: mode, selectedRoot: null, expandedBab: null, expandedTense: null, simulationActive: false }),

  setSelectedRoot: (id) =>
    set((state) => {
      if (id === null) {
        window.history.pushState({}, '', window.location.pathname);
        return { selectedRoot: null, expandedBab: null, expandedTense: null, simulationActive: false, viewMode: 'space' };
      }
      const toggled = state.selectedRoot === id ? null : id;
      
      if (toggled) {
        window.history.pushState({}, '', `?root=${toggled}`);
      } else {
        window.history.pushState({}, '', window.location.pathname);
      }
      
      return {
        selectedRoot: toggled,
        expandedBab: null,
        expandedTense: null,
        viewMode: toggled ? 'tree' : 'space',
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

  backToSpace: () => {
    window.history.pushState({}, '', window.location.pathname);
    return set(() => ({
      viewMode: 'space',
      selectedRoot: null,
      expandedBab: null,
      expandedTense: null,
      simulationActive: false,
    }));
  },

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
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  const rootId = params.get('root') ?? null;
  
  if (rootId) {
    useStore.setState({ selectedRoot: rootId, viewMode: 'tree', expandedBab: null, expandedTense: null, simulationActive: false });
  } else {
    useStore.setState({ selectedRoot: null, viewMode: 'space', expandedBab: null, expandedTense: null, simulationActive: false });
  }
});

export { verbRoots };
export type { VerbRoot };
