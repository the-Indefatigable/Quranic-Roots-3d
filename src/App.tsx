import React, { Suspense, useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { SearchPanel } from './components/SearchPanel';
import { NavBar } from './components/NavBar';
import { useStore } from './store/useStore';
import { initData, preloadAllRootsInBackground } from './data/verbs';
import { BootScreen } from './components/BootScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AboutPanel } from './components/AboutPanel';


const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#050510', color: '#ff6b6b', fontFamily: 'sans-serif', gap: '12px' }}>
    <div style={{ fontSize: '18px', fontWeight: 600 }}>Failed to load verb data</div>
    <div style={{ fontSize: '13px', color: '#888', maxWidth: '400px', textAlign: 'center' }}>{message}</div>
    <button onClick={() => window.location.reload()} style={{ marginTop: '12px', padding: '8px 20px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '8px', color: '#ff6b6b', cursor: 'pointer', fontSize: '13px' }}>
      Retry
    </button>
  </div>
);

const TreeView      = React.lazy(() => import('./components/TreeView').then(m => ({ default: m.TreeView })));
const SimulationHUD = React.lazy(() => import('./components/SimulationHUD').then(m => ({ default: m.SimulationHUD })));
const QuizMode      = React.lazy(() => import('./components/QuizMode').then(m => ({ default: m.QuizMode })));
const StatsPanel    = React.lazy(() => import('./components/StatsPanel').then(m => ({ default: m.StatsPanel })));
const ExplorePanel  = React.lazy(() => import('./components/ExplorePanel').then(m => ({ default: m.ExplorePanel })));

const FullPageFallback = () => (
  <div style={{ position: 'fixed', inset: 0, background: '#02050f', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 700 }}>
    <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '28px', color: 'rgba(255,208,80,0.5)', direction: 'rtl', letterSpacing: '3px' }}>
      بِسْمِ اللَّهِ
    </span>
  </div>
);

const App: React.FC = () => {
  const viewMode          = useStore(s => s.viewMode);
  const spaceView         = useStore(s => s.spaceView);
  const setViewMode       = useStore(s => s.setViewMode);
  const simulationActive  = useStore(s => s.simulationActive);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadError, setLoadError]       = useState<string | null>(null);
  const [appState, setAppState]         = useState<'welcome' | 'loading' | 'app'>('welcome');
  const [showAbout, setShowAbout]       = useState(false);
  // Delay the 3D scene mode switch so TreeView fade-in hides the 3D swap
  const [sceneViewMode, setSceneViewMode] = useState<'space' | 'tree'>(viewMode === 'tree' ? 'tree' : 'space');

  // Load index data, then quietly preload all root files for offline PWA use
  useEffect(() => {
    initData()
      .then(() => {
        setIsDataLoaded(true);
        preloadAllRootsInBackground(); // non-blocking background cache fill
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  // When data finishes loading while we're on the loading screen, advance to app
  useEffect(() => {
    if (isDataLoaded && appState === 'loading') setAppState('app');
  }, [isDataLoaded, appState]);

  const handleStart = () => {
    if (loadError) return;
    if (isDataLoaded) setAppState('app');
    else setAppState('loading'); // show bismillah loader until data ready
  };

  // Delay 3D scene mode switch by 420ms when going to tree (lets TreeView fade in first)
  useEffect(() => {
    if (viewMode === 'tree') {
      const t = setTimeout(() => setSceneViewMode('tree'), 420);
      return () => clearTimeout(t);
    } else {
      setSceneViewMode('space');
    }
  }, [viewMode]);

  if (loadError) return <ErrorScreen message={loadError} />;
  if (appState === 'welcome') return <WelcomeScreen onStart={handleStart} />;
  if (appState === 'loading') return <BootScreen />;

  const showCanvas  = viewMode === 'space' || viewMode === 'tree';
  const showNavBar  = viewMode !== 'tree';

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#050510' }}>

      {/* 3D canvas — space/tree modes */}
      {showCanvas && <Scene sceneViewMode={sceneViewMode} />}

      {/* Tree view overlay */}
      {viewMode === 'tree' && (
        <Suspense fallback={null}>
          <TreeView />
        </Suspense>
      )}

      {/* Space-mode overlays */}
      {viewMode === 'space' && (
        <>
          {/* Top-left controls: about + view toggle */}
          <div style={{ position: 'fixed', top: '20px', left: '20px', zIndex: 1000, display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowAbout(true)}
              style={{
                width: '40px', height: '40px', borderRadius: '20px',
                background: 'rgba(5,8,30,0.6)', backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '18px', cursor: 'pointer',
              }}
            >
              ℹ️
            </button>
            <button
              onClick={() => setViewMode('explore')}
              title="Switch to Explore view"
              style={{
                height: '40px', borderRadius: '20px',
                padding: '0 14px',
                background: 'rgba(5,8,30,0.6)', backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#aabbdd', display: 'flex', alignItems: 'center',
                gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              ☰ Explore
            </button>
          </div>

          {spaceView === '3d' && <SearchPanel />}
          <Suspense fallback={null}>
            <SimulationHUD />
          </Suspense>
        </>
      )}

      {/* Quiz / Stats pages */}
      {viewMode === 'quiz' && (
        <Suspense fallback={<FullPageFallback />}>
          <QuizMode />
        </Suspense>
      )}
      {viewMode === 'stats' && (
        <Suspense fallback={<FullPageFallback />}>
          <StatsPanel />
        </Suspense>
      )}

      {/* Explore page — always mounted so filter state persists across navigation */}
      <div style={{ display: viewMode === 'explore' ? undefined : 'none' }}>
        <Suspense fallback={viewMode === 'explore' ? <FullPageFallback /> : null}>
          <ExplorePanel />
        </Suspense>
      </div>

      {/* Bottom nav — hidden in tree view (TreeView has its own nav) */}
      {showNavBar && <NavBar />}

      {/* Global About Modal */}
      {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}
    </div>
  );
};

export default App;
