import * as THREE from 'three';

/**
 * Generates positions along a vast, winding 3D spiral (The Galactic Path).
 * Roots ordered by frequency will be placed along this path.
 */
export function getRootPositions(count: number): THREE.Vector3[] {
  const positions: THREE.Vector3[] = [];
  
  for (let i = 0; i < count; i++) {
    // Angle determines rotation around the Y axis
    // Slower rotation as it gets further out looks majestic
    const angle = Math.pow(i, 0.85) * 0.6; 
    
    // Radius increases to spread things out vast distances
    const radius = 30 + i * 2.5; 
    
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Y undulates smoothly but generally goes downwards to create depth
    const y = Math.sin(i * 0.15) * 40 - (i * 0.5);
    
    // Add tiny random offset to make it look a bit more 'organic nebula' than mathematical
    // but keep it mostly tight to the spline
    const driftX = (Math.random() - 0.5) * 4;
    const driftY = (Math.random() - 0.5) * 4;
    const driftZ = (Math.random() - 0.5) * 4;

    positions.push(new THREE.Vector3(x + driftX, y + driftY, z + driftZ));
  }
  
  return positions;
}
