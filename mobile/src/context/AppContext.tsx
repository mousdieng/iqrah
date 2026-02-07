import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, UserProgress, AudioState, ReciterType } from '../types';
import { DEFAULT_RECITER } from '../constants/reciters';

// State type
interface AppState {
  preferences: UserPreferences;
  progress: UserProgress;
  audio: AudioState;
}

// Action types
type AppAction =
  | { type: 'SET_RECITER'; payload: ReciterType }
  | { type: 'TOGGLE_TAFSIR' }
  | { type: 'TOGGLE_TRANSLATION' }
  | { type: 'SET_ARABIC_FONT_SIZE'; payload: number }
  | { type: 'SET_TRANSLATION_FONT_SIZE'; payload: number }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_FAVORITE'; payload: number }
  | { type: 'REMOVE_FAVORITE'; payload: number }
  | { type: 'ADD_MEMORIZED'; payload: number }
  | { type: 'REMOVE_MEMORIZED'; payload: number }
  | { type: 'SET_LAST_READ'; payload: { surah: number; ayah: number; page: number } }
  | { type: 'SET_AUDIO_STATE'; payload: Partial<AudioState> }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };

// Initial state
const initialState: AppState = {
  preferences: {
    reciter: DEFAULT_RECITER as ReciterType,
    showTafsir: false,
    showTranslation: true,
    arabicFontSize: 24,
    translationFontSize: 16,
    theme: 'light',
  },
  progress: {
    favorites: [],
    memorized: [],
    lastRead: null,
    bookmarks: [],
  },
  audio: {
    isPlaying: false,
    currentAyah: null,
    currentSurah: null,
    repeatCount: 1,
    currentRepeat: 0,
    autoPlay: false,
    playbackSpeed: 1.0,
  },
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_RECITER':
      return {
        ...state,
        preferences: { ...state.preferences, reciter: action.payload },
      };
    case 'TOGGLE_TAFSIR':
      return {
        ...state,
        preferences: { ...state.preferences, showTafsir: !state.preferences.showTafsir },
      };
    case 'TOGGLE_TRANSLATION':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          showTranslation: !state.preferences.showTranslation,
        },
      };
    case 'SET_ARABIC_FONT_SIZE':
      return {
        ...state,
        preferences: { ...state.preferences, arabicFontSize: action.payload },
      };
    case 'SET_TRANSLATION_FONT_SIZE':
      return {
        ...state,
        preferences: { ...state.preferences, translationFontSize: action.payload },
      };
    case 'SET_THEME':
      return {
        ...state,
        preferences: { ...state.preferences, theme: action.payload },
      };
    case 'ADD_FAVORITE':
      return {
        ...state,
        progress: {
          ...state.progress,
          favorites: [...state.progress.favorites, action.payload],
        },
      };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        progress: {
          ...state.progress,
          favorites: state.progress.favorites.filter((id) => id !== action.payload),
        },
      };
    case 'ADD_MEMORIZED':
      return {
        ...state,
        progress: {
          ...state.progress,
          memorized: [...state.progress.memorized, action.payload],
        },
      };
    case 'REMOVE_MEMORIZED':
      return {
        ...state,
        progress: {
          ...state.progress,
          memorized: state.progress.memorized.filter((id) => id !== action.payload),
        },
      };
    case 'SET_LAST_READ':
      return {
        ...state,
        progress: { ...state.progress, lastRead: action.payload },
      };
    case 'SET_AUDIO_STATE':
      return {
        ...state,
        audio: { ...state.audio, ...action.payload },
      };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from AsyncStorage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('appState');
        if (savedState) {
          dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedState) });
        }
      } catch (error) {
        console.error('Error loading state:', error);
      }
    };
    loadState();
  }, []);

  // Save state to AsyncStorage on changes
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('appState', JSON.stringify(state));
      } catch (error) {
        console.error('Error saving state:', error);
      }
    };
    saveState();
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
