'use client';

import React, {createContext, ReactNode, useContext, useReducer} from 'react';
import {AudioType, Ayah} from '@/types/quran';

interface QuranState {
  currentAya: Ayah | null;
  selectedReciter: string;
  selectedTafsir: string;
  selectedTranslation: string;
  audioMode: AudioType;
  fontSize: number;
  isPlaying: boolean;
  currentAudio: HTMLAudioElement | null;
  favorites: number[];
  memorized: number[];
  showTranslations: boolean;
}

type QuranAction =
  | { type: 'SET_CURRENT_AYA'; payload: Ayah }
  | { type: 'SET_RECITER'; payload: string }
  | { type: 'SET_TAFSIR'; payload: string }
  | { type: 'SET_TRANSLATION'; payload: string }
  | { type: 'SET_AUDIO_MODE'; payload: AudioType }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_AUDIO'; payload: HTMLAudioElement | null }
  | { type: 'ADD_FAVORITE'; payload: number }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'ADD_MEMORIZED'; payload: number }
  | { type: 'REMOVE_MEMORIZED'; payload: number }
  | { type: 'TOGGLE_TRANSLATIONS' };

const initialState: QuranState = {
  currentAya: null,
  selectedReciter: '',
  selectedTafsir: '',
  selectedTranslation: 'Sahih International',
  audioMode: AudioType.RECITATION,
  fontSize: 24,
  isPlaying: false,
  currentAudio: null,
  favorites: [],
  memorized: [],
  showTranslations: true,
};

function quranReducer(state: QuranState, action: QuranAction): QuranState {
  switch (action.type) {
    case 'SET_CURRENT_AYA':
      return { ...state, currentAya: action.payload };
    case 'SET_RECITER':
      return { ...state, selectedReciter: action.payload };
    case 'SET_TAFSIR':
      return { ...state, selectedTafsir: action.payload };
    case 'SET_TRANSLATION':
      return { ...state, selectedTranslation: action.payload };
    case 'SET_AUDIO_MODE':
      return { ...state, audioMode: action.payload };
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_AUDIO':
      return { ...state, currentAudio: action.payload };
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [...state.favorites, action.payload]
      };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(id => id !== action.payload)
      };
    case 'ADD_MEMORIZED':
      return {
        ...state,
        memorized: [...state.memorized, action.payload]
      };
    case 'REMOVE_MEMORIZED':
      return {
        ...state,
        memorized: state.memorized.filter(id => id !== action.payload)
      };
    case 'TOGGLE_TRANSLATIONS':
      return {
        ...state,
        showTranslations: !state.showTranslations
      };
    default:
      return state;
  }
}

const QuranContext = createContext<{
  state: QuranState;
  dispatch: React.Dispatch<QuranAction>;
} | null>(null);

export function QuranProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quranReducer, initialState);

  return (
    <QuranContext.Provider value={{ state, dispatch }}>
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const context = useContext(QuranContext);
  if (!context) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}

export const hasValidAudioSelection = (state: QuranState): boolean => {
  switch (state.audioMode) {
    case AudioType.RECITATION:
      return !!state.selectedReciter?.trim();

    case AudioType.TRANSLATOR:
      return !!state.selectedTafsir?.trim();

    default:
      return false;
  }
};