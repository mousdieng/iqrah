// import { useState, useCallback } from 'react';
// useVerseRepeat.ts
import { useState, useRef, useCallback } from 'react';
import { Ayah } from '@/types/quran';

interface UseVerseRepeatProps {
    verse: Ayah | null;
    getAudioUrl: (ayahId: number) => string | null;
    onVersePlay: (ayahId: number) => void;
    onVersePause: () => void;
}

export function useVerseRepeat({
                                   verse,
                                   getAudioUrl,
                                   onVersePlay,
                                   onVersePause,
                               }: UseVerseRepeatProps) {
    const [verseRepeatMode, setVerseRepeatMode] = useState(false);
    const [verseRepeatCount, setVerseRepeatCount] = useState(3);
    const [isPlayingVerse, setIsPlayingVerse] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);

    const isPlayingVerseRef = useRef(false);
    const isPausedRef = useRef(false);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    const stopVersePlayback = useCallback(() => {
        isPlayingVerseRef.current = false;
        isPausedRef.current = false;
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.removeEventListener('ended', () => {});
            currentAudioRef.current.removeEventListener('error', () => {});
            currentAudioRef.current = null;
        }
        setIsPlayingVerse(false);
        setIsPaused(false);
        setCurrentRepeatIndex(0);
        onVersePause();
    }, [onVersePause]);

    const pauseVersePlayback = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
        }
        isPausedRef.current = true;
        setIsPaused(true);
        onVersePause();
    }, [onVersePause]);

    const playVerse = useCallback(
        async (repeatIndex: number) => {
            if (!isPlayingVerseRef.current || isPausedRef.current || !verse) {
                if (!verse) {
                    stopVersePlayback();
                }
                return;
            }

            if (repeatIndex >= verseRepeatCount) {
                stopVersePlayback();
                return;
            }

            setCurrentRepeatIndex(repeatIndex);

            const audioUrl = getAudioUrl(verse.numberInSurah);
            if (!audioUrl) {
                // If no audio, try next repeat or stop
                setTimeout(() => {
                    if (repeatIndex + 1 < verseRepeatCount) {
                        playVerse(repeatIndex + 1);
                    } else {
                        stopVersePlayback();
                    }
                }, 500);
                return;
            }

            const audio = new Audio(audioUrl);

            const handleAudioEnd = () => {
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('error', handleAudioError);
                onVersePause();

                if (!isPlayingVerseRef.current || isPausedRef.current) return;

                // Play the same verse again if we haven't reached the repeat count
                if (repeatIndex + 1 < verseRepeatCount) {
                    setTimeout(() => playVerse(repeatIndex + 1), 800);
                } else {
                    stopVersePlayback();
                }
            };

            const handleAudioError = () => {
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('error', handleAudioError);
                onVersePause();

                // Try next repeat on error
                setTimeout(() => {
                    if (repeatIndex + 1 < verseRepeatCount) {
                        playVerse(repeatIndex + 1);
                    } else {
                        stopVersePlayback();
                    }
                }, 500);
            };

            audio.addEventListener('ended', handleAudioEnd);
            audio.addEventListener('error', handleAudioError);
            audio.addEventListener('play', () => onVersePlay(verse.id));

            currentAudioRef.current = audio;
            await audio.play();
        },
        [verse, getAudioUrl, verseRepeatCount, onVersePlay, onVersePause, stopVersePlayback]
    );

    const resumeVersePlayback = useCallback(() => {
        if (!isPausedRef.current) return;

        isPausedRef.current = false;
        setIsPaused(false);

        // Resume the currently paused audio
        if (currentAudioRef.current) {
            currentAudioRef.current.play().catch(console.error);
            if (verse) {
                onVersePlay(verse.id);
            }
        } else {
            // Fallback: restart from current repeat index
            playVerse(currentRepeatIndex);
        }
    }, [currentRepeatIndex, verse, onVersePlay, playVerse]);

    const toggleVersePlayback = useCallback(() => {
        if (isPlayingVerse || isPlayingVerseRef.current) {
            if (isPaused) {
                resumeVersePlayback();
            } else {
                pauseVersePlayback();
            }
        } else {
            if (!verse) return;

            isPlayingVerseRef.current = true;
            isPausedRef.current = false;
            setIsPlayingVerse(true);
            setIsPaused(false);
            setCurrentRepeatIndex(0);

            setTimeout(() => {
                playVerse(0);
            }, 100);
        }
    }, [isPlayingVerse, isPaused, verse, pauseVersePlayback, resumeVersePlayback, playVerse]);

    return {
        verseRepeatMode,
        setVerseRepeatMode,
        verseRepeatCount,
        setVerseRepeatCount,
        isPlayingVerse,
        isPaused,
        currentRepeatIndex,
        toggleVersePlayback,
        stopVersePlayback,
    };
}



// import { Ayah } from '@/types/quran';
//
// interface UseVerseRepeat {
//     onPlayVerse: (ayah: Ayah, onEnded: () => void) => Promise<void>;
// }
//
// export function useVerseRepeat({ onPlayVerse }: UseVerseRepeat) {
//     const [repeatMode, setRepeatMode] = useState(false);
//     const [repeatCount, setRepeatCount] = useState(3);
//     const [currentRepeatCount, setCurrentRepeatCount] = useState(0);
//     const [repeatTargetVerse, setRepeatTargetVerse] = useState<Ayah | null>(null);
//
//     const playVerseWithRepeat = useCallback(
//         async (ayah: Ayah, currentRepeat = 0) => {
//             setRepeatTargetVerse(ayah);
//             setCurrentRepeatCount(currentRepeat);
//
//             const handleEnded = () => {
//                 if (repeatMode && currentRepeat + 1 < repeatCount) {
//                     setTimeout(() => {
//                         playVerseWithRepeat(ayah, currentRepeat + 1);
//                     }, 1000);
//                 } else {
//                     setRepeatTargetVerse(null);
//                     setCurrentRepeatCount(0);
//                 }
//             };
//
//             await onPlayVerse(ayah, handleEnded);
//         },
//         [repeatMode, repeatCount, onPlayVerse]
//     );
//
//     const reset = useCallback(() => {
//         setRepeatTargetVerse(null);
//         setCurrentRepeatCount(0);
//     }, []);
//
//     return {
//         repeatMode,
//         setRepeatMode,
//         repeatCount,
//         setRepeatCount,
//         currentRepeatCount,
//         repeatTargetVerse,
//         playVerseWithRepeat,
//         reset,
//     };
// }