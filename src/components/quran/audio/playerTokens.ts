// Design tokens and shared constants for the audio player.

export const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

export const G = {
  bg:           '#0E0D0C',
  gold:         '#D4A246',
  goldDim:      '#C89535',
  teal:         '#0D9488',
  surface:      'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  border:       'rgba(255,255,255,0.07)',
  goldBorder:   'rgba(212,162,70,0.15)',
  textPrimary:  '#EDEDEC',
  textSecond:   'rgba(237,237,236,0.55)',
  textTert:     'rgba(237,237,236,0.3)',
} as const;

export function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
