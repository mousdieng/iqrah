export type ThemeCategory = 'islamic' | 'accessibility';

export interface ThemeColors {
  // Surface colors
  background: string;
  surface: string;
  surfaceHover: string;

  // Brand colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  accentAlpha: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Semantic colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Quran-specific
  ayahText: string;
  ayahNumber: string;
  bismillah: string;
  mushafBackground: string;
  mushafBorder: string;

  // Component-specific
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  audioPlayerBg: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
}

export interface ThemeFonts {
  quran: string[];
  arabic: string[];
  ui: string[];
}

export interface ThemeEffects {
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;
}

export interface Theme {
  id: string;
  name: string;
  category: ThemeCategory;
  colors: ThemeColors;
  fonts: ThemeFonts;
  effects: ThemeEffects;
}

// CSS Variables mapping
export const CSS_VARIABLE_MAP: Record<keyof ThemeColors, string> = {
  background: '--color-background',
  surface: '--color-surface',
  surfaceHover: '--color-surface-hover',
  primary: '--color-primary',
  primaryDark: '--color-primary-dark',
  primaryLight: '--color-primary-light',
  accent: '--color-accent',
  accentLight: '--color-accent-light',
  accentAlpha: '--color-accent-alpha',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textMuted: '--color-text-muted',
  success: '--color-success',
  warning: '--color-warning',
  error: '--color-error',
  info: '--color-info',
  ayahText: '--color-ayah-text',
  ayahNumber: '--color-ayah-number',
  bismillah: '--color-bismillah',
  mushafBackground: '--color-mushaf-bg',
  mushafBorder: '--color-mushaf-border',
  headerBg: '--color-header-bg',
  cardBg: '--color-card-bg',
  cardBorder: '--color-card-border',
  audioPlayerBg: '--color-audio-player-bg',
  scrollbarTrack: '--color-scrollbar-track',
  scrollbarThumb: '--color-scrollbar-thumb',
};
