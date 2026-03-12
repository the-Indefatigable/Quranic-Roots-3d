import React, { useMemo } from 'react';
import { Text, Billboard } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import type { Bab } from '../data/verbs';
import { useStore } from '../store/useStore';
import { TenseNode } from './TenseNode';
import { getTensePositions } from '../utils/layout';

const ARABIC_FONT = '/fonts/ScheherazadeNew-Bold.ttf';

interface Props {
  bab: Bab;
  targetPosition: THREE.Vector3;
  rootPosition: THREE.Vector3;
}

export const BabNode: React.FC<Props> = ({ bab, targetPosition, rootPosition }) => {
  const { expandedBab, setExpandedBab, setExpandedTense } = useStore();
  const isExpanded = expandedBab === bab.id;
  const color = bab.color;

  const springProps = useSpring({
    position: [targetPosition.x, targetPosition.y, targetPosition.z] as [number, number, number],
    scale: isExpanded ? 1.5 : 1.0,
    from: {
      position: [rootPosition.x, rootPosition.y, rootPosition.z] as [number, number, number],
      scale: 0,
    },
    config: { mass: 1.2, tension: 180, friction: 24 },
  });

  const tensePositions = getTensePositions(targetPosition, bab.tenses.length);

  return (
    <>
      <animated.mesh
        position={springProps.position}
        scale={springProps.scale}
        onClick={(e) => {
          e.stopPropagation();
          setExpandedBab(bab.id);
          setExpandedTense(null);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isExpanded ? 2.2 : 0.6}
          roughness={0.2}
          metalness={0.55}
          transparent
          opacity={0.92}
        />
      </animated.mesh>

      {/* Text label — billboard so it always faces camera */}
      <animated.group position={springProps.position}>
        <Billboard follow>
          <Text
            position={[0, 1.0, 0]}
            fontSize={0.22}
            color={color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.015}
            outlineColor="#000000"
            fontWeight="bold"
          >
            {`Form ${bab.romanNumeral}`}
          </Text>
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.45}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            font={ARABIC_FONT}
            outlineWidth={0.025}
            outlineColor="#000000"
          >
            {bab.arabicPattern}
          </Text>
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.18}
            color="#aaaacc"
            anchorX="center"
            anchorY="bottom"
            maxWidth={4}
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {bab.meaning}
          </Text>
        </Billboard>
      </animated.group>

      {/* Tense nodes — only when this bab is expanded */}
      {isExpanded &&
        bab.tenses.map((tense, i) => (
          <TenseNode
            key={tense.id}
            tense={tense}
            targetPosition={tensePositions[i]}
            babPosition={targetPosition}
          />
        ))}

      {/* Lines from bab to tense nodes */}
      {isExpanded && (
        <BabToTenseLines
          babPos={targetPosition}
          tensePositions={tensePositions}
          color={color}
        />
      )}
    </>
  );
};

// ── thin lines bab → tense ────────────────────────────────────────────────────
const BabToTenseLines: React.FC<{
  babPos: THREE.Vector3;
  tensePositions: THREE.Vector3[];
  color: string;
}> = ({ babPos, tensePositions, color }) => {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    tensePositions.forEach((tp) => {
      pts.push(babPos.x, babPos.y, babPos.z, tp.x, tp.y, tp.z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [babPos, tensePositions]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.3} />
    </lineSegments>
  );
};
