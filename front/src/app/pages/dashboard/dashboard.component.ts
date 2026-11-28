import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MemorizeService } from '../../services/memorize.service';
import { QuizApiService } from '../../services/quiz.service';
import { QuizSession, QuizType } from '../../models';
import { TOTAL_AYAHS } from '../../shared/juz';
import { ActivityCalendarComponent } from './sections/activity-calendar.component';
import { QuranMapComponent } from './sections/quran-map.component';
import { ReviewHealthComponent } from './sections/review-health.component';
import { MilestonesComponent } from './sections/milestones.component';
import { BackupComponent } from './sections/backup.component';

const QUIZ_LABELS: Record<QuizType, string> = {
  [QuizType.FILL_BLANK]: 'Mots manquants',
  [QuizType.AUDIO_RECOGNITION]: 'Reconnaissance audio',
  [QuizType.SEQUENCE_ORDER]: 'Ordre des versets',
  [QuizType.WRITING]: 'Écriture'
};

/**
 * "Progrès": totals, activity calendar, map of the Quran by juz/surah,
 * review health and forecast, milestones and projection, quizzes, backup.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe, ActivityCalendarComponent, QuranMapComponent,
            ReviewHealthComponent, MilestonesComponent, BackupComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  readonly memorize = inject(MemorizeService);
  private quizService = inject(QuizApiService);

  readonly total = TOTAL_AYAHS;
  readonly memorized = computed(() => this.memorize.memorizedIds().size);
  readonly percent = computed(() => (this.memorized() / TOTAL_AYAHS) * 100);
  readonly totalReviews = computed(() => this.memorize.progress().reduce((sum, p) => sum + (p.reviewCount || 0), 0));

  readonly quizzes = signal<QuizSession[] | null>(null);
  readonly quizAverage = computed(() => {
    const list = this.quizzes() ?? [];
    if (!list.length) return null;
    return Math.round(list.reduce((sum, q) => sum + (q.scorePercentage ?? (q.totalQuestions ? (q.correctAnswers / q.totalQuestions) * 100 : 0)), 0) / list.length);
  });

  constructor() {
    this.quizService.getRecentSessions(8).subscribe({
      next: sessions => this.quizzes.set(sessions.filter(s => s.completedAt)),
      error: () => this.quizzes.set([])
    });
  }

  quizLabel(type: QuizType): string {
    return QUIZ_LABELS[type] ?? type;
  }
}
