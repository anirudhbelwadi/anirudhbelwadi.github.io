import type { TextStyle } from 'react-native';

/**
 * Dark palette. The chart surface and series colours are the validated
 * dark-mode steps from the data-visualisation reference: blue and orange clear
 * colour-blind separation against #1a1a19 with room to spare.
 */
export const theme = {
  color: {
    background: '#121211',
    surface: '#1a1a19',
    surfaceRaised: '#232321',
    border: '#2e2e2b',
    borderStrong: '#3d3d39',
    textPrimary: '#ffffff',
    textSecondary: '#c3c2b7',
    textMuted: '#8d8c84',
    series1: '#3987e5',
    series2: '#d95926',
    series1Soft: 'rgba(57, 135, 229, 0.18)',
    danger: '#e66767',
  },
  space: (n: number) => n * 4,
  radius: { sm: 6, md: 10, lg: 14 },
  text: {
    display: { fontSize: 30, fontWeight: '700', letterSpacing: -0.6 } as TextStyle,
    title: { fontSize: 17, fontWeight: '600' } as TextStyle,
    body: { fontSize: 14, fontWeight: '400' } as TextStyle,
    label: { fontSize: 11, fontWeight: '600', letterSpacing: 0.7 } as TextStyle,
    /** Keeps digits from shifting width as values change. */
    mono: { fontVariant: ['tabular-nums'] } as TextStyle,
  },
};

export type Theme = typeof theme;
