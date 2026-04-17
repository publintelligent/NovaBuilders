export const COLORS = {
  dark: '#1a1a1a',
  dark2: '#111',
  dark3: '#0d0d0d',
  surface: '#ffffff',
  surface2: '#f5f5f5',
  border: '#e5e5e5',
  borderDark: '#333',
  gold: '#B8860B',
  goldLight: '#FFE080',
  goldDim: 'rgba(184,134,11,0.12)',
  text: '#1a1a1a',
  textMuted: '#888',
  textLight: '#aaa',
  success: '#34d399',
  successBg: 'rgba(52,211,153,0.12)',
  info: '#60a5fa',
  infoBg: 'rgba(96,165,250,0.12)',
  warning: '#fbbf24',
  warningBg: 'rgba(251,191,36,0.12)',
  danger: '#f87171',
  dangerBg: 'rgba(248,113,113,0.12)',
  white: '#ffffff',
};

export const FONTS = {
  regular: {fontWeight: '400' as const},
  medium: {fontWeight: '500' as const},
  semibold: {fontWeight: '600' as const},
  bold: {fontWeight: '700' as const},
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};
