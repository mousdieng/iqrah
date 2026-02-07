import axios from 'axios';
import Constants from 'expo-constants';
import { Surah, SurahDetail, MushafPage } from '../types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback data for offline support
const MOCK_SURAHS: Surah[] = Array.from({ length: 114 }, (_, i) => ({
  number: i + 1,
  name: `سورة ${i + 1}`,
  englishName: `Surah ${i + 1}`,
  englishNameTranslation: `Surah ${i + 1}`,
  numberOfAyahs: 7,
  revelationType: i % 2 === 0 ? 'Meccan' : 'Medinan',
}));

export const quranApi = {
  // Get all Surahs
  getSurahs: async (): Promise<Surah[]> => {
    try {
      const response = await api.get<{ data: Surah[] }>('/surahs');
      return response.data.data;
    } catch (error) {
      console.warn('API error, using fallback data:', error);
      return MOCK_SURAHS;
    }
  },

  // Get specific Surah with ayahs
  getSurah: async (surahNumber: number): Promise<SurahDetail> => {
    try {
      const response = await api.get<{ data: SurahDetail }>(`/surahs/${surahNumber}`);
      return response.data.data;
    } catch (error) {
      console.warn('API error, using fallback data:', error);
      // Return mock data
      return {
        ...MOCK_SURAHS[surahNumber - 1],
        ayahs: Array.from({ length: 7 }, (_, i) => ({
          number: i + 1,
          text: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ`,
          numberInSurah: i + 1,
          juz: 1,
          manzil: 1,
          page: 1,
          ruku: 1,
          hizbQuarter: 1,
          sajda: false,
        })),
      };
    }
  },

  // Get Mushaf page
  getMushafPage: async (page: number): Promise<MushafPage> => {
    try {
      const response = await api.get<{ data: MushafPage }>(`/mushaf/pages/${page}`);
      return response.data.data;
    } catch (error) {
      console.warn('API error, using fallback data:', error);
      return {
        page,
        surahName: 'الفاتحة',
        surahNumber: 1,
        juz: 1,
        ayahs: [],
      };
    }
  },

  // Search ayahs
  searchAyahs: async (query: string): Promise<any[]> => {
    try {
      const response = await api.get<{ data: any[] }>('/search', {
        params: { q: query },
      });
      return response.data.data;
    } catch (error) {
      console.warn('Search error:', error);
      return [];
    }
  },

  // Get Juz
  getJuz: async (juzNumber: number): Promise<any> => {
    try {
      const response = await api.get<{ data: any }>(`/juz/${juzNumber}`);
      return response.data.data;
    } catch (error) {
      console.warn('API error:', error);
      return null;
    }
  },
};
