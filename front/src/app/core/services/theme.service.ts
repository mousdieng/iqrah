import { Injectable, inject, signal } from '@angular/core';
import { Theme, CSS_VARIABLE_MAP } from '../models/theme.models';
import { THEMES, DEFAULT_THEME } from '../config/themes.config';
import { StorageService } from '../../services/storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageService = inject(StorageService);

  /** Current theme; templates can read it directly */
  readonly theme = signal<Theme>(DEFAULT_THEME);

  constructor() {
    this.loadSavedTheme();
  }

  getTheme(): Theme {
    return this.theme();
  }

  getThemes(): Theme[] {
    return THEMES;
  }

  /** Applies a theme by id; unknown ids (e.g. themes from an older version) fall back to the default */
  setTheme(themeId: string): void {
    const theme = THEMES.find(t => t.id === themeId) ?? DEFAULT_THEME;
    this.theme.set(theme);
    this.applyTheme(theme);
    this.storageService.saveSetting('theme', theme.id);
  }

  private applyTheme(theme: Theme): void {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    root.style.colorScheme = theme.id === 'sombre' ? 'dark' : 'light';

    Object.entries(theme.colors).forEach(([colorKey, colorValue]) => {
      const cssVar = CSS_VARIABLE_MAP[colorKey as keyof typeof CSS_VARIABLE_MAP];
      if (cssVar) root.style.setProperty(cssVar, colorValue);
    });

    Object.entries(theme.effects).forEach(([effectKey, effectValue]) => {
      root.style.setProperty(`--effect-${effectKey}`, effectValue);
    });
  }

  private loadSavedTheme(): void {
    try {
      this.setTheme(this.storageService.loadSetting('theme', DEFAULT_THEME.id) as string);
    } catch (error) {
      console.error('Error loading theme:', error);
      this.setTheme(DEFAULT_THEME.id);
    }
  }
}
