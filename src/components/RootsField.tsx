/**
 * RootsField — Root words only, floating in 3D space.
 * No babs, tenses, or conjugations — those live in the TreeView.
 */
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { verbRoots } from '../data/verbs';
import type { VerbRoot } from '../data/verbs';
import { useStore } from '../store/useStore';
import { getRootPositions } from '../utils/layout';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_VISIBLE      = 80;
const LOD_REFRESH_S    = 0.25;

const ARABIC_FONT = '/fonts/ScheherazadeNew-Bold.ttf';

const C_NORMAL   = new THREE.Color('#4a9eff');
const C_SELECTED = new THREE.Color('#ff9900');
const C_DIMMED   = new THREE.Color('#08101e');
const C_BUF      = new THREE.Color();

// Bigger spheres for easier clicking
const SPHERE_GEO = new THREE.SphereGeometry(0.5, 12, 12);
const INST_MAT   = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.1,
  metalness: 0.8,
  emissive: new THREE.Color('#4a9eff'),
  emissiveIntensity: 0.5,
});

// Dynamic geometry will be built inside the component once verbRoots is populated

// ── Visible root info ─────────────────────────────────────────────────────────
interface VisibleRoot {
  rootIdx: number;
  distSq: number;
  size: number;
}

function getRootSize(distSq: number): number {
  const dist = Math.sqrt(distSq);
  return dist > 120 ? 2.2 : dist > 60 ? 1.6 : 1.2;
}

// ── Main component ─────────────────────────────────────────────────────────────
export const RootsField: React.FC = () => {
  const count    = verbRoots.length;
  
  const { positions, topRoots, edges } = useMemo(() => {
    const len = verbRoots.length;
    const p = getRootPositions(len);
    
    const rFreq = verbRoots
      .map((r, i) => ({ idx: i, freq: r.totalFreq || 0 }))
      .sort((a, b) => b.freq - a.freq);
    const top = new Set(rFreq.slice(0, 30).map(r => r.idx));
    
    const e: [number, number][] = [];
    for (let i = 0; i < len - 1; i++) {
      e.push([i, i + 1]);
    }
    
    return { positions: p, topRoots: top, edges: e };
  }, [count]);

  const meshRef  = useRef<THREE.InstancedMesh>(null!);
  const webMatRef= useRef<THREE.LineBasicMaterial>(null!);
  const dummy    = useMemo(() => new THREE.Object3D(), []);
  const timerRef = useRef(0);

  const { 
    selectedRoot, setSelectedRoot, searchResults, 
    simulationActive, simulationIndex 
  } = useStore();

  // Visible roots state — updated at LOD_REFRESH_S rate
  const wordCacheRef = useRef<VisibleRoot[]>([]);
  const [visibleRoots, setVisibleRoots] = useState<VisibleRoot[]>([]);
  const [hoveredRoot, setHoveredRoot] = useState<string | null>(null);

  // ── Web geometry (built once) ───────────────────────────────────────────────
  const webGeo = useMemo(() => {
    const pts = new Float32Array(edges.length * 6);
    edges.forEach(([i, j], e) => {
      const a = positions[i], b = positions[j];
      pts[e * 6 + 0] = a.x; pts[e * 6 + 1] = a.y; pts[e * 6 + 2] = a.z;
      pts[e * 6 + 3] = b.x; pts[e * 6 + 4] = b.y; pts[e * 6 + 5] = b.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  const searchSet = useMemo(() => {
    return searchResults !== null ? new Set(searchResults) : null;
  }, [searchResults]);

  const targetObj = useMemo(() => new THREE.Object3D(), []);

  // ── Frame loop ──────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.getElapsedTime();
    const hasSelection = selectedRoot !== null;

    // Camera Auto-Pilot for Simulation Match
    if (simulationActive) {
      const targetPos = positions[simulationIndex];
      // Offset camera to look down the curve (slightly outside and above)
      const dir = targetPos.clone().normalize();
      const idealCamPos = targetPos.clone().add(dir.multiplyScalar(25)).add(new THREE.Vector3(0, 8, 0));
      
      state.camera.position.lerp(idealCamPos, delta * 2.5);
      
      const controls = state.controls as any;
      if (controls && controls.target) {
        controls.target.lerp(targetPos, delta * 3.5);
        controls.update();
      } else {
        targetObj.position.lerp(targetPos, delta * 3.5);
        state.camera.lookAt(targetObj.position);
      }
    }

    // Fade web lines
    if (webMatRef.current) {
      const target = hasSelection ? 0 : 0.1;
      webMatRef.current.opacity += (target - webMatRef.current.opacity) * Math.min(1, delta * 4);
    }

    // Update instanced root spheres
    for (let i = 0; i < count; i++) {
      const root = verbRoots[i];
      const pos = positions[i];
      const isSelected = root.id === selectedRoot;
      const isSearchDimmed = searchSet !== null && !searchSet.has(root.id);

      const pulse = isSelected
        ? 1 + Math.sin(t * 2.0) * 0.15
        : 1 + Math.sin(t * 1.4 + i * 0.37) * 0.05;

      let baseScale = 1.0;
      let finalColor = C_NORMAL;

      // Ensure the Galactic Path always looks like a web of blue stars.
      if (isSelected) {
        baseScale = 3.0;
        finalColor = C_SELECTED;
      } else if (simulationActive) {
        // Keep non-active simulation beads visible as small blue dots
        baseScale = Math.abs(i - simulationIndex) <= 1 ? 1.0 : 0.3;
        finalColor = C_NORMAL;
      } else if (hasSelection || isSearchDimmed) {
        // Regular mode dimming (e.g. searching or tree view)
        baseScale = 0.3;
        finalColor = C_DIMMED;
      }

      const scale = baseScale * pulse;

      dummy.position.copy(pos);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, finalColor);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // ── LOD: only show roots within range ──────────────────────────────────
    timerRef.current += delta;
    if (timerRef.current >= LOD_REFRESH_S || simulationActive) {
      // Force update logic during simulation to track camera smoothly
      let next: VisibleRoot[] = [];

      if (simulationActive) {
        const indices = [simulationIndex - 1, simulationIndex, simulationIndex + 1].filter(idx => idx >= 0 && idx < count);
        for (const ri of indices) {
          const rootPos = positions[ri];
          const distSq = state.camera.position.distanceToSquared(rootPos);
          next.push({
            rootIdx: ri,
            distSq,
            size: getRootSize(distSq),
          });
        }
      } else {
        if (timerRef.current >= LOD_REFRESH_S) {
          timerRef.current = 0;
          const camPos = state.camera.position;
          const collected: VisibleRoot[] = [];

          for (let ri = 0; ri < count; ri++) {
            const rootPos = positions[ri];
            const distSq = camPos.distanceToSquared(rootPos);
            const dist = Math.sqrt(distSq);

            if (dist > 180 && !topRoots.has(ri)) continue;

            collected.push({
              rootIdx: ri,
              distSq,
              size: getRootSize(distSq),
            });
          }

          collected.sort((a, b) => a.distSq - b.distSq);
          next = collected.slice(0, MAX_VISIBLE);
        } else {
          // If not simulation and not time to refresh, return early
          return;
        }
      }

      const prev = wordCacheRef.current;
      let changed = false;

      // Only update if the specific set of visible roots or their discrete sizes changed
      // This stops continuous lag every 250ms when simply orbiting!
      if (next.length !== prev.length) {
        changed = true;
      } else {
        const nextMap = new Map(next.map(n => [n.rootIdx, n.size]));
        const prevMap = new Map(prev.map(n => [n.rootIdx, n.size]));
        for (const [id, size] of nextMap.entries()) {
          const prevSize = prevMap.get(id);
          if (prevSize === undefined || prevSize !== size) {
            changed = true;
            break;
          }
        }
      }

      if (changed) {
        wordCacheRef.current = next;
        // Sort by ID to ensure React elements aren't unmounted/remounted unnecessarily when distances swap
        next.sort((a, b) => a.rootIdx - b.rootIdx);
        setVisibleRoots([...next]);
      }
    }
  });

  // ── Click handler ───────────────────────────────────────────────────────────
  const handleClick = useCallback((e: { stopPropagation: () => void; instanceId?: number }) => {
    e.stopPropagation();
    if (e.instanceId === undefined) return;
    const root = verbRoots[e.instanceId];
    setSelectedRoot(root.id);
  }, [setSelectedRoot]);

  return (
    <>
      {/* Galactic Path Line */}
      <lineSegments geometry={webGeo}>
        <lineBasicMaterial ref={webMatRef} color="#4a9eff" transparent opacity={0.3} />
      </lineSegments>

      {/* Root spheres — clickable */}
      <instancedMesh
        ref={meshRef}
        args={[SPHERE_GEO, INST_MAT, count]}
        onClick={handleClick}
        onPointerMove={(e) => {
          if (e.instanceId !== undefined) {
            document.body.style.cursor = 'pointer';
            setHoveredRoot(verbRoots[e.instanceId].id);
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHoveredRoot(null);
        }}
        onPointerMissed={() => setHoveredRoot(null)}
      />

      {/* Root word labels — only closest or hovered/selected */}
      {visibleRoots.map(({ rootIdx, size }, i) => {
        const root = verbRoots[rootIdx];
        const p = positions[rootIdx];
        
        // Show label if it's the selected root, hovered root, or one of the top 2 closest roots.
        // In simulation mode, visibleRoots is naturally restricted to the 3 active roots, so we always show them.
        const isSelected = selectedRoot === root.id;
        const isHovered = hoveredRoot === root.id;
        const isClosest = simulationActive ? true : i < 3;
        
        const shouldShowLabel = isSelected || isHovered || isClosest;

        if (!shouldShowLabel) return null;

        const isDimmed = selectedRoot !== null 
          ? !isSelected 
          : searchSet !== null && !searchSet.has(root.id);

        return (
          <Html
            key={`h-${rootIdx}`}
            position={[p.x, p.y, p.z]}
            center
            zIndexRange={[100, 0]}
            style={{
              transition: 'opacity 0.2s, transform 0.2s',
              opacity: isSelected ? 1 : isDimmed ? 0.05 : 1,
              pointerEvents: isDimmed && !isSelected ? 'none' : 'auto',
              transform: `scale(${size * 0.7})`,
              userSelect: 'none',
              cursor: 'pointer',
            }}
          >
            <div 
              onClick={(e) => { e.stopPropagation(); setSelectedRoot(root.id); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
            >
              <span style={{
                position: 'absolute',
                top: '-20px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace',
                letterSpacing: '0.1em'
              }}>
                #{rootIdx + 1}
              </span>
              <span style={{
                fontSize: isSelected ? '32px' : isHovered ? '28px' : '20px',
                fontWeight: 600,
                color: '#fff',
                fontFamily: "'Scheherazade New', serif",
                direction: 'rtl',
                whiteSpace: 'nowrap',
                letterSpacing: '4px',
                background: isSelected ? 'rgba(255, 153, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid rgba(255, 153, 0, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '4px 20px',
                borderRadius: '8px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: isSelected
                  ? '0 8px 32px rgba(255, 153, 0, 0.2)'
                  : '0 4px 24px rgba(0,0,0,0.4)',
                textShadow: isSelected
                  ? '0 0 20px rgba(255,153,0,0.4)'
                  : '0 0 10px rgba(255,255,255,0.4)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}>
                {root.rootLetters.join(' ')}
              </span>
              
              {(() => {
                const m = root.meaning;
                const isEnglish = m.includes(' ') || m.startsWith('to ');
                if (!isEnglish) return null;
                return (
                  <span style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    fontWeight: 400,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isSelected ? '#ffb340' : '#8ab8dd',
                    background: 'transparent',
                    padding: 0,
                    whiteSpace: 'nowrap',
                    opacity: isSelected || isHovered ? 1 : 0.7,
                    transition: 'all 0.3s ease',
                  }}>
                    {m}
                  </span>
                );
              })()}
            </div>
          </Html>
        );
      })}
    </>
  );
};
