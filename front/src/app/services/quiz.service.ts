import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  ApiResponse, Ayah, QuizSession, QuizResult, QuizType, DifficultyLevel,
  FillBlankQuestion, SequenceQuestion, WritingQuestion
} from '../models';

export interface StartSessionRequest {
  quizType: QuizType;
  surahId?: number;
  juzNumber?: number;
  difficulty?: DifficultyLevel;
  questionCount?: number;
}

export interface SubmitAnswerRequest {
  sessionId: number;
  ayahId: number;
  quizType: QuizType;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTakenSeconds?: number;
  hintsUsed?: number;
}

export interface ValidationResult {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizApiService {
  private apiUrl = 'http://localhost:8080/api/quiz';

  constructor(private http: HttpClient) {}

  /**
   * Start a new quiz session
   */
  startSession(request: StartSessionRequest): Observable<QuizSession | null> {
    return this.http.post<ApiResponse<QuizSession>>(`${this.apiUrl}/session/start`, request)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error starting quiz session:', error);
          return of(null);
        })
      );
  }

  /**
   * Complete a quiz session
   */
  completeSession(sessionId: number): Observable<QuizSession | null> {
    return this.http.put<ApiResponse<QuizSession>>(`${this.apiUrl}/session/${sessionId}/complete`, {})
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error completing quiz session:', error);
          return of(null);
        })
      );
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: number): Observable<QuizSession | null> {
    return this.http.get<ApiResponse<QuizSession>>(`${this.apiUrl}/session/${sessionId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching session:', error);
          return of(null);
        })
      );
  }

  /**
   * Get session results
   */
  getSessionResults(sessionId: number): Observable<QuizResult[]> {
    return this.http.get<ApiResponse<QuizResult[]>>(`${this.apiUrl}/session/${sessionId}/results`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching session results:', error);
          return of([]);
        })
      );
  }

  /**
   * Submit an answer
   */
  submitAnswer(request: SubmitAnswerRequest): Observable<QuizResult | null> {
    return this.http.post<ApiResponse<QuizResult>>(`${this.apiUrl}/answer`, request)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error submitting answer:', error);
          return of(null);
        })
      );
  }

  /**
   * Validate an answer (server-side with Arabic normalization)
   */
  validateAnswer(userAnswer: string, correctAnswer: string): Observable<ValidationResult> {
    return this.http.post<ApiResponse<ValidationResult>>(`${this.apiUrl}/validate`, {
      userAnswer,
      correctAnswer
    }).pipe(
      map(response => response.data || { isCorrect: false, userAnswer, correctAnswer }),
      catchError(error => {
        console.error('Error validating answer:', error);
        return of({ isCorrect: false, userAnswer, correctAnswer });
      })
    );
  }

  /**
   * Get recent completed sessions
   */
  getRecentSessions(limit: number = 10): Observable<QuizSession[]> {
    return this.http.get<ApiResponse<QuizSession[]>>(`${this.apiUrl}/sessions/recent`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching recent sessions:', error);
        return of([]);
      })
    );
  }

  /**
   * Get ayahs for quiz from memorized collection
   */
  getAyahsForQuiz(surahId?: number, juzNumber?: number, count: number = 10): Observable<Ayah[]> {
    let params = new HttpParams().set('count', count.toString());
    if (surahId) params = params.set('surahId', surahId.toString());
    if (juzNumber) params = params.set('juzNumber', juzNumber.toString());

    return this.http.get<ApiResponse<Ayah[]>>(`${this.apiUrl}/ayahs`, { params })
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error fetching quiz ayahs:', error);
          return of([]);
        })
      );
  }

  /**
   * Get ayahs due for review for quiz
   */
  getDueAyahsForQuiz(count: number = 10): Observable<Ayah[]> {
    return this.http.get<ApiResponse<Ayah[]>>(`${this.apiUrl}/ayahs/due`, {
      params: { count: count.toString() }
    }).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching due ayahs:', error);
        return of([]);
      })
    );
  }

  /**
   * Generate fill-in-the-blank question
   */
  getFillBlankQuestion(ayahId: number, difficulty: DifficultyLevel = DifficultyLevel.MEDIUM): Observable<FillBlankQuestion | null> {
    return this.http.get<ApiResponse<FillBlankQuestion>>(`${this.apiUrl}/fill-blank/${ayahId}`, {
      params: { difficulty }
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error generating fill-blank question:', error);
        return of(null);
      })
    );
  }

  /**
   * Generate sequence ordering question
   */
  getSequenceQuestion(startAyahId: number, count: number = 4): Observable<SequenceQuestion | null> {
    return this.http.get<ApiResponse<SequenceQuestion>>(`${this.apiUrl}/sequence/${startAyahId}`, {
      params: { count: count.toString() }
    }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Error generating sequence question:', error);
        return of(null);
      })
    );
  }

  /**
   * Generate writing question
   */
  getWritingQuestion(ayahId: number): Observable<WritingQuestion | null> {
    return this.http.get<ApiResponse<WritingQuestion>>(`${this.apiUrl}/writing/${ayahId}`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error generating writing question:', error);
          return of(null);
        })
      );
  }

  /**
   * Get accuracy by quiz type
   */
  getAccuracyByType(quizType: QuizType): Observable<number> {
    return this.http.get<ApiResponse<{ quizType: string; accuracy: number }>>(`${this.apiUrl}/accuracy/${quizType}`)
      .pipe(
        map(response => response.data?.accuracy || 0),
        catchError(error => {
          console.error('Error fetching accuracy:', error);
          return of(0);
        })
      );
  }

  /**
   * Get most difficult ayahs
   */
  getMostDifficultAyahs(limit: number = 10): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/difficult-ayahs`, {
      params: { limit: limit.toString() }
    }).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching difficult ayahs:', error);
        return of([]);
      })
    );
  }
}
