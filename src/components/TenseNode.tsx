import React, { useMemo } from 'react';
import { Text, Billboard } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import type { Tense } from '../data/verbs';
import { useStore } from '../store/useStore';
import { ConjugationNode } from './ConjugationNode';
import { getConjugationPositions } from '../utils/layout';

const ARABIC_FONT = '/fonts/ScheherazadeNew-Bold.ttf';

interface Props {
  tense: Tense;
  targetPosition: THREE.Vector3;
  babPosition: THREE.Vector3;
}

export const TenseNode: React.FC<Props> = ({ tense, targetPosition, babPosition }) => {
  const { expandedTense, setExpandedTense } = useStore();
  const isExpanded = expandedTense === tense.id;
  const color = tense.color;

  const springProps = useSpring({
    position: [targetPosition.x, targetPosition.y, targetPosition.z] as [number, number, number],
    scale: isExpanded ? 1.4 : 1.0,
    from: {
      position: [babPosition.x, babPosition.y, babPosition.z] as [number, number, number],
      scale: 0,
    },
    config: { mass: 1.1, tension: 200, friction: 22 },
  });

  const conjPositions = getConjugationPositions(targetPosition, tense.conjugation.length);

  return (
    <>
      <animated.mesh
        position={springProps.position}
        scale={springProps.scale}
        onClick={(e) => {
          e.stopPropagation();
          setExpandedTense(tense.id);
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'default')}
      >
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isExpanded ? 2.5 : 0.9}
          roughness={0.18}
          metalness={0.5}
        />
      </animated.mesh>

      {/* Text label — billboard */}
      <animated.group position={springProps.position}>
        <Billboard follow>
          <Text
            position={[0, 0.7, 0]}
            fontSize={0.35}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            font={ARABIC_FONT}
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {tense.arabicName}
          </Text>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.18}
            color={color}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {tense.englishName}
          </Text>
          <Text
            position={[0, 0.2, 0]}
            fontSize={0.14}
            color="#606080"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {`×${tense.occurrences}`}
          </Text>
        </Billboard>
      </animated.group>

      {/* Conjugation nodes — only when this tense is expanded */}
      {isExpanded &&
        tense.conjugation.map((cj, i) => (
          <ConjugationNode
            key={cj.person}
            form={cj}
            targetPosition={conjPositions[i]}
            originPosition={targetPosition}
          />
        ))}

      {/* Lines: tense → conjugation nodes */}
      {isExpanded && (
        <TenseToConjugationLines
          tensePos={targetPosition}
          conjPositions={conjPositions}
          color={color}
        />
      )}
    </>
  );
};

// ── thin lines tense → conjugation ────────────────────────────────────────────
const TenseToConjugationLines: React.FC<{
  tensePos: THREE.Vector3;
  conjPositions: THREE.Vector3[];
  color: string;
}> = ({ tensePos, conjPositions, color }) => {
  const geometry = useMemo(() => {
    const pts: number[] = [];
    conjPositions.forEach((cp) => {
      pts.push(tensePos.x, tensePos.y, tensePos.z, cp.x, cp.y, cp.z);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [tensePos, conjPositions]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.22} />
    </lineSegments>
  );
};
