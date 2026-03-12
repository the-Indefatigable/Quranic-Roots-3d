import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import type { VerbRoot } from '../data/verbs';
import { useStore } from '../store/useStore';
import { BabNode } from './BabNode';
import { getBabPositions } from '../utils/layout';

interface Props {
  root: VerbRoot;
  position: THREE.Vector3;
  dimmed: boolean;
}

const NORMAL_COLOR = '#4a9eff';
const SELECTED_COLOR = '#ff9900';
const NORMAL_EMISSIVE = '#112244';
const SELECTED_EMISSIVE = '#662200';

export const RootNode: React.FC<Props> = ({ root, position, dimmed }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { selectedRoot, setSelectedRoot } = useStore();
  const { camera } = useThree();
  const isSelected = selectedRoot === root.id;

  const color = isSelected ? SELECTED_COLOR : NORMAL_COLOR;
  const emissive = isSelected ? SELECTED_EMISSIVE : NORMAL_EMISSIVE;

  const springProps = useSpring({
    scale: isSelected ? 1.5 : 1.0,
    config: { mass: 1, tension: 250, friction: 20 },
  });

  // Pulse animation
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.8) * 0.06;
    const baseScale = isSelected ? 1.5 : 1.0;
    meshRef.current.scale.setScalar(pulse * baseScale);
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setSelectedRoot(root.id);

    // Gently move camera toward the node
    const targetPos = new THREE.Vector3(
      position.x * 0.55,
      position.y * 0.55,
      position.z * 0.55 + 14
    );
    (camera as THREE.PerspectiveCamera & { __targetPos?: THREE.Vector3 }).__targetPos = targetPos;
  };

  const babPositions = getBabPositions(position, root.babs.length);

  return (
    <>
      {/* Root sphere */}
      <animated.mesh
        ref={meshRef}
        position={[position.x, position.y, position.z]}
        scale={springProps.scale}
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={isSelected ? 2.5 : 1.0}
          roughness={0.15}
          metalness={0.6}
          transparent
          opacity={dimmed ? 0.18 : 1}
        />

        {/* Arabic root letters */}
        <Html
          position={[0, 1.4, 0]}
          center
          distanceFactor={16}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              opacity: dimmed ? 0.2 : 1,
              transition: 'opacity 0.4s ease',
            }}
          >
            <span
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#ffffff',
                fontFamily: "'Scheherazade New', serif",
                direction: 'rtl',
                letterSpacing: '4px',
                textShadow: isSelected
                  ? `0 0 16px ${SELECTED_COLOR}, 0 0 32px ${SELECTED_COLOR}88, 0 0 48px ${SELECTED_COLOR}44`
                  : `0 0 12px ${NORMAL_COLOR}, 0 0 24px ${NORMAL_COLOR}66`,
              }}
            >
              {root.rootLetters.join(' ')}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: isSelected ? SELECTED_COLOR : '#7ab0dd',
                letterSpacing: '0.06em',
                textShadow: '0 0 6px rgba(0,0,0,0.8)',
              }}
            >
              {root.meaning}
            </span>
          </div>
        </Html>
      </animated.mesh>

      {/* Bab nodes — only rendered when this root is selected */}
      {isSelected &&
        root.babs.map((bab, i) => (
          <BabNode
            key={bab.id}
            bab={bab}
            targetPosition={babPositions[i]}
            rootPosition={position}
          />
        ))}

      {/* Lines from root to each bab node */}
      {isSelected && (
        <RootToBabLines
          rootPos={position}
          babPositions={babPositions}
          color={SELECTED_COLOR}
        />
      )}
    </>
  );
};

// ── thin lines root → bab ─────────────────────────────────────────────────────
interface LinesProps {
  rootPos: THREE.Vector3;
  babPositions: THREE.Vector3[];
  color: string;
}

const RootToBabLines: React.FC<LinesProps> = ({ rootPos, babPositions, color }) => {
  const points: number[] = [];
  babPositions.forEach((bp) => {
    points.push(rootPos.x, rootPos.y, rootPos.z);
    points.push(bp.x, bp.y, bp.z);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.35} />
    </lineSegments>
  );
};
