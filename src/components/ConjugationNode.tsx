import React, { useState } from 'react';
import { Text, Billboard } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
import type { ConjugationForm } from '../data/verbs';

const ARABIC_FONT = '/fonts/ScheherazadeNew-Bold.ttf';

interface Props {
  form: ConjugationForm;
  targetPosition: THREE.Vector3;
  originPosition: THREE.Vector3;
}

export const ConjugationNode: React.FC<Props> = ({ form, targetPosition, originPosition }) => {
  const [hovered, setHovered] = useState(false);

  const springProps = useSpring({
    position: [targetPosition.x, targetPosition.y, targetPosition.z] as [number, number, number],
    scale: hovered ? 1.6 : 1,
    from: {
      position: [originPosition.x, originPosition.y, originPosition.z] as [number, number, number],
      scale: 0,
    },
    config: { mass: 1, tension: 200, friction: 22 },
  });

  return (
    <>
      <animated.mesh
        position={springProps.position}
        scale={springProps.scale}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          color={hovered ? '#ffffff' : '#b0b0c8'}
          emissive={hovered ? '#9090ff' : '#303050'}
          emissiveIntensity={hovered ? 1.2 : 0.5}
          roughness={0.3}
          metalness={0.4}
        />
      </animated.mesh>

      {/* Text label — billboard */}
      <animated.group position={springProps.position}>
        <Billboard follow>
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.12}
            color={hovered ? '#aaaadd' : '#7070aa'}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {form.person}
          </Text>
          <Text
            position={[0, 0.25, 0]}
            fontSize={0.28}
            color={hovered ? '#ffffff' : '#e0e0ff'}
            anchorX="center"
            anchorY="bottom"
            font={ARABIC_FONT}
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {form.arabic}
          </Text>
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.12}
            color="#7070aa"
            anchorX="center"
            anchorY="bottom"
            maxWidth={3}
            outlineWidth={0.008}
            outlineColor="#000000"
          >
            {form.english}
          </Text>
        </Billboard>
      </animated.group>
    </>
  );
};
