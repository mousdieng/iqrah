import axios from 'axios';
import {ApiResponse, Ayah, Surah} from '@/types/quran';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const quranApi = {
  // ✅ GET /api/quran/aya/{ayaNumber}
  getAya: async (ayaNumber: number): Promise<Ayah> => {
    const res = await api.get<ApiResponse<Ayah>>(`/quran/aya/${ayaNumber}`);
    return res.data.data;
  },

  // ✅ GET /api/quran/surah/{surahNumber}
  getSurah: async (surahNumber: number): Promise<Surah> => {
    const res = await api.get<ApiResponse<Surah>>(`/quran/surah/${surahNumber}`);
    return res.data.data;
  },

  // ✅ GET /api/quran/surahs
  getAllSurahs: async (): Promise<Surah[]> => {
    const res = await api.get<ApiResponse<Surah[]>>(`/quran/surahs`);
    return res.data.data;
  },

  // ✅ GET /api/quran/juz/{juzNumber}
  getJuz: async (juzNumber: number): Promise<Ayah[]> => {
    const res = await api.get<ApiResponse<Ayah[]>>(`/quran/juz/${juzNumber}`);
    return res.data.data;
  },

  // ✅ GET /api/quran/page/{pageNumber}
  getPage: async (pageNumber: number): Promise<Ayah[]> => {
    const res = await api.get<ApiResponse<Ayah[]>>(`/quran/page/${pageNumber}`);
    return res.data.data;
  },

  // ✅ GET /api/quran/page/surahNumber/{pageNumber}
  getSurahPage: async (surahNumber: number, pageNumber: number): Promise<Ayah[]> => {
    const res = await api.get<ApiResponse<Ayah[]>>(`/quran/page/${surahNumber}/${pageNumber}`);
    return res.data.data;
  },

  // ✅ GET /api/quran/random
  getRandomAya: async (): Promise<Ayah> => {
    const res = await api.get<ApiResponse<Ayah>>(`/quran/random`);
    return res.data.data;
  },

  // ✅ GET /api/quran/range?from=1&to=20
  getAyasRange: async (from: number, to: number): Promise<Ayah[]> => {
    const res = await api.get<ApiResponse<Ayah[]>>(`/quran/range`, {
      params: { from, to },
    });
    return res.data.data;
  },

  // ✅ GET /api/quran/reciters
  getReciters: async (): Promise<string[]> => {
    try {
      const res = await api.get<ApiResponse<string[]>>(`/quran/reciters`);
      return res.data.data;
    } catch (error) {
      console.warn('API unavailable for reciters, using defaults');
      return ['maher_al_muaiqly', 'husary', 'minshawi', 'sudais'];
    }
  },

  // ✅ GET /api/quran/translators
  getTranslators: async (): Promise<string[]> => {
    try {
      const res = await api.get<ApiResponse<string[]>>(`/quran/translators`);
      return res.data.data;
    } catch (error) {
      console.warn('API unavailable for translators, using defaults');
      return ['ar.alafasy', 'en.sahih', 'fr.hamidullah'];
    }
  },

  // 🔊 Audio URLs (no axios call needed, just build the URL)
  getReciterAudioUrl: (reciter: string, surahNumber: number, ayaNumber: number) => {
    return `${API_BASE_URL}/audio/reciter/${reciter}/${surahNumber}/${ayaNumber}`;
  },

  getTafsirAudioUrl: (tafsir: string, surahNumber: number, ayaNumber: number) => {
    return `${API_BASE_URL}/audio/tafsir/${tafsir}/${surahNumber}/${ayaNumber}`;
  },
};

export default api;












// import axios from 'axios';
// import { Aya, AyaWithTranslationsAndAudio, RepeatSettings, UserProgress } from '@/types/quran';
// import { mockQuranApi } from './mockApi';
//
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
//
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 5000, // 5 second timeout
// });
//
// export const quranApi = {
//   // Get ayah by surah and ayah number
//   getAya: async (ayaNumber: number): Promise<AyaWithTranslationsAndAudio> => {
//     try {
//       const response = await api.get(`/quran/aya/${ayaNumber}`);
//       return response.data;
//     } catch (error) {
//       console.warn(`API unavailable for verse :${ayaNumber}, using mock data`);
//       return mockQuranApi.getAya(surahNumber, ayaNumber);
//     }
//   },
//
//   // Get range of ayahs
//   getAyasRange: async (surahNumber: number, from: number, to: number): Promise<AyaWithTranslationsAndAudio[]> => {
//     try {
//       const response = await api.get(`/quran/range/${surahNumber}/${from}/${to}`);
//       return response.data;
//     } catch (error) {
//       console.warn(`API unavailable for range ${surahNumber}:${from}-${to}, using mock data`);
//       return mockQuranApi.getAyasRange(surahNumber, from, to);
//     }
//   },
//
//   // Get all ayahs in a surah
//   getSurahAyahs: async (surahNumber: number): Promise<AyaWithTranslationsAndAudio[]> => {
//     try {
//       const response = await api.get(`/quran/surah/${surahNumber}`);
//       return response.data;
//     } catch (error) {
//       console.warn(`API unavailable for surah ${surahNumber}, using mock data`);
//       return mockQuranApi.getSurahAyahs(surahNumber);
//     }
//   },
//
//   // Get page of ayahs (traditional mushaf format)
//   getPage: async (pageNumber: number): Promise<AyaWithTranslationsAndAudio[]> => {
//     try {
//       const response = await api.get(`/quran/page/${pageNumber}`);
//       return response.data;
//     } catch (error) {
//       console.warn(`API unavailable for page ${pageNumber}, using mock data`);
//       return mockQuranApi.getPage(pageNumber);
//     }
//   },
//
//   // Search ayahs
//   searchAyahs: async (query: string): Promise<AyaWithTranslationsAndAudio[]> => {
//     try {
//       const response = await api.get(`/quran/search?query=${encodeURIComponent(query)}`);
//       return response.data;
//     } catch (error) {
//       console.warn(`API unavailable for search "${query}", using mock data`);
//       return mockQuranApi.searchAyahs(query);
//     }
//   },
//
//   // Get random ayah
//   getRandomAya: async (): Promise<AyaWithTranslationsAndAudio> => {
//     try {
//       const response = await api.get('/quran/random');
//       return response.data;
//     } catch (error) {
//       console.warn('API unavailable for random verse, using mock data');
//       return mockQuranApi.getRandomAya();
//     }
//   },
//
//   // Repeat functionality
//   createRepeatSession: async (settings: RepeatSettings): Promise<void> => {
//     await api.post('/repeat', settings);
//   },
//
//   // User progress
//   getUserProgress: async (userId: string, ayaId: number): Promise<UserProgress | null> => {
//     try {
//       const response = await api.get(`/progress/${userId}/${ayaId}`);
//       return response.data;
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response?.status === 404) {
//         return null;
//       }
//       throw error;
//     }
//   },
//
//   updateUserProgress: async (userId: string, ayaId: number, memorized: boolean): Promise<UserProgress> => {
//     const response = await api.post('/progress', {
//       userId,
//       ayaId,
//       memorized,
//     });
//     return response.data;
//   },
//
//   // Favorites
//   addToFavorites: async (userId: string, ayaId: number): Promise<void> => {
//     await api.post('/favorites', { userId, ayaId });
//   },
//
//   removeFromFavorites: async (userId: string, ayaId: number): Promise<void> => {
//     await api.delete(`/favorites/${userId}/${ayaId}`);
//   },
//
//   getFavorites: async (userId: string): Promise<AyaWithTranslationsAndAudio[]> => {
//     const response = await api.get(`/favorites/${userId}`);
//     return response.data;
//   },
//
//   // Get available reciters
//   getReciters: async (): Promise<string[]> => {
//     try {
//       const response = await api.get('/quran/reciters');
//       return response.data;
//     } catch (error) {
//       console.warn('API unavailable for reciters, using defaults');
//       return ['maher_al_muaiqly', 'husary', 'minshawi', 'sudais'];
//     }
//   },
//
//   // Admin endpoints
//   admin: {
//     importMaherAudio: async (): Promise<any> => {
//       const response = await api.post('/admin/import-maher-audio');
//       return response.data;
//     },
//
//     importHusaryAudio: async (): Promise<any> => {
//       const response = await api.post('/admin/import-husary-audio');
//       return response.data;
//     },
//
//     importBadrAudio: async (): Promise<any> => {
//       const response = await api.post('/admin/import-badr-audio');
//       return response.data;
//     },
//
//     getStats: async (): Promise<any> => {
//       const response = await api.get('/admin/stats');
//       return response.data;
//     },
//   },
// };
//
// export default api;