import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        card: '#111111',
        elevated: '#1A1A1A',
        gold: {
          DEFAULT: '#D4A574',
          light: '#E8C9A0',
          dim: 'rgba(212,165,116,0.15)',
        },
        emerald: {
          DEFAULT: '#00A86B',
        },
        muted: 'rgba(255,255,255,0.55)',
        'muted-more': 'rgba(255,255,255,0.30)',
        border: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'serif'],
      },
      fontSize: {
        hero: ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '200' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
