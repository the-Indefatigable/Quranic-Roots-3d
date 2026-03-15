import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * Syncs store state ↔ browser URL.
 * Supports /root/:id (verbs) and /noun/:id (nouns).
 * Mount once in the app root.
 */
export function useUrlSync() {
  const selectedRoot = useStore(s => s.selectedRoot);
  const selectedNoun = useStore(s => s.selectedNoun);

  // Push URL when selection changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (selectedRoot) {
      const target = `/root/${encodeURIComponent(selectedRoot)}`;
      if (currentPath !== target) window.history.pushState({}, '', target);
    } else if (selectedNoun) {
      const target = `/noun/${encodeURIComponent(selectedNoun)}`;
      if (currentPath !== target) window.history.pushState({}, '', target);
    } else if (currentPath !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [selectedRoot, selectedNoun]);

  // Listen for browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const rootMatch = window.location.pathname.match(/^\/root\/(.+)/);
      const nounMatch = window.location.pathname.match(/^\/noun\/(.+)/);

      if (rootMatch) {
        useStore.setState({
          selectedRoot: decodeURIComponent(rootMatch[1]),
          selectedNoun: null,
          viewMode: 'tree',
          expandedBab: null,
          expandedTense: null,
          simulationActive: false,
        });
      } else if (nounMatch) {
        useStore.setState({
          selectedNoun: decodeURIComponent(nounMatch[1]),
          selectedRoot: null,
          viewMode: 'tree',
          expandedBab: null,
          expandedTense: null,
          simulationActive: false,
        });
      } else {
        const currentState = useStore.getState();
        const target = currentState.previousViewMode ?? 'explore';
        useStore.setState({
          selectedRoot: null,
          selectedNoun: null,
          viewMode: target,
          expandedBab: null,
          expandedTense: null,
          simulationActive: false,
          previousViewMode: null,
        });
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
}
