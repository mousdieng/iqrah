import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { StorageService } from '../../services/storage.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { QuizApiService } from '../../services/quiz.service';
import { QuizSession, QuizType } from '../../models';

const TOTAL_AYAHS = 6236;

const QUIZ_LABELS: Record<QuizType, string> = {
  [QuizType.FILL_BLANK]: 'Mots manquants',
  [QuizType.AUDIO_RECOGNITION]: 'Reconnaissance audio',
  [QuizType.SEQUENCE_ORDER]: 'Ordre des versets',
  [QuizType.WRITING]: 'Écriture'
};

/** "Progrès": memorization totals, progress per surah, recent quizzes */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private storage = inject(StorageService);
  private catalog = inject(SurahCatalogService);
  private quizService = inject(QuizApiService);

  private readonly progress = toSignal(this.storage.progress$, { initialValue: this.storage.getProgress() });

  readonly memorized = computed(() => this.progress().filter(p => p.memorized).length);
  readonly percent = computed(() => (this.memorized() / TOTAL_AYAHS) * 100);
  readonly due = computed(() => {
    this.progress();
    return this.storage.getAyahsDueForReview().filter(p => p.memorized).length;
  });
  readonly totalReviews = computed(() => this.progress().reduce((sum, p) => sum + (p.reviewCount || 0), 0));

  /** Surahs with at least one memorized ayah, most advanced first */
  readonly bySurah = computed(() => {
    const counts = new Map<number, number>();
    for (const p of this.progress()) {
      if (p.memorized) counts.set(p.surahId, (counts.get(p.surahId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([surahId, done]) => {
        const surah = this.catalog.get(surahId);
        const total = surah?.numberOfAyahs ?? done;
        return {
          surahId,
          name: surah?.englishName ?? `Sourate ${surahId}`,
          arabic: surah?.name ?? '',
          done,
          total,
          percent: Math.min(100, Math.round((done / total) * 100))
        };
      })
      .sort((a, b) => b.percent - a.percent || a.surahId - b.surahId);
  });

  readonly completedSurahs = computed(() => this.bySurah().filter(s => s.percent >= 100).length);

  readonly quizzes = signal<QuizSession[] | null>(null);

  constructor() {
    this.quizService.getRecentSessions(5).subscribe({
      next: sessions => this.quizzes.set(sessions.filter(s => s.completedAt)),
      error: () => this.quizzes.set([])
    });
  }

  quizLabel(type: QuizType): string {
    return QUIZ_LABELS[type] ?? type;
  }
}
