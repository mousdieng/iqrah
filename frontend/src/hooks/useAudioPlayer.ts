import { useState, useCallback } from 'react';
import { Ayah, AudioType, ErrorSeverity } from '@/types/quran';
import { quranApi } from '@/lib/api';
import { useErrorHandler } from './useErrorHandler';

interface UseAudioPlayerProps {
    surahId: number;
    audioMode: AudioType;
    selectedReciter: string;
    selectedTafsir: string;
}

export function useAudioPlayer({
                                   surahId,
                                   audioMode,
                                   selectedReciter,
                                   selectedTafsir,
                               }: UseAudioPlayerProps) {
    const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
    const [playingAyaId, setPlayingAyaId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { error, createError, clearError } = useErrorHandler();

    const stopAudio = useCallback(() => {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.removeEventListener('ended', () => {});
            currentAudio.removeEventListener('error', () => {});
            setCurrentAudio(null);
            setPlayingAyaId(null);
        }
        setIsLoading(false);
    }, [currentAudio]);

    const getAudioUrl = useCallback((ayahId: number, mode?: AudioType) => {
        const effectiveMode = mode || audioMode;

        return effectiveMode === AudioType.TRANSLATOR
            ? quranApi.getTafsirAudioUrl(selectedTafsir, surahId, ayahId)
            : quranApi.getReciterAudioUrl(selectedReciter, surahId, ayahId);
    }, [audioMode, selectedReciter, selectedTafsir, surahId]);


    const playAudio = useCallback(
        async (
            ayah: Ayah,
            onEnded?: () => void,
            playbackSpeed: number = 1.0
        ) => {
            try {
                clearError();
                stopAudio();
                setIsLoading(true);

                const audioUrl = getAudioUrl(ayah.numberInSurah);

                if (!audioUrl) {
                    createError(
                        'Could not generate audio URL for this verse',
                        'Audio URL Error',
                        ErrorSeverity.ERROR
                    );
                    setIsLoading(false);
                    return;
                }

                const audio = new Audio(audioUrl);
                audio.playbackRate = playbackSpeed;

                audio.onloadstart = () => setIsLoading(true);
                audio.oncanplay = () => setIsLoading(false);

                audio.onplay = () => {
                    setPlayingAyaId(ayah.id);
                    setIsLoading(false);
                    clearError();
                };

                audio.onended = () => {
                    setPlayingAyaId(null);
                    setIsLoading(false);
                    onEnded?.();
                };

                audio.onerror = () => {
                    const mediaError = audio.error; // HTMLAudioElement.error is MediaError | null
                    let errorMessage = 'Failed to play audio';

                    if (mediaError) {
                        switch (mediaError.code) {
                            case MediaError.MEDIA_ERR_ABORTED:
                                errorMessage = 'Audio playback was aborted';
                                break;
                            case MediaError.MEDIA_ERR_NETWORK:
                                errorMessage = 'Network error while loading audio';
                                break;
                            case MediaError.MEDIA_ERR_DECODE:
                                errorMessage = 'Audio file is corrupted or in unsupported format';
                                break;
                            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                errorMessage = 'Audio file not found or format not supported';
                                break;
                        }
                    }

                    createError(
                        errorMessage,
                        'Audio Playback Error',
                        ErrorSeverity.ERROR
                    );

                    setPlayingAyaId(null);
                    setIsLoading(false);
                };

                setCurrentAudio(audio);
                await audio.play();
            } catch (playbackError) {
                createError(
                    'Failed to start audio playback',
                    'Playback Error',
                    ErrorSeverity.ERROR
                );
                setIsLoading(false);
            }
        },
        [stopAudio, getAudioUrl, createError, clearError]
    );

    return {
        currentAudio,
        playingAyaId,
        error,
        isLoading,
        playAudio,
        stopAudio,
        getAudioUrl,
        clearError,
    };
}