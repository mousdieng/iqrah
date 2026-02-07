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

  editionIdentifier?: string | null;
  surah?: Surah;
}



export interface Audio {
  id: number;
  ayaId: number;
  reciterName: string;
  url: string;
  localPath: string;
}

export interface AyahWithAudio extends Ayah {
  audios: Audio[];
}

export enum AudioType {
  RECITATION = "RECITATION",
  TRANSLATOR = "TRANSLATOR",
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs?: Ayah[];

  startingPage?: number;
  endingPage?: number;
}


export interface RepeatSettings {
  ayaFrom: number;
  ayaTo: number;
  surahNumber: number;
  repeatCount: number;
  interval: number;
}

export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
  success: boolean;
};

export enum ErrorSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export type Errors = {
  severity: ErrorSeverity;
  status?: number;
  message: string;
  title: string;
  isError: boolean;
}

// export interface UserProgress {
//   id: number;
//   userId: string;
//   ayaId: number;
//   memorized: boolean;
//   reviewCount: number;
//   lastReviewed: string;
// }

// export interface Translation {
//   id: number;
//   ayaId: number;
//   language: string;
//   translatorName: string;
//   text: string;
// }