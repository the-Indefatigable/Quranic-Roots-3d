import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { RootsField } from './RootsField';
import { NebulaBackground } from './NebulaBackground';

// ── Starfield — single points draw call ───────────────────────────────────────
const Stars: React.FC = () => {
  const geo = useMemo(() => {
    const arr = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 300 + Math.random() * 200;
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#ffffff" size={0.18} sizeAttenuation transparent opacity={0.5} />
    </points>
  );
};

// ── Smooth camera lerp toward clicked node (no auto-drift) ───────────────────
const CameraRig: React.FC = () => {
  const { camera } = useThree();
  const { viewMode } = useStore();

  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera & { __targetPos?: THREE.Vector3 };
    
    // Smooth reset for tree view
    if (viewMode === 'tree') {
      const treeTarget = new THREE.Vector3(0, 80, 500);
      camera.position.lerp(treeTarget, delta * 3.0);
    } else if (cam.__targetPos) {
      camera.position.lerp(cam.__targetPos, delta * 2.5);
      if (camera.position.distanceTo(cam.__targetPos) < 0.05) delete cam.__targetPos;
    }
  });

  return null;
};

const SceneContents: React.FC = () => {
  const { viewMode } = useStore();
  
  return (
    <>
      <ambientLight intensity={0.2} color="#1a2040" />
      <pointLight position={[50, 70, 50]}    intensity={1.0} color="#4a9eff" />
      <pointLight position={[-50, -50, -50]} intensity={0.5} color="#ff6600" />
      <pointLight position={[0, -60, 30]}    intensity={0.3} color="#00aaff" />
      
      <CameraRig />
      
      {viewMode === 'space' ? (
        <>
          <Stars />
          <RootsField />
        </>
      ) : (
        <>
          <NebulaBackground />
        </>
      )}
    </>
  );
};

// ── Canvas ─────────────────────────────────────────────────────────────────────
export const Scene: React.FC = () => {
  const { setSelectedRoot, viewMode } = useStore();

  return (
    <Canvas
      camera={{ position: [41.8, 4.2, -20.3], fov: 65 }}
      style={{ position: 'fixed', inset: 0 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={Math.min(window.devicePixelRatio, 2)}
      onPointerMissed={() => setSelectedRoot(null)}
    >
      <color attach="background" args={['#02050f']} />
      <fog attach="fog" args={['#050510', 100, 300]} />
      <SceneContents />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={2500}
        enablePan
        enableRotate={viewMode === 'space'}
        panSpeed={1.5}
        rotateSpeed={0.4}
        zoomSpeed={1.0}
        target={[30, 0, 0]}
      />
    </Canvas>
  );
};
