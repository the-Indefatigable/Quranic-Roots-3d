import React, { Suspense, useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { SearchPanel } from './components/SearchPanel';
import { useStore } from './store/useStore';
import { initData } from './data/verbs';
import { BootScreen } from './components/BootScreen';

const TreeView = React.lazy(() => import('./components/TreeView').then(module => ({ default: module.TreeView })));
const SimulationHUD = React.lazy(() => import('./components/SimulationHUD').then(module => ({ default: module.SimulationHUD })));

const App: React.FC = () => {
  const viewMode = useStore((s) => s.viewMode);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // This blocks the app from rendering UI or accessing the canvas
    // until the multi-megabyte JSON dictionary is parsed and Search is built
    initData().then(() => setIsDataLoaded(true));
  }, []);

  if (!isDataLoaded) return <BootScreen />;

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#050510' }}>
      {/* 3D canvas fills screen */}
      <Scene />

      {/* 2D HTML Family Tree Overlay */}
      {viewMode === 'tree' && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Tree...</div>}>
          <TreeView />
        </Suspense>
      )}

      {/* UI overlays — only in space mode */}
      {viewMode === 'space' && (
        <>
          <SearchPanel />
          <Suspense fallback={null}>
            <SimulationHUD />
          </Suspense>

          {/* Title watermark */}
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              textAlign: 'center',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(74,158,255,0.45)',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Quranic Verb Roots — 3D Explorer
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', marginTop: '3px', letterSpacing: '0.1em' }}>
              Click a root word to explore its forms · Drag to orbit
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
