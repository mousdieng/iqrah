// hooks/useQuranQueries.ts
import {useQuery, useQueryClient, UseQueryResult} from '@tanstack/react-query';
import { quranApi } from '@/lib/api';
import { Ayah, Surah } from '@/types/quran';

// Query keys factory for better organization
export const quranKeys = {
    all: ['quran'] as const,
    ayas: () => [...quranKeys.all, 'ayas'] as const,
    aya: (ayaNumber: number) => [...quranKeys.ayas(), ayaNumber] as const,
    randomAya: () => [...quranKeys.ayas(), 'random'] as const,
    ayasRange: (from: number, to: number) => [...quranKeys.ayas(), 'range', from, to] as const,

    surahs: () => [...quranKeys.all, 'surahs'] as const,
    surah: (surahNumber: number) => [...quranKeys.surahs(), surahNumber] as const,
    allSurahs: () => [...quranKeys.surahs(), 'list'] as const,

    juzs: () => [...quranKeys.all, 'juzs'] as const,
    juz: (juzNumber: number) => [...quranKeys.juzs(), juzNumber] as const,

    pagesSurah: () => [...quranKeys.all, 'pagesSurah'] as const,
    pageSurah: (surahNumber: number, pageNumber: number) => [...quranKeys.pagesSurah(), `${surahNumber}-${pageNumber}`] as const,

    pages: () => [...quranKeys.all, 'pages'] as const,
    page: (pageNumber: number) => [...quranKeys.pages(), pageNumber] as const,

    reciters: () => [...quranKeys.all, 'reciters'] as const,
    translators: () => [...quranKeys.all, 'translators'] as const,

    // inside quranKeys
    audio: () => [...quranKeys.all, 'audio'] as const,
    reciterAudio: (reciter: string, surahNumber: number, ayaNumber: number) =>
        [...quranKeys.audio(), 'reciter', reciter, surahNumber, ayaNumber] as const,
    tafsirAudio: (tafsir: string, surahNumber: number, ayaNumber: number) =>
        [...quranKeys.audio(), 'tafsir', tafsir, surahNumber, ayaNumber] as const,

};

// 1. Get single Aya
export const useAya = (ayaNumber: number, enabled = true): UseQueryResult<Ayah, Error> => {
    return useQuery({
        queryKey: quranKeys.aya(ayaNumber),
        queryFn: () => quranApi.getAya(ayaNumber),
        enabled: enabled && ayaNumber > 0,
        staleTime: 1000 * 60 * 60, // 1 hour - Quran data rarely changes
    });
};

// 2. Get single Surah
export const useSurah = (surahNumber: number, enabled = true): UseQueryResult<Surah, Error> => {
    return useQuery({
        queryKey: quranKeys.surah(surahNumber),
        queryFn: () => quranApi.getSurah(surahNumber),
        enabled: enabled && surahNumber > 0 && surahNumber <= 114,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// 3. Get all Surahs
export const useAllSurahs = (enabled = true): UseQueryResult<Surah[], Error> => {
    return useQuery({
        queryKey: quranKeys.allSurahs(),
        queryFn: () => quranApi.getAllSurahs(),
        enabled,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours - rarely changes
    });
};

// 4. Get Juz
export const useJuz = (juzNumber: number, enabled = true): UseQueryResult<Ayah[], Error> => {
    return useQuery({
        queryKey: quranKeys.juz(juzNumber),
        queryFn: () => quranApi.getJuz(juzNumber),
        enabled: enabled && juzNumber > 0 && juzNumber <= 30,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// 5. Get Page
export const usePage = (pageNumber: number, enabled = true): UseQueryResult<Ayah[], Error> => {
    return useQuery({
        queryKey: quranKeys.page(pageNumber),
        queryFn: () => quranApi.getPage(pageNumber),
        enabled: enabled && pageNumber > 0 && pageNumber <= 604,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// 5. Get Page
export const usePageSurah = (surahNumber: number, pageNumber: number, enabled = true): UseQueryResult<Ayah[], Error> => {
    return useQuery({
        queryKey: quranKeys.pageSurah(surahNumber, pageNumber),
        queryFn: () => quranApi.getSurahPage(surahNumber, pageNumber),
        enabled: enabled && pageNumber > 0 && pageNumber <= 604,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// 6. Get Random Aya
export const useRandomAya = (enabled = true): UseQueryResult<Ayah, Error> => {
    return useQuery({
        queryKey: quranKeys.randomAya(),
        queryFn: () => quranApi.getRandomAya(),
        enabled,
        staleTime: 0, // Always fetch fresh for random
        gcTime: 0, // Don't cache random results
    });
};

// 7. Get Ayas Range
export const useAyasRange = (
    from: number,
    to: number,
    enabled = true
): UseQueryResult<Ayah[], Error> => {
    return useQuery({
        queryKey: quranKeys.ayasRange(from, to),
        queryFn: () => quranApi.getAyasRange(from, to),
        enabled: enabled && from > 0 && to > 0 && from <= to,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

// 8. Get Reciters
export const useReciters = (enabled = true): UseQueryResult<string[], Error> => {
    return useQuery({
        queryKey: quranKeys.reciters(),
        queryFn: () => quranApi.getReciters(),
        enabled,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};

// 9. Get Translators
export const useTranslators = (enabled = true): UseQueryResult<string[], Error> => {
    return useQuery({
        queryKey: quranKeys.translators(),
        queryFn: () => quranApi.getTranslators(),
        enabled,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });
};

// 🔊 Reciter Audio URL Hook
export const useReciterAudioUrl = (
    reciter: string,
    surahNumber: number,
    ayaNumber: number,
    enabled = true
): UseQueryResult<string, Error> => {
    return useQuery({
        queryKey: quranKeys.reciterAudio(reciter, surahNumber, ayaNumber),
        queryFn: async () =>
            quranApi.getReciterAudioUrl(reciter, surahNumber, ayaNumber),
        enabled: enabled && !!reciter && surahNumber > 0 && ayaNumber > 0,
        staleTime: Infinity,
    });
};

// 🔊 Tafsir Audio URL Hook
export const useTafsirAudioUrl = (
    tafsir: string,
    surahNumber: number,
    ayaNumber: number,
    enabled = true
): UseQueryResult<string, Error> => {
    return useQuery({
        queryKey: quranKeys.tafsirAudio(tafsir, surahNumber, ayaNumber),
        queryFn: async () =>
            quranApi.getTafsirAudioUrl(tafsir, surahNumber, ayaNumber),
        enabled: enabled && !!tafsir && surahNumber > 0 && ayaNumber > 0,
        staleTime: Infinity,
    });
};


// Bonus: Prefetch helpers for better UX
export const usePrefetchQuran = () => {
    const queryClient = useQueryClient();

    const prefetchSurah = (surahNumber: number) => {
        return queryClient.prefetchQuery({
            queryKey: quranKeys.surah(surahNumber),
            queryFn: () => quranApi.getSurah(surahNumber),
            staleTime: 1000 * 60 * 60,
        });
    };

    const prefetchPage = (pageNumber: number) => {
        return queryClient.prefetchQuery({
            queryKey: quranKeys.page(pageNumber),
            queryFn: () => quranApi.getPage(pageNumber),
            staleTime: 1000 * 60 * 60,
        });
    };

    const prefetchNextPage = (currentPage: number) => {
        if (currentPage < 604) {
            return prefetchPage(currentPage + 1);
        }
    };

    const prefetchPreviousPage = (currentPage: number) => {
        if (currentPage > 1) {
            return prefetchPage(currentPage - 1);
        }
    };

    return {
        prefetchSurah,
        prefetchPage,
        prefetchNextPage,
        prefetchPreviousPage,
    };
};