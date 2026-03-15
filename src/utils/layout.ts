import * as THREE from 'three';

// Seeded PRNG (mulberry32) — deterministic positions across renders/sessions
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generates positions along a vast, winding 3D spiral (The Galactic Path).
 * Roots ordered by frequency will be placed along this path.
 * Uses a seeded PRNG so positions are stable across renders.
 */
export function getRootPositions(count: number): THREE.Vector3[] {
  const rand = mulberry32(42); // fixed seed
  const positions: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const angle = Math.pow(i, 0.85) * 0.6;
    const radius = 30 + i * 2.5;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = Math.sin(i * 0.15) * 40 - (i * 0.5);

    // Deterministic organic offset
    const driftX = (rand() - 0.5) * 4;
    const driftY = (rand() - 0.5) * 4;
    const driftZ = (rand() - 0.5) * 4;

    positions.push(new THREE.Vector3(x + driftX, y + driftY, z + driftZ));
  }

  return positions;
}
