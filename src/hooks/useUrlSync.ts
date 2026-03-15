import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * Syncs store state ↔ browser URL.
 * - Pushes URL when selectedRoot changes
 * - Reads URL on popstate (back/forward buttons)
 * Mount once in the app root.
 */
export function useUrlSync() {
  const selectedRoot = useStore(s => s.selectedRoot);
  const viewMode = useStore(s => s.viewMode);

  // Push URL when selectedRoot changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (selectedRoot) {
      const target = `/root/${encodeURIComponent(selectedRoot)}`;
      if (currentPath !== target) {
        window.history.pushState({}, '', target);
      }
    } else if (currentPath !== '/') {
      window.history.pushState({}, '', '/');
    }
  }, [selectedRoot]);

  // Listen for browser back/forward
  useEffect(() => {
    const onPopState = () => {
      const pathMatch = window.location.pathname.match(/^\/root\/(.+)/);
      const rootId = pathMatch ? decodeURIComponent(pathMatch[1]) : null;

      if (rootId) {
        useStore.setState({
          selectedRoot: rootId,
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
