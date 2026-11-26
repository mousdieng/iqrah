import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { ApiResponse, DashboardStats, WeeklySummary, DailyStatistics, StreakInfo } from '../models';

export interface AllTimeTotals {
  totalReviewed: number;
  totalQuizzes: number;
  averageAccuracy: number;
}

export interface SurahProgressItem {
  surahId: number;
  memorized: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard overview statistics
   */
  getOverview(): Observable<DashboardStats> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/overview`)
      .pipe(
        map(response => response.data || this.getDefaultStats()),
        catchError(error => {
          console.error('Error fetching overview:', error);
          return of(this.getDefaultStats());
        })
      );
  }

  /**
   * Get today's statistics
   */
  getTodayStatistics(): Observable<DailyStatistics | null> {
    return this.http.get<ApiResponse<DailyStatistics>>(`${this.apiUrl}/today`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching today stats:', error);
          return of(null);
        })
      );
  }

  /**
   * Get daily statistics for last N days
   */
  getDailyStats(days: number = 30): Observable<DailyStatistics[]> {
    return this.http.get<ApiResponse<DailyStatistics[]>>(`${this.apiUrl}/daily`, {
      params: { days: days.toString() }
    }).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching daily stats:', error);
        return of([]);
      })
    );
  }

  /**
   * Get statistics by date range
   */
  getStatsByDateRange(startDate: string, endDate: string): Observable<DailyStatistics[]> {
    return this.http.get<ApiResponse<DailyStatistics[]>>(`${this.apiUrl}/range`, {
      params: { startDate, endDate }
    }).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching stats by range:', error);
        return of([]);
      })
    );
  }

  /**
   * Get weekly summary
   */
  getWeeklySummary(): Observable<WeeklySummary> {
    return this.http.get<ApiResponse<WeeklySummary>>(`${this.apiUrl}/weekly`)
      .pipe(
        map(response => response.data || this.getDefaultWeeklySummary()),
        catchError(error => {
          console.error('Error fetching weekly summary:', error);
          return of(this.getDefaultWeeklySummary());
        })
      );
  }

  /**
   * Get streak information
   */
  getStreakInfo(): Observable<StreakInfo> {
    return this.http.get<ApiResponse<StreakInfo>>(`${this.apiUrl}/streak`)
      .pipe(
        map(response => response.data || this.getDefaultStreakInfo()),
        catchError(error => {
          console.error('Error fetching streak info:', error);
          return of(this.getDefaultStreakInfo());
        })
      );
  }

  /**
   * Get memorization progress by surah
   */
  getProgressBySurah(): Observable<SurahProgressItem[]> {
    return this.http.get<ApiResponse<SurahProgressItem[]>>(`${this.apiUrl}/progress-by-surah`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching progress by surah:', error);
          return of([]);
        })
      );
  }

  /**
   * Get all-time totals
   */
  getAllTimeTotals(): Observable<AllTimeTotals> {
    return this.http.get<ApiResponse<AllTimeTotals>>(`${this.apiUrl}/totals`)
      .pipe(
        map(response => response.data || { totalReviewed: 0, totalQuizzes: 0, averageAccuracy: 0 }),
        catchError(error => {
          console.error('Error fetching totals:', error);
          return of({ totalReviewed: 0, totalQuizzes: 0, averageAccuracy: 0 });
        })
      );
  }

  /**
   * Record a review activity
   */
  recordReview(): Observable<DailyStatistics | null> {
    return this.http.post<ApiResponse<DailyStatistics>>(`${this.apiUrl}/record/review`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error recording review:', error);
          return of(null);
        })
      );
  }

  /**
   * Record a memorization
   */
  recordMemorization(): Observable<DailyStatistics | null> {
    return this.http.post<ApiResponse<DailyStatistics>>(`${this.apiUrl}/record/memorization`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error recording memorization:', error);
          return of(null);
        })
      );
  }

  /**
   * Record a completed quiz
   */
  recordQuiz(accuracy: number): Observable<DailyStatistics | null> {
    return this.http.post<ApiResponse<DailyStatistics>>(`${this.apiUrl}/record/quiz`, { accuracy })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error recording quiz:', error);
          return of(null);
        })
      );
  }

  /**
   * Record study time
   */
  recordStudyTime(minutes: number): Observable<DailyStatistics | null> {
    return this.http.post<ApiResponse<DailyStatistics>>(`${this.apiUrl}/record/study-time`, { minutes })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error recording study time:', error);
          return of(null);
        })
      );
  }

  // Default values for error cases
  private getDefaultStats(): DashboardStats {
    return {
      totalAyahs: 6236,
      memorized: 0,
      memorizedPercentage: 0,
      dueForReview: 0,
      totalQuizzes: 0,
      averageQuizScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      todayReviewed: 0,
      todayMemorized: 0,
      todayQuizzes: 0,
      todayStudyMinutes: 0
    };
  }

  private getDefaultWeeklySummary(): WeeklySummary {
    return {
      weeklyReviewed: 0,
      weeklyMemorized: 0,
      weeklyQuizzes: 0,
      weeklyAccuracy: 0
    };
  }

  private getDefaultStreakInfo(): StreakInfo {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activityDays: []
    };
  }
}
