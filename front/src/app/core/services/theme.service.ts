import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Theme, CSS_VARIABLE_MAP } from '../models/theme.models';
import { THEMES, DEFAULT_THEME } from '../config/themes.config';
import { StorageService } from '../../services/storage.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageService = inject(StorageService);

  private themeSubject = new BehaviorSubject<Theme>(DEFAULT_THEME);
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.loadSavedTheme();
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.themeSubject.value;
  }

  /**
   * Get all available themes
   */
  getThemes(): Theme[] {
    return THEMES;
  }

  /**
   * Get themes grouped by category
   */
  getThemesByCategory() {
    return {
      islamic: THEMES.filter(t => t.category === 'islamic'),
      accessibility: THEMES.filter(t => t.category === 'accessibility'),
    };
  }

  /**
   * Set theme by ID
   */
  setTheme(themeId: string): void {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      this.themeSubject.next(theme);
      this.applyTheme(theme);
      this.storageService.saveSetting('theme', themeId);
    }
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    // Set data-theme attribute for CSS selector
    document.documentElement.setAttribute('data-theme', theme.id);
    document.body.setAttribute('data-theme', theme.id);

    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([colorKey, colorValue]) => {
      const cssVar = CSS_VARIABLE_MAP[colorKey as keyof typeof CSS_VARIABLE_MAP];
      if (cssVar) {
        document.documentElement.style.setProperty(cssVar, colorValue);
      }
    });

    // Apply effects (shadows, etc.)
    Object.entries(theme.effects).forEach(([effectKey, effectValue]) => {
      document.documentElement.style.setProperty(`--effect-${effectKey}`, effectValue);
    });
  }

  /**
   * Load saved theme from storage or use default
   */
  private loadSavedTheme(): void {
    try {
      const savedThemeId = this.storageService.loadSetting('theme', DEFAULT_THEME.id) as string;
      this.setTheme(savedThemeId);
    } catch (error) {
      console.error('Error loading theme:', error);
      this.setTheme(DEFAULT_THEME.id);
    }
  }
}
