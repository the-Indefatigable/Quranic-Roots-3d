/**
 * Augment React JSX types so that Three.js primitives used inside @react-three/fiber
 * <Canvas> are recognised by the TypeScript compiler.
 *
 * React 19 moved the JSX namespace inside `React`, so we augment both the legacy
 * global JSX namespace (used by the compiler) AND the React-scoped one.
 */
import type { ThreeElements } from '@react-three/fiber';

// The legacy global namespace that the TS compiler resolves for JSX element names:
declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// React 19 scoped namespace (belt-and-suspenders):
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
