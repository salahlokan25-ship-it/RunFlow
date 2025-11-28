export const COLORS = {
  background: '#000000', // Deep Black
  surface: '#111827', // Gray 900
  surfaceHighlight: '#1F2937', // Gray 800
  primary: '#EA580C', // Orange 600
  primaryHighlight: '#F97316', // Orange 500
  secondary: '#22C55E', // Green 500
  accent: '#8B5CF6', // Violet 500
  text: '#FFFFFF',
  textSecondary: '#9CA3AF', // Gray 400
  textTertiary: '#6B7280', // Gray 500
  border: '#1F2937', // Gray 800
  error: '#EF4444', // Red 500
  success: '#22C55E', // Green 500
  warning: '#F59E0B', // Amber 500
  overlay: 'rgba(0, 0, 0, 0.75)',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
  round: 9999,
};

export const FONT_SIZE = {
  xs: 12,
  s: 14,
  m: 16,
  l: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
  },
  glow: {
    shadowColor: '#EA580C',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  }
};

export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  shadows: SHADOWS,
};
