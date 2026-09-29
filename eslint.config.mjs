// ESLint config (flat format). Run with `npm run lint`.
// Uses Next.js's recommended rules (incl. React hooks and Core Web Vitals)
// plus its TypeScript rules.
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
