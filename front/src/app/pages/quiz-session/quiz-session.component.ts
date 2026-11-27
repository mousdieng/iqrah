import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { QuranService } from '../../services/quran.service';
import { AudioService } from '../../services/audio.service';
import { StorageService } from '../../services/storage.service';
import {
  QuizType, DifficultyLevel, Ayah, QuizSession, QuizResult,
  FillBlankQuestion, WritingQuestion, PlayerState
} from '../../models';
import { Subject, forkJoin, takeUntil } from 'rxjs';

interface QuizAnswer {
  ayahId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  hintsUsed: number;
}

@Component({
  selector: 'app-quiz-session',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    ProgressBarModule,
    DialogModule,
    InputTextModule,
    TextareaModule
  ],
  templateUrl: './quiz-session.component.html',
  styleUrls: ['./quiz-session.component.css']
})
export class QuizSessionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Quiz configuration
  quizType: QuizType = QuizType.FILL_BLANK;
  difficulty: DifficultyLevel = DifficultyLevel.MEDIUM;
  surahId: number | null = null;
  questionCount: number = 10;

  // Quiz state
  session: QuizSession | null = null;
  currentQuestionIndex: number = 0;
  questions: Ayah[] = [];
  answers: QuizAnswer[] = [];
  loading = true;
  isComplete = false;

  // Current question state
  currentQuestion: Ayah | null = null;
  fillBlankData: FillBlankQuestion | null = null;
  writingData: WritingQuestion | null = null;
  sequenceItems: { id: number; text: string; position: number }[] = [];

  // User input
  userInput: string = '';
  blankInputs: string[] = [];

  // Timer
  questionStartTime: number = 0;
  elapsedTime: number = 0;
  timerInterval: any;

  // Hints
  hintsUsed: number = 0;
  showHint: boolean = false;
  currentHint: string = '';

  // Audio state
  playerState: PlayerState | null = null;

  // Feedback
  showFeedback = false;
  lastAnswerCorrect = false;

  // Results dialog
  showResultsDialog = false;

  // Quiz type enum for template
  QuizType = QuizType;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quranService: QuranService,
    private audioService: AudioService,
    private storageService: StorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get query params
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.quizType = params['type'] as QuizType || QuizType.FILL_BLANK;
      this.difficulty = params['difficulty'] as DifficultyLevel || DifficultyLevel.MEDIUM;
      this.surahId = params['surah'] ? +params['surah'] : null;
      this.questionCount = params['count'] ? +params['count'] : 10;

      this.startQuiz();
    });

    // Audio state subscription
    this.audioService.playerState$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.playerState = state;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
    this.audioService.stop();
  }

  startQuiz(): void {
    this.loading = true;

    // Get memorized ayahs from storage
    const allProgress = this.storageService.getAllProgress();
    const memorizedAyahIds = Object.entries(allProgress)
      .filter(([_, p]: [string, any]) => p.memorized)
      .map(([id, _]) => parseInt(id));

    if (memorizedAyahIds.length === 0) {
      this.router.navigate(['/memorize/quiz']);
      return;
    }

    // Filter by surah if specified
    let filteredIds = memorizedAyahIds;
    if (this.surahId && this.surahId > 0) {
      filteredIds = memorizedAyahIds.filter(id => {
        const progress = allProgress[id];
        return progress && progress.surahId === this.surahId;
      });
    }

    // Shuffle and limit
    const shuffled = this.shuffleArray(filteredIds);
    const selectedIds = shuffled.slice(0, Math.min(this.questionCount, shuffled.length));

    // Load ayahs
    this.loadAyahs(selectedIds);
  }

  loadAyahs(ayahIds: number[]): void {
    if (!ayahIds.length) {
      this.questions = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    // Fetch exactly the selected ayahs (the surah list endpoint does not include ayah texts)
    forkJoin(ayahIds.map(id => this.quranService.getAyah(id))).subscribe({
      next: (ayahs) => {
        this.questions = this.shuffleArray(ayahs.filter((a): a is Ayah => !!a));

        // Create session
        this.session = {
          quizType: this.quizType,
          totalQuestions: this.questions.length,
          correctAnswers: 0,
          difficultyLevel: this.difficulty,
          surahId: this.surahId || undefined
        };

        this.loading = false;
        this.loadCurrentQuestion();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading ayahs:', error);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadCurrentQuestion(): void {
    if (this.currentQuestionIndex >= this.questions.length) {
      this.completeQuiz();
      return;
    }

    this.currentQuestion = this.questions[this.currentQuestionIndex];
    this.userInput = '';
    this.blankInputs = [];
    this.hintsUsed = 0;
    this.showHint = false;
    this.currentHint = '';
    this.showFeedback = false;

    // Prepare question based on type
    switch (this.quizType) {
      case QuizType.FILL_BLANK:
        this.prepareFillBlankQuestion();
        break;
      case QuizType.WRITING:
        this.prepareWritingQuestion();
        break;
      case QuizType.AUDIO_RECOGNITION:
        this.prepareAudioQuestion();
        break;
      case QuizType.SEQUENCE_ORDER:
        this.prepareSequenceQuestion();
        break;
    }

    this.startTimer();
  }

  prepareFillBlankQuestion(): void {
    if (!this.currentQuestion) return;

    const text = this.currentQuestion.text;
    const words = text.split(/\s+/);

    // Calculate words to hide based on difficulty
    let hidePercent = 0.3;
    if (this.difficulty === DifficultyLevel.EASY) hidePercent = 0.2;
    if (this.difficulty === DifficultyLevel.HARD) hidePercent = 0.5;

    const wordsToHide = Math.max(1, Math.floor(words.length * hidePercent));

    // Random indices to hide
    const indices = Array.from({ length: words.length }, (_, i) => i);
    const shuffledIndices = this.shuffleArray(indices);
    const hiddenIndices = shuffledIndices.slice(0, wordsToHide).sort((a, b) => a - b);

    // Build text with blanks
    const blanks: { index: number; word: string }[] = [];
    const textParts: string[] = [];

    words.forEach((word, i) => {
      if (hiddenIndices.includes(i)) {
        blanks.push({ index: i, word });
        textParts.push('______');
      } else {
        textParts.push(word);
      }
    });

    this.fillBlankData = {
      ayahId: this.currentQuestion.id,
      surahId: this.currentQuestion.surahId,
      surahName: '', // Would need to look up
      ayahNumber: this.currentQuestion.numberInSurah,
      originalText: text,
      textWithBlanks: textParts.join(' '),
      blanks,
      totalWords: words.length
    };

    this.blankInputs = blanks.map(() => '');
  }

  prepareWritingQuestion(): void {
    if (!this.currentQuestion) return;

    const words = this.currentQuestion.text.split(/\s+/);

    this.writingData = {
      ayahId: this.currentQuestion.id,
      surahId: this.currentQuestion.surahId,
      surahName: '',
      ayahNumber: this.currentQuestion.numberInSurah,
      correctText: this.currentQuestion.text,
      wordCount: words.length,
      firstWord: words[0] || '',
      firstLetters: words.map(w => w.charAt(0)).join(' ')
    };
  }

  prepareAudioQuestion(): void {
    if (!this.currentQuestion) return;
    // Play audio automatically for audio recognition
    this.audioService.loadAyah(this.currentQuestion);
    this.audioService.play();
  }

  prepareSequenceQuestion(): void {
    // Get 3-5 consecutive ayahs starting from current
    const count = this.difficulty === DifficultyLevel.EASY ? 3 :
                  this.difficulty === DifficultyLevel.HARD ? 5 : 4;

    const startIndex = this.questions.findIndex(q => q.id === this.currentQuestion?.id);
    const sequenceAyahs = this.questions.slice(startIndex, startIndex + count);

    // Create correct order
    const correctOrder = sequenceAyahs.map((a, i) => ({
      id: a.id,
      text: a.text,
      position: i
    }));

    // Scramble
    this.sequenceItems = this.shuffleArray([...correctOrder]);
  }

  // Timer methods
  startTimer(): void {
    this.questionStartTime = Date.now();
    this.elapsedTime = 0;
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Math.floor((Date.now() - this.questionStartTime) / 1000);
      this.cdr.markForCheck();
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Hint system
  useHint(): void {
    if (!this.currentQuestion) return;

    this.hintsUsed++;
    this.showHint = true;

    switch (this.quizType) {
      case QuizType.FILL_BLANK:
        // Show first letter of first blank
        if (this.fillBlankData && this.fillBlankData.blanks.length > 0) {
          const blank = this.fillBlankData.blanks[0];
          this.currentHint = `Premier mot caché commence par: ${blank.word.charAt(0)}`;
        }
        break;
      case QuizType.WRITING:
        if (this.writingData) {
          if (this.hintsUsed === 1) {
            this.currentHint = `Premier mot: ${this.writingData.firstWord}`;
          } else {
            this.currentHint = `Premières lettres: ${this.writingData.firstLetters}`;
          }
        }
        break;
      case QuizType.AUDIO_RECOGNITION:
        // Replay audio
        this.audioService.play();
        this.currentHint = 'Audio rejoué';
        break;
      case QuizType.SEQUENCE_ORDER:
        // Show first ayah
        this.currentHint = 'Le premier verset est en surbrillance';
        break;
    }
  }

  // Submit answer
  submitAnswer(): void {
    this.stopTimer();
    const timeTaken = Math.floor((Date.now() - this.questionStartTime) / 1000);

    let isCorrect = false;
    let userAnswer = '';
    let correctAnswer = this.currentQuestion?.text || '';

    switch (this.quizType) {
      case QuizType.FILL_BLANK:
        userAnswer = this.blankInputs.join(' ');
        const correctWords = this.fillBlankData?.blanks.map(b => b.word) || [];
        correctAnswer = correctWords.join(' ');
        isCorrect = this.validateFillBlank();
        break;
      case QuizType.WRITING:
      case QuizType.AUDIO_RECOGNITION:
        userAnswer = this.userInput;
        isCorrect = this.normalizeArabic(this.userInput) === this.normalizeArabic(correctAnswer);
        break;
      case QuizType.SEQUENCE_ORDER:
        userAnswer = this.sequenceItems.map(i => i.id).join(',');
        const sorted = [...this.sequenceItems].sort((a, b) => a.position - b.position);
        correctAnswer = sorted.map(i => i.id).join(',');
        isCorrect = userAnswer === correctAnswer;
        break;
    }

    // Record answer
    const answer: QuizAnswer = {
      ayahId: this.currentQuestion?.id || 0,
      userAnswer,
      correctAnswer,
      isCorrect,
      timeTaken,
      hintsUsed: this.hintsUsed
    };
    this.answers.push(answer);

    // Update session
    if (isCorrect && this.session) {
      this.session.correctAnswers++;
    }

    // Update progress (spaced repetition)
    if (this.currentQuestion) {
      const progress = this.storageService.getAyahProgress(this.currentQuestion.id);
      if (progress) {
        // Record review
        this.storageService.updateProgress({
          ...progress,
          lastReviewDate: new Date(),
          reviewCount: (progress.reviewCount || 0) + 1
        });
      }
    }

    // Show feedback
    this.lastAnswerCorrect = isCorrect;
    this.showFeedback = true;
  }

  validateFillBlank(): boolean {
    if (!this.fillBlankData) return false;

    for (let i = 0; i < this.fillBlankData.blanks.length; i++) {
      const expected = this.normalizeArabic(this.fillBlankData.blanks[i].word);
      const actual = this.normalizeArabic(this.blankInputs[i] || '');
      if (expected !== actual) return false;
    }
    return true;
  }

  normalizeArabic(text: string): string {
    return text
      .replace(/[\u064B-\u065F]/g, '') // Remove tashkeel
      .replace(/[\u0670]/g, '') // Remove superscript alef
      .replace(/[أإآٱ]/g, 'ا') // Normalize alef forms
      .replace(/ة/g, 'ه') // Taa marbuta to haa
      .replace(/ى/g, 'ي') // Alef maksura to yaa
      .replace(/ـ/g, '') // Remove tatweel
      .replace(/\s+/g, ' ')
      .trim();
  }

  nextQuestion(): void {
    this.showFeedback = false;
    this.currentQuestionIndex++;
    this.loadCurrentQuestion();
  }

  completeQuiz(): void {
    this.isComplete = true;
    this.stopTimer();
    this.audioService.stop();
    this.showResultsDialog = true;
  }

  get progressPercentage(): number {
    if (!this.questions.length) return 0;
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get scorePercentage(): number {
    if (!this.session || !this.session.totalQuestions) return 0;
    return Math.round((this.session.correctAnswers / this.session.totalQuestions) * 100);
  }

  getQuizTypeName(): string {
    switch (this.quizType) {
      case QuizType.FILL_BLANK: return 'Remplir les blancs';
      case QuizType.AUDIO_RECOGNITION: return 'Reconnaissance audio';
      case QuizType.SEQUENCE_ORDER: return 'Ordre des versets';
      case QuizType.WRITING: return 'Écriture de mémoire';
      default: return 'Quiz';
    }
  }

  playCurrentAudio(): void {
    if (this.currentQuestion) {
      this.audioService.loadAyah(this.currentQuestion);
      this.audioService.play();
    }
  }

  exitQuiz(): void {
    this.router.navigate(['/memorize/quiz']);
  }

  restartQuiz(): void {
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.isComplete = false;
    this.showResultsDialog = false;
    if (this.session) {
      this.session.correctAnswers = 0;
    }
    this.loadCurrentQuestion();
  }

  // Sequence ordering drag & drop
  moveSequenceItem(fromIndex: number, toIndex: number): void {
    const item = this.sequenceItems[fromIndex];
    this.sequenceItems.splice(fromIndex, 1);
    this.sequenceItems.splice(toIndex, 0, item);
  }

  // Utility
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
