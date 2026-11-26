import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { QuranService } from '../../services/quran.service';
import { StorageService } from '../../services/storage.service';
import { QuizType, DifficultyLevel, SurahDTO } from '../../models';

interface QuizTypeOption {
  type: QuizType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputNumberModule
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  // Quiz types
  quizTypes: QuizTypeOption[] = [
    {
      type: QuizType.FILL_BLANK,
      label: 'Remplir les blancs',
      description: 'Complétez les mots manquants dans le verset',
      icon: 'pi-pencil',
      color: 'blue'
    },
    {
      type: QuizType.AUDIO_RECOGNITION,
      label: 'Reconnaissance audio',
      description: 'Écoutez et tapez le verset que vous entendez',
      icon: 'pi-volume-up',
      color: 'green'
    },
    {
      type: QuizType.SEQUENCE_ORDER,
      label: 'Ordre des versets',
      description: 'Remettez les versets dans le bon ordre',
      icon: 'pi-sort-alt',
      color: 'orange'
    },
    {
      type: QuizType.WRITING,
      label: 'Écriture de mémoire',
      description: 'Écrivez le verset entier de mémoire',
      icon: 'pi-file-edit',
      color: 'purple'
    }
  ];

  // Selected options
  selectedQuizType: QuizType | null = null;
  selectedSurah: number | null = null;
  selectedDifficulty: DifficultyLevel = DifficultyLevel.MEDIUM;
  questionCount: number = 10;

  // Options lists
  surahOptions: { label: string; value: number }[] = [];
  difficultyOptions = [
    { label: 'Facile', value: DifficultyLevel.EASY },
    { label: 'Moyen', value: DifficultyLevel.MEDIUM },
    { label: 'Difficile', value: DifficultyLevel.HARD },
    { label: 'Mixte', value: DifficultyLevel.MIXED }
  ];

  // Stats
  memorizedCount: number = 0;
  loading = true;

  constructor(
    private router: Router,
    private quranService: QuranService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadSurahs();
    this.loadMemorizedCount();
  }

  loadSurahs(): void {
    this.quranService.getAllSurahs().subscribe({
      next: (surahs: SurahDTO[]) => {
        this.surahOptions = [
          { label: 'Toutes les sourates', value: 0 },
          ...surahs.map(s => ({
            label: `${s.number}. ${s.name}`,
            value: s.number
          }))
        ];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadMemorizedCount(): void {
    // Count memorized ayahs from local storage
    const progress = this.storageService.getAllProgress();
    this.memorizedCount = Object.values(progress).filter((p: any) => p.memorized).length;
  }

  selectQuizType(type: QuizType): void {
    this.selectedQuizType = type;
  }

  isQuizTypeSelected(type: QuizType): boolean {
    return this.selectedQuizType === type;
  }

  canStartQuiz(): boolean {
    return this.selectedQuizType !== null && this.memorizedCount >= 1;
  }

  startQuiz(): void {
    if (!this.canStartQuiz()) return;

    // Navigate to quiz session with configuration
    this.router.navigate(['/quiz/session'], {
      queryParams: {
        type: this.selectedQuizType,
        surah: this.selectedSurah || undefined,
        difficulty: this.selectedDifficulty,
        count: this.questionCount
      }
    });
  }

  getQuizTypeColor(type: QuizType): string {
    const quizType = this.quizTypes.find(q => q.type === type);
    return quizType?.color || 'blue';
  }
}
