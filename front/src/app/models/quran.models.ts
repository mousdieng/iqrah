/**
 * Quran Models and Interfaces
 */

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}

export interface Ayah {
  id: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
  surahId: number;
  editionIdentifier: string;
  surah?: Surah;
}

export interface Surah {
  number: number;  // API uses 'number' instead of 'id'
  name: string;
  englishName: string;  // API uses 'englishName' instead of 'transliteratedName'
  englishNameTranslation: string;  // API uses 'englishNameTranslation' instead of 'translatedName'
  numberOfAyahs: number;  // API uses 'numberOfAyahs' instead of 'totalVerses'
  revelationType: 'Meccan' | 'Medinan';
  ayahs?: Ayah[];
  startingPage?: number | null;
  endingPage?: number | null;
}

export interface SurahDTO {
  number: number;  // API uses 'number' instead of 'id'
  name: string;
  englishName: string;  // API uses 'englishName' instead of 'transliteratedName'
  englishNameTranslation: string;  // API uses 'englishNameTranslation' instead of 'translatedName'
  numberOfAyahs: number;  // API uses 'numberOfAyahs' instead of 'totalVerses'
  revelationType: string;
  ayahs: Ayah[];
  startingPage?: number | null;
  endingPage?: number | null;
}

export interface Translation {
  id: number;
  ayahId: number;
  translatorName: string;
  text: string;
  language: string;
}

// Translation interfaces for multi-language support
export interface AyahTranslation {
  ayahId: number;
  surahId?: number;
  numberInSurah?: number;
  translations: { [lang: string]: TranslationText };
  wordMeanings?: WordMeaning[];
  tafsir?: TafsirInfo;
}

export interface TranslationText {
  text: string;
  translator?: string;
}

export interface WordMeaning {
  arabic: string;
  grammar?: string;
  meaning: string;
}

export interface TafsirInfo {
  text: string;
  references?: string[];
}

export interface TranslationSettings {
  primaryLanguage: 'en' | 'fr' | 'de';
  showTranslation: boolean;
  showWordMeanings: boolean;
  showTafsir: boolean;
}

export interface UserProgress {
  id: number;
  surahId: number;
  ayahId: number;
  memorized: boolean;
  lastReviewDate?: Date;
  reviewCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  notes?: string;
}

export interface FavoriteAya {
  id: number;
  ayahId: number;
  tags?: string[];
  notes?: string;
  createdAt: Date;
}

// Audio related interfaces
export interface AudioReciter {
  identifier: string;
  name: string;
  style: string;
}

export interface AudioMetadata {
  reciter: string;
  surahNumber: number;
  ayahNumber: number;
  url: string;
}

// Repeat functionality
export enum RepeatStyle {
  WHOLE = 'WHOLE',       // Play all ayahs, then repeat the whole set X times
  PER_AYAH = 'PER_AYAH'  // Repeat each ayah X times before moving to the next
}

export interface RepeatConfig {
  count: number;
  pauseDuration: number; // in seconds
  audioType: 'recitation' | 'tafsir';
  reciter?: string;
  tafsir?: string;
  repeatStyle: RepeatStyle; // How to repeat: whole set or per-ayah
}

export enum RepeatMode {
  NONE = 'NONE',
  AYAH = 'AYAH',
  SURAH = 'SURAH',
  PAGE = 'PAGE',
  JUZ = 'JUZ',
  RANGE = 'RANGE',
  SELECTED = 'SELECTED'
}

export interface RepeatState {
  mode: RepeatMode;
  repeatStyle: RepeatStyle;
  isActive: boolean;
  currentIteration: number;      // Current iteration of whole set (for WHOLE style)
  totalIterations: number;       // Total iterations configured
  currentAyahRepetition: number; // Current repetition of current ayah (for PER_AYAH style)
  currentAyahIndex: number;      // Index of current ayah in the list
  totalAyahs: number;            // Total ayahs in the set
  targetId?: number;             // surah/page/juz number
  ayahRange?: { from: number; to: number };
  pauseDuration: number;
  currentAyah?: Ayah;
}

// Player state
export interface PlayerState {
  isPlaying: boolean;
  currentAyah?: Ayah;
  currentReciter: string;
  currentTafsir?: string;
  audioType: 'recitation' | 'tafsir';
  volume: number;
  playbackRate: number;
  autoPlay: boolean;
  repeatMode: RepeatMode;
  playlist: Ayah[];
  currentIndex: number;
}

// Navigation
export interface NavigationState {
  currentSurah?: number;
  currentPage?: number;
  currentJuz?: number;
  viewMode: 'surah' | 'page' | 'juz';
}

// Search
export interface SearchResult {
  ayah: Ayah;
  highlightedText: string;
  relevance: number;
}

export interface SearchFilters {
  surah?: number;
  juz?: number;
  page?: number;
  searchText?: string;
}

// Quiz related interfaces
export enum QuizType {
  FILL_BLANK = 'FILL_BLANK',
  AUDIO_RECOGNITION = 'AUDIO_RECOGNITION',
  SEQUENCE_ORDER = 'SEQUENCE_ORDER',
  WRITING = 'WRITING'
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  MIXED = 'MIXED'
}

export interface QuizSession {
  id?: number;
  quizType: QuizType;
  startedAt?: Date;
  completedAt?: Date;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage?: number;
  surahId?: number;
  juzNumber?: number;
  difficultyLevel: DifficultyLevel;
}

export interface QuizResult {
  id?: number;
  sessionId: number;
  ayahId: number;
  quizType: QuizType;
  isCorrect: boolean;
  userAnswer?: string;
  correctAnswer?: string;
  timeTakenSeconds?: number;
  hintsUsed: number;
  answeredAt?: Date;
}

export interface QuizQuestion {
  ayah: Ayah;
  type: QuizType;
  textWithBlanks?: string;
  blanks?: { index: number; word: string }[];
  scrambledAyahs?: { id: number; text: string; position: number }[];
  firstWord?: string;
  firstLetters?: string;
  wordCount?: number;
}

export interface FillBlankQuestion {
  ayahId: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  originalText: string;
  textWithBlanks: string;
  blanks: { index: number; word: string }[];
  totalWords: number;
}

export interface SequenceQuestion {
  startAyahId: number;
  count: number;
  surahId: number;
  surahName: string;
  scrambledAyahs: { id: number; text: string; position: number }[];
  correctOrder: { id: number; text: string; position: number }[];
}

export interface WritingQuestion {
  ayahId: number;
  surahId: number;
  surahName: string;
  ayahNumber: number;
  correctText: string;
  wordCount: number;
  firstWord: string;
  firstLetters: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalAyahs: number;
  memorized: number;
  memorizedPercentage: number;
  dueForReview: number;
  totalQuizzes: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
  todayReviewed: number;
  todayMemorized: number;
  todayQuizzes: number;
  todayStudyMinutes: number;
}

export interface WeeklySummary {
  weeklyReviewed: number;
  weeklyMemorized: number;
  weeklyQuizzes: number;
  weeklyAccuracy: number;
}

export interface DailyStatistics {
  id?: number;
  statDate: string;
  ayahsReviewed: number;
  ayahsMemorized: number;
  quizzesCompleted: number;
  quizAccuracy?: number;
  studyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  activityDays: {
    date: string;
    hasActivity: boolean;
    ayahsReviewed: number;
    quizzesCompleted: number;
  }[];
}
