/**
 * Quran Models and Interfaces
 */

export interface ApiResponse<T> {
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
  id: number;
  name: string;
  transliteratedName: string;
  translatedName: string;
  totalVerses: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs?: Ayah[];
}

export interface SurahDTO {
  id: number;
  name: string;
  transliteratedName: string;
  translatedName: string;
  totalVerses: number;
  revelationType: string;
  ayahs: Ayah[];
}

export interface Translation {
  id: number;
  ayahId: number;
  translatorName: string;
  text: string;
  language: string;
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
export interface RepeatConfig {
  count: number;
  reciter?: string;
  pauseDuration: number; // in seconds
}

export enum RepeatMode {
  NONE = 'NONE',
  AYAH = 'AYAH',
  SURAH = 'SURAH',
  PAGE = 'PAGE',
  JUZ = 'JUZ',
  RANGE = 'RANGE'
}

export interface RepeatState {
  mode: RepeatMode;
  isActive: boolean;
  currentIteration: number;
  totalIterations: number;
  targetId?: number; // surah/page/juz number
  ayahRange?: { from: number; to: number };
  pauseDuration: number;
  currentAyah?: Ayah;
}

// Player state
export interface PlayerState {
  isPlaying: boolean;
  currentAyah?: Ayah;
  currentReciter: string;
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
