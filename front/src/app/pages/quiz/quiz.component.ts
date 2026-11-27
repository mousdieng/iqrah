import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { StorageService } from '../../services/storage.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { QuizType, DifficultyLevel } from '../../models';

interface QuizTypeOption {
  type: QuizType;
  label: string;
  description: string;
  icon: string;
}

/** Quiz setup: choose a type and a few options, then start the session */
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent {
  private router = inject(Router);
  private storage = inject(StorageService);
  private catalog = inject(SurahCatalogService);

  readonly quizTypes: QuizTypeOption[] = [
    { type: QuizType.FILL_BLANK, label: 'Mots manquants', description: 'Complétez les mots qui manquent dans le verset.', icon: 'pi pi-pencil' },
    { type: QuizType.SEQUENCE_ORDER, label: 'Ordre des versets', description: 'Remettez les versets dans le bon ordre.', icon: 'pi pi-sort-alt' },
    { type: QuizType.AUDIO_RECOGNITION, label: 'Reconnaissance audio', description: 'Écoutez la récitation et retrouvez le verset.', icon: 'pi pi-volume-up' },
    { type: QuizType.WRITING, label: 'Écriture', description: 'Écrivez le verset entier de mémoire.', icon: 'pi pi-file-edit' }
  ];

  readonly difficulties = [
    { value: DifficultyLevel.EASY, label: 'Facile' },
    { value: DifficultyLevel.MEDIUM, label: 'Moyen' },
    { value: DifficultyLevel.HARD, label: 'Difficile' }
  ];

  readonly counts = [5, 10, 20];

  readonly type = signal<QuizType>(QuizType.FILL_BLANK);
  readonly surah = signal<number>(0);
  readonly difficulty = signal<DifficultyLevel>(DifficultyLevel.MEDIUM);
  readonly count = signal(10);

  private readonly progress = toSignal(this.storage.progress$, { initialValue: this.storage.getProgress() });
  readonly memorizedCount = computed(() => this.progress().filter(p => p.memorized).length);

  /** Surahs that have memorized ayahs come first in the list */
  readonly surahOptions = computed(() => {
    const memorizedSurahs = new Set(this.progress().filter(p => p.memorized).map(p => p.surahId));
    const all = this.catalog.surahs().map(s => ({ value: s.number, label: `${s.number}. ${s.englishName}`, mine: memorizedSurahs.has(s.number) }));
    return {
      mine: all.filter(s => s.mine),
      others: all.filter(s => !s.mine)
    };
  });

  onSurahChange(event: Event): void {
    this.surah.set(+(event.target as HTMLSelectElement).value);
  }

  start(): void {
    this.router.navigate(['/memorize/quiz/session'], {
      queryParams: {
        type: this.type(),
        surah: this.surah() || undefined,
        difficulty: this.difficulty(),
        count: this.count()
      }
    });
  }
}
