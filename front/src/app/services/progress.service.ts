import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiResponse, UserProgress } from '../models';

export interface ProgressCounts {
  memorized: number;
  dueForReview: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private apiUrl = 'http://localhost:8080/api/progress';

  constructor(private http: HttpClient) {}

  /**
   * Get all progress records
   */
  getAllProgress(): Observable<UserProgress[]> {
    return this.http.get<ApiResponse<UserProgress[]>>(this.apiUrl)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching progress:', error);
          return of([]);
        })
      );
  }

  /**
   * Get progress for a specific ayah
   */
  getProgressByAyah(ayahId: number): Observable<UserProgress | null> {
    return this.http.get<ApiResponse<UserProgress>>(`${this.apiUrl}/ayah/${ayahId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching ayah progress:', error);
          return of(null);
        })
      );
  }

  /**
   * Get all memorized ayahs
   */
  getMemorizedAyahs(): Observable<UserProgress[]> {
    return this.http.get<ApiResponse<UserProgress[]>>(`${this.apiUrl}/memorized`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching memorized ayahs:', error);
          return of([]);
        })
      );
  }

  /**
   * Get ayahs due for review
   */
  getDueForReview(limit?: number): Observable<UserProgress[]> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }

    return this.http.get<ApiResponse<UserProgress[]>>(`${this.apiUrl}/due-for-review`, { params })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching due for review:', error);
          return of([]);
        })
      );
  }

  /**
   * Get progress by surah
   */
  getProgressBySurah(surahId: number): Observable<UserProgress[]> {
    return this.http.get<ApiResponse<UserProgress[]>>(`${this.apiUrl}/surah/${surahId}`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching surah progress:', error);
          return of([]);
        })
      );
  }

  /**
   * Get counts (memorized and due for review)
   */
  getCounts(): Observable<ProgressCounts> {
    return this.http.get<ApiResponse<ProgressCounts>>(`${this.apiUrl}/counts`)
      .pipe(
        map(response => response.data || { memorized: 0, dueForReview: 0 }),
        catchError(error => {
          console.error('Error fetching counts:', error);
          return of({ memorized: 0, dueForReview: 0 });
        })
      );
  }

  /**
   * Save progress
   */
  saveProgress(progress: Partial<UserProgress>): Observable<UserProgress | null> {
    return this.http.post<ApiResponse<UserProgress>>(this.apiUrl, progress)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error saving progress:', error);
          return of(null);
        })
      );
  }

  /**
   * Mark ayah as memorized
   */
  markAsMemorized(ayahId: number, surahId: number): Observable<UserProgress | null> {
    return this.http.post<ApiResponse<UserProgress>>(
      `${this.apiUrl}/memorize/${ayahId}`,
      null,
      { params: { surahId: surahId.toString() } }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error marking as memorized:', error);
        return of(null);
      })
    );
  }

  /**
   * Remove memorized status
   */
  unmarkMemorized(ayahId: number): Observable<UserProgress | null> {
    return this.http.delete<ApiResponse<UserProgress>>(`${this.apiUrl}/memorize/${ayahId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error unmarking memorized:', error);
          return of(null);
        })
      );
  }

  /**
   * Record a review result (simple correct/incorrect)
   */
  recordReview(ayahId: number, correct: boolean): Observable<UserProgress | null> {
    return this.http.post<ApiResponse<UserProgress>>(
      `${this.apiUrl}/review/${ayahId}`,
      null,
      { params: { correct: correct.toString() } }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error recording review:', error);
        return of(null);
      })
    );
  }

  /**
   * Record a review with quality score (SM-2)
   */
  recordReviewWithQuality(ayahId: number, quality: number): Observable<UserProgress | null> {
    return this.http.post<ApiResponse<UserProgress>>(
      `${this.apiUrl}/review/${ayahId}/quality`,
      null,
      { params: { quality: quality.toString() } }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error recording review:', error);
        return of(null);
      })
    );
  }

  /**
   * Update notes for an ayah
   */
  updateNotes(ayahId: number, notes: string): Observable<UserProgress | null> {
    return this.http.put<ApiResponse<UserProgress>>(
      `${this.apiUrl}/notes/${ayahId}`,
      { notes }
    ).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error updating notes:', error);
        return of(null);
      })
    );
  }

  /**
   * Delete progress for an ayah
   */
  deleteProgress(ayahId: number): Observable<boolean> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${ayahId}`)
      .pipe(
        map(() => true),
        catchError(error => {
          console.error('Error deleting progress:', error);
          return of(false);
        })
      );
  }

  /**
   * Bulk sync progress from localStorage
   */
  syncProgress(progressList: Partial<UserProgress>[]): Observable<UserProgress[]> {
    return this.http.post<ApiResponse<UserProgress[]>>(`${this.apiUrl}/sync`, progressList)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error syncing progress:', error);
          return of([]);
        })
      );
  }

  /**
   * Get progress for multiple ayahs
   */
  getProgressBatch(ayahIds: number[]): Observable<UserProgress[]> {
    return this.http.post<ApiResponse<UserProgress[]>>(`${this.apiUrl}/batch`, ayahIds)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching batch progress:', error);
          return of([]);
        })
      );
  }
}
