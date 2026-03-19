import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;

  // Simple noise function
  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    
    // Slow drift
    p.x += time * 0.02;
    p.y += time * 0.01;
    
    // Create soft nebula-like glows
    float n1 = noise(p * 2.0);
    float n2 = noise(p * 4.0 + time * 0.1);
    float n3 = noise(p * 8.0 - time * 0.05);
    
    float intensity = (n1 + n2 * 0.5 + n3 * 0.25) / 1.75;
    
    // Dark deep space colors mixed with a subtle golden/blue glow
    vec3 color1 = vec3(0.02, 0.03, 0.08); // Deep space
    vec3 color2 = vec3(0.1, 0.05, 0.15); // Purple nebula
    vec3 color3 = vec3(0.0, 0.1, 0.2); // Blue aura
    
    vec3 finalColor = mix(color1, color2, intensity);
    finalColor = mix(finalColor, color3, smoothstep(0.4, 0.8, intensity));
    
    // Output
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const NebulaBackground: React.FC = () => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={[0, 0, -500]} scale={[2000, 2000, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          time: { value: 0 }
        }}
        depthWrite={false}
      />
    </mesh>
  );
};
