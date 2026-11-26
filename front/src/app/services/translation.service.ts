import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiResponse, AyahTranslation } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private apiUrl = 'http://localhost:8080/api/translations';

  // Cache for loaded translations
  private translationCache = new Map<string, AyahTranslation>();

  constructor(private http: HttpClient) {}

  /**
   * Get translation for a specific Ayah
   */
  getAyahTranslation(ayahId: number): Observable<AyahTranslation | null> {
    const cacheKey = `ayah-${ayahId}`;
    if (this.translationCache.has(cacheKey)) {
      return of(this.translationCache.get(cacheKey)!);
    }

    return this.http.get<ApiResponse<AyahTranslation>>(`${this.apiUrl}/ayah/${ayahId}`)
      .pipe(
        map(response => {
          if (response.data) {
            this.translationCache.set(cacheKey, response.data);
          }
          return response.data;
        }),
        catchError(error => {
          console.error('Error fetching ayah translation:', error);
          return of(null);
        })
      );
  }

  /**
   * Get translations for all Ayahs in a Surah
   */
  getSurahTranslations(surahId: number): Observable<Map<number, AyahTranslation>> {
    return this.http.get<ApiResponse<Record<string, AyahTranslation>>>(`${this.apiUrl}/surah/${surahId}`)
      .pipe(
        map(response => {
          const result = new Map<number, AyahTranslation>();
          if (response.data) {
            Object.entries(response.data).forEach(([key, value]) => {
              const ayahId = parseInt(key);
              result.set(ayahId, value);
              this.translationCache.set(`ayah-${ayahId}`, value);
            });
          }
          return result;
        }),
        catchError(error => {
          console.error('Error fetching surah translations:', error);
          return of(new Map());
        })
      );
  }

  /**
   * Get translations for all Ayahs on a Page
   */
  getPageTranslations(pageNumber: number): Observable<Map<number, AyahTranslation>> {
    return this.http.get<ApiResponse<Record<string, AyahTranslation>>>(`${this.apiUrl}/page/${pageNumber}`)
      .pipe(
        map(response => {
          const result = new Map<number, AyahTranslation>();
          if (response.data) {
            Object.entries(response.data).forEach(([key, value]) => {
              const ayahId = parseInt(key);
              result.set(ayahId, value);
              this.translationCache.set(`ayah-${ayahId}`, value);
            });
          }
          return result;
        }),
        catchError(error => {
          console.error('Error fetching page translations:', error);
          return of(new Map());
        })
      );
  }

  /**
   * Get available translation languages
   */
  getAvailableLanguages(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/languages`)
      .pipe(
        map(response => response.data || ['en', 'fr', 'de']),
        catchError(() => of(['en', 'fr', 'de']))
      );
  }

  /**
   * Clear the translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
  }
}
