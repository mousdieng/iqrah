import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProgress, FavoriteAya } from '../models';

/**
 * Service to handle local storage for user progress and favorites
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PROGRESS_KEY = 'quran_user_progress';
  private readonly FAVORITES_KEY = 'quran_favorites';
  private readonly SETTINGS_KEY = 'quran_settings';

  private progressSubject = new BehaviorSubject<UserProgress[]>(this.loadProgress());
  private favoritesSubject = new BehaviorSubject<FavoriteAya[]>(this.loadFavorites());

  public progress$ = this.progressSubject.asObservable();
  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {}

  // ========== Progress Methods ==========

  /**
   * Load progress from local storage
   */
  private loadProgress(): UserProgress[] {
    try {
      const data = localStorage.getItem(this.PROGRESS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading progress:', error);
      return [];
    }
  }

  /**
   * Save progress to local storage
   */
  private saveProgress(progress: UserProgress[]): void {
    try {
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
      this.progressSubject.next(progress);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Get all progress
   */
  getProgress(): UserProgress[] {
    return this.progressSubject.value;
  }

  /**
   * Get progress for a specific ayah
   */
  getAyahProgress(ayahId: number): UserProgress | undefined {
    return this.progressSubject.value.find(p => p.ayahId === ayahId);
  }

  /**
   * Update progress for an ayah
   */
  updateProgress(progress: Partial<UserProgress> & { ayahId: number }): void {
    const currentProgress = this.progressSubject.value;
    const existingIndex = currentProgress.findIndex(p => p.ayahId === progress.ayahId);

    if (existingIndex >= 0) {
      // Update existing
      currentProgress[existingIndex] = {
        ...currentProgress[existingIndex],
        ...progress,
        lastReviewDate: new Date()
      };
    } else {
      // Add new
      const newProgress: UserProgress = {
        id: Date.now(),
        surahId: progress.surahId || 0,
        ayahId: progress.ayahId,
        memorized: progress.memorized || false,
        lastReviewDate: new Date(),
        reviewCount: progress.reviewCount || 0,
        difficulty: progress.difficulty || 'MEDIUM',
        notes: progress.notes
      };
      currentProgress.push(newProgress);
    }

    this.saveProgress(currentProgress);
  }

  /**
   * Mark ayah as memorized
   */
  markAsMemorized(ayahId: number, surahId: number): void {
    const existing = this.getAyahProgress(ayahId);
    this.updateProgress({
      ayahId,
      surahId,
      memorized: true,
      reviewCount: (existing?.reviewCount || 0) + 1
    });
  }

  /**
   * Get memorized ayahs
   */
  getMemorizedAyahs(): UserProgress[] {
    return this.progressSubject.value.filter(p => p.memorized);
  }

  /**
   * Get ayahs due for review (based on spaced repetition)
   */
  getAyahsDueForReview(): UserProgress[] {
    const now = new Date();
    return this.progressSubject.value.filter(p => {
      if (!p.lastReviewDate) return true;

      const lastReview = new Date(p.lastReviewDate);
      const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

      // Simple spaced repetition algorithm
      const reviewInterval = this.getReviewInterval(p.reviewCount, p.difficulty);
      return daysSinceReview >= reviewInterval;
    });
  }

  /**
   * Calculate review interval based on review count and difficulty
   */
  private getReviewInterval(reviewCount: number, difficulty: string): number {
    const baseIntervals = {
      'EASY': [1, 3, 7, 14, 30, 60],
      'MEDIUM': [1, 2, 4, 7, 14, 30],
      'HARD': [1, 1, 2, 3, 5, 7]
    };

    const intervals = baseIntervals[difficulty as keyof typeof baseIntervals] || baseIntervals['MEDIUM'];
    const index = Math.min(reviewCount, intervals.length - 1);
    return intervals[index];
  }

  // ========== Favorites Methods ==========

  /**
   * Load favorites from local storage
   */
  private loadFavorites(): FavoriteAya[] {
    try {
      const data = localStorage.getItem(this.FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  /**
   * Save favorites to local storage
   */
  private saveFavorites(favorites: FavoriteAya[]): void {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      this.favoritesSubject.next(favorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  /**
   * Get all favorites
   */
  getFavorites(): FavoriteAya[] {
    return this.favoritesSubject.value;
  }

  /**
   * Check if ayah is favorite
   */
  isFavorite(ayahId: number): boolean {
    return this.favoritesSubject.value.some(f => f.ayahId === ayahId);
  }

  /**
   * Add ayah to favorites
   */
  addFavorite(ayahId: number, tags?: string[], notes?: string): void {
    const favorites = this.favoritesSubject.value;

    if (!this.isFavorite(ayahId)) {
      const newFavorite: FavoriteAya = {
        id: Date.now(),
        ayahId,
        tags,
        notes,
        createdAt: new Date()
      };
      favorites.push(newFavorite);
      this.saveFavorites(favorites);
    }
  }

  /**
   * Remove ayah from favorites
   */
  removeFavorite(ayahId: number): void {
    const favorites = this.favoritesSubject.value.filter(f => f.ayahId !== ayahId);
    this.saveFavorites(favorites);
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(ayahId: number): void {
    if (this.isFavorite(ayahId)) {
      this.removeFavorite(ayahId);
    } else {
      this.addFavorite(ayahId);
    }
  }

  /**
   * Update favorite
   */
  updateFavorite(ayahId: number, updates: Partial<FavoriteAya>): void {
    const favorites = this.favoritesSubject.value;
    const index = favorites.findIndex(f => f.ayahId === ayahId);

    if (index >= 0) {
      favorites[index] = { ...favorites[index], ...updates };
      this.saveFavorites(favorites);
    }
  }

  // ========== Settings Methods ==========

  /**
   * Save a setting
   */
  saveSetting(key: string, value: any): void {
    try {
      const settings = this.loadSettings();
      settings[key] = value;
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  }

  /**
   * Load a setting
   */
  loadSetting(key: string, defaultValue?: any): any {
    try {
      const settings = this.loadSettings();
      return settings[key] !== undefined ? settings[key] : defaultValue;
    } catch (error) {
      console.error('Error loading setting:', error);
      return defaultValue;
    }
  }

  /**
   * Load all settings
   */
  private loadSettings(): any {
    try {
      const data = localStorage.getItem(this.SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    localStorage.removeItem(this.PROGRESS_KEY);
    localStorage.removeItem(this.FAVORITES_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
    this.progressSubject.next([]);
    this.favoritesSubject.next([]);
  }
}
