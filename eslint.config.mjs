import next from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Replaces the previous eslint.config.js, which was a leftover Vite config: it
 * imported eslint-plugin-react-hooks, eslint-plugin-react-refresh and
 * typescript-eslint (none of which were installed), used
 * reactRefresh.configs.vite, ignored `dist` rather than `.next`, and declared
 * only browser globals — wrong for server components and route handlers. So
 * `npm run lint` could not run at all.
 *
 * eslint-config-next v16 ships native flat configs, so they are spread
 * directly rather than wrapped in FlatCompat.
 */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'drizzle/**',
      'archive/**',
      'marketing/**',
      // Standalone data/seed scripts: plain Node, not part of the app build,
      // and excluded from tsconfig too.
      'scripts/**',
      'next-env.d.ts',
    ],
  },
  ...(Array.isArray(next) ? next : [next]),
  ...(Array.isArray(nextCoreWebVitals) ? nextCoreWebVitals : [nextCoreWebVitals]),
  ...(Array.isArray(nextTypescript) ? nextTypescript : [nextTypescript]),
  {
    rules: {
      // The codebase uses `any` in a number of DB-boundary spots where the
      // Drizzle types are awkward. Worth tightening, but not as a blocking
      // error on every lint run today.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // eslint-config-next 16 ships the React Compiler rule set. This app is
      // React 18 without the compiler, so these fire on patterns that are
      // correct for it (~80 of them). Kept on as warnings — they are a useful
      // to-do list if the compiler is ever adopted — but they should not fail
      // a lint run today.
      'react-hooks/immutability': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/incompatible-library': 'warn',
    },
  },
];
