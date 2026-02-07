// Surah and Verse Types
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahDetail extends Surah {
  ayahs: Ayah[];
}

// Mushaf (Page-based) Types
export interface MushafPage {
  page: number;
  surahName: string;
  surahNumber: number;
  juz: number;
  ayahs: Ayah[];
}

// Audio Types
export type ReciterType = 'maher' | 'husary' | 'minshawi' | 'sudais';

export interface Reciter {
  id: ReciterType;
  name: string;
  arabicName: string;
  subfolder: string;
  bitrate: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentAyah: number | null;
  currentSurah: number | null;
  repeatCount: number;
  currentRepeat: number;
  autoPlay: boolean;
  playbackSpeed: number;
}

// User Preferences
export interface UserPreferences {
  reciter: ReciterType;
  showTafsir: boolean;
  showTranslation: boolean;
  arabicFontSize: number;
  translationFontSize: number;
  theme: 'light' | 'dark';
}

// User Progress
export interface UserProgress {
  favorites: number[]; // ayah numbers
  memorized: number[]; // ayah numbers
  lastRead: {
    surah: number;
    ayah: number;
    page: number;
  } | null;
  bookmarks: Bookmark[];
}

export interface Bookmark {
  id: string;
  surah: number;
  ayah: number;
  page: number;
  note?: string;
  createdAt: Date;
}

// Search
export interface SearchResult {
  surah: number;
  ayah: number;
  text: string;
  translation?: string;
  highlight: string;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  Surahs: undefined;
  Surah: { surahNumber: number };
  Mushaf: { page?: number };
  Search: undefined;
  Settings: undefined;
  Favorites: undefined;
};
