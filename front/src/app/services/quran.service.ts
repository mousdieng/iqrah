import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiResponse, Ayah, Surah, SurahDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class QuranService {
  private apiUrl = 'http://localhost:8080/api/quran';

  constructor(private http: HttpClient) {}

  /**
   * Get a specific Ayah by its number
   */
  getAyah(ayahNumber: number): Observable<Ayah | null> {
    return this.http.get<ApiResponse<Ayah>>(`${this.apiUrl}/aya/${ayahNumber}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching Ayah:', error);
          return of(null);
        })
      );
  }

  /**
   * Get a complete Surah with all its Ayahs
   */
  getSurah(surahNumber: number): Observable<SurahDTO | null> {
    return this.http.get<ApiResponse<SurahDTO>>(`${this.apiUrl}/surah/${surahNumber}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching Surah:', error);
          return of(null);
        })
      );
  }

  /**
   * Get all Surahs (without Ayahs)
   */
  getAllSurahs(): Observable<SurahDTO[]> {
    return this.http.get<ApiResponse<SurahDTO[]>>(`${this.apiUrl}/surahs`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching all Surahs:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all Ayahs in a specific Juz
   */
  getJuz(juzNumber: number): Observable<Ayah[]> {
    return this.http.get<ApiResponse<Ayah[]>>(`${this.apiUrl}/juz/${juzNumber}`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching Juz:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all Ayahs on a specific page
   */
  getPage(pageNumber: number): Observable<Ayah[]> {
    return this.http.get<ApiResponse<Ayah[]>>(`${this.apiUrl}/page/${pageNumber}`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching Page:', error);
          return of([]);
        })
      );
  }

  /**
   * Get a specific page within a Surah
   */
  getSurahPage(surahNumber: number, pageNumber: number): Observable<Ayah[]> {
    return this.http.get<ApiResponse<Ayah[]>>(`${this.apiUrl}/page/${surahNumber}/${pageNumber}`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching Surah Page:', error);
          return of([]);
        })
      );
  }

  /**
   * Get a random Ayah
   */
  getRandomAyah(): Observable<Ayah | null> {
    return this.http.get<ApiResponse<Ayah>>(`${this.apiUrl}/random`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching random Ayah:', error);
          return of(null);
        })
      );
  }

  /**
   * Get a range of Ayahs
   */
  getAyahRange(from: number, to: number): Observable<Ayah[]> {
    const params = new HttpParams()
      .set('from', from.toString())
      .set('to', to.toString());

    return this.http.get<ApiResponse<Ayah[]>>(`${this.apiUrl}/range`, { params })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching Ayah range:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all available reciters
   */
  getReciters(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/reciters`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching reciters:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all available translators
   */
  getTranslators(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/translators`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching translators:', error);
          return of([]);
        })
      );
  }

  /**
   * Search Ayahs by text (client-side for now)
   */
  searchAyahs(query: string, surahNumber?: number): Observable<Ayah[]> {
    // This would need a backend endpoint for proper search
    // For now, we'll implement client-side search
    if (surahNumber) {
      return this.getSurah(surahNumber).pipe(
        map(surah => {
          if (!surah || !surah.ayahs) return [];
          return surah.ayahs.filter(ayah =>
            ayah.text.includes(query)
          );
        })
      );
    }
    return of([]);
  }
}
