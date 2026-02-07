export const Colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    primary: '#1E6F5C',
    primaryDark: '#155744',
    primaryLight: '#289672',
    accent: '#29A073',
    accentLight: '#E8F8F3',
    text: '#2D3748',
    textSecondary: '#718096',
    textTertiary: '#A0AEC0',
    border: '#E2E8F0',
    borderLight: '#EDF2F7',
    error: '#E53E3E',
    warning: '#DD6B20',
    success: '#38A169',
    info: '#3182CE',
    // Gradient colors
    gradientStart: '#1E6F5C',
    gradientEnd: '#29A073',
    // Card colors
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  dark: {
    background: '#1A202C',
    surface: '#2D3748',
    primary: '#48BB78',
    primaryDark: '#38A169',
    primaryLight: '#68D391',
    accent: '#4FD1C5',
    accentLight: '#234E52',
    text: '#F7FAFC',
    textSecondary: '#CBD5E0',
    textTertiary: '#A0AEC0',
    border: '#4A5568',
    borderLight: '#2D3748',
    error: '#FC8181',
    warning: '#F6AD55',
    success: '#68D391',
    info: '#63B3ED',
    // Gradient colors
    gradientStart: '#2F855A',
    gradientEnd: '#38B2AC',
    // Card colors
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const Typography = {
  fontFamily: {
    arabic: 'System',
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    huge: 36,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
};
