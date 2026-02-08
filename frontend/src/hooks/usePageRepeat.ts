// usePageRepeat.ts
import { useState, useRef, useCallback } from 'react';
import { Ayah } from '@/types/quran';

interface UsePageRepeatProps {
    id: string;
    verses: Ayah[];
    getAudioUrl: (ayahId: number) => string | null;
    onVersePlay: (ayahId: number) => void;
    onVersePause: () => void;
}

export function usePageRepeat({
                                  id,
                                  verses,
                                  getAudioUrl,
                                  onVersePlay,
                                  onVersePause,
                              }: UsePageRepeatProps) {
    const [pageRepeatMode, setPageRepeatMode] = useState(false);
    const [pageRepeatCount, setPageRepeatCount] = useState(3);
    const [isPlayingPage, setIsPlayingPage] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);
    const [error, setError] = useState({message: "", isError: false});

    const isPlayingPageRef = useRef(false);
    const isPausedRef = useRef(false);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);

    const stopPagePlayback = useCallback(() => {
        isPlayingPageRef.current = false;
        isPausedRef.current = false;
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.removeEventListener('ended', () => {});
            currentAudioRef.current.removeEventListener('error', () => {});
            currentAudioRef.current = null;
        }
        setIsPlayingPage(false);
        setIsPaused(false);
        setCurrentVerseIndex(0);
        setCurrentRepeatIndex(0);
        onVersePause();
    }, [onVersePause]);

    const pausePagePlayback = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
        }
        isPausedRef.current = true;
        setIsPaused(true);
        onVersePause();
    }, [onVersePause]);

    const playNextVerse = useCallback(
        async (verseIndex: number, repeatIndex: number) => {
            if (!isPlayingPageRef.current || isPausedRef.current || !verses || verseIndex >= verses.length) {
                if (verseIndex >= verses.length) {
                    stopPagePlayback();
                }
                return;
            }

            const currentVerse = verses[verseIndex];
            if (!currentVerse) return;

            setCurrentVerseIndex(verseIndex);
            setCurrentRepeatIndex(repeatIndex);

            const audioUrl = getAudioUrl(currentVerse.numberInSurah);

            console.log(`[${id}] Attempting to play verse ${currentVerse.numberInSurah} (ID: ${currentVerse.id}), URL:`, audioUrl);

            if (!audioUrl) {
                console.warn(`[${id}] No audio URL for verse ${currentVerse.numberInSurah}`);
                // Skip to next verse (not repeat)
                setTimeout(() => {
                    playNextVerse(verseIndex + 1, 0);
                }, 500);
                return;
            }

            const audio = new Audio(audioUrl);

            const handleAudioEnd = () => {
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('error', handleAudioError);
                onVersePause();

                if (!isPlayingPageRef.current || isPausedRef.current) return;

                if (repeatIndex + 1 < pageRepeatCount) {
                    setTimeout(() => playNextVerse(verseIndex, repeatIndex + 1), 800);
                } else {
                    setTimeout(() => playNextVerse(verseIndex + 1, 0), 1200);
                }
            };

            const handleAudioError = (e: ErrorEvent | Event) => {
                console.error(`[${id}] Audio error for verse ${currentVerse.numberInSurah}:`, e);
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('error', handleAudioError);
                onVersePause();

                // Skip to next verse on error (don't retry the same verse infinitely)
                setTimeout(() => {
                    playNextVerse(verseIndex + 1, 0);
                }, 500);
            };

            audio.addEventListener('ended', handleAudioEnd);
            audio.addEventListener('error', handleAudioError);
            audio.addEventListener('play', () => onVersePlay(currentVerse.id));

            currentAudioRef.current = audio;

            try {
                await audio.play();
            } catch (err) {
                console.error(`[${id}] Failed to play audio:`, err);
                handleAudioError(err as ErrorEvent);
            }
        },
        [verses, getAudioUrl, pageRepeatCount, onVersePlay, onVersePause, stopPagePlayback, id]
    );

    const resumePagePlayback = useCallback(() => {
        if (!isPausedRef.current) return;

        isPausedRef.current = false;
        setIsPaused(false);

        // Resume the currently paused audio
        if (currentAudioRef.current) {
            currentAudioRef.current.play().catch((err) => {
                console.error(`[${id}] Failed to resume audio:`, err);
            });
            const currentVerse = verses[currentVerseIndex];
            if (currentVerse) {
                onVersePlay(currentVerse.id);
            }
        } else {
            // Fallback: if audio reference is lost, restart from current position
            playNextVerse(currentVerseIndex, currentRepeatIndex);
        }
    }, [currentVerseIndex, currentRepeatIndex, verses, onVersePlay, playNextVerse, id]);

    const togglePagePlayback = useCallback(() => {
        if (isPlayingPage || isPlayingPageRef.current) {
            if (isPaused) {
                resumePagePlayback();
            } else {
                pausePagePlayback();
            }
        } else {
            if (!verses || verses.length === 0) {
                console.warn(`[${id}] No verses to play`);
                return;
            }

            console.log(`[${id}] Starting playback of ${verses.length} verses`);
            isPlayingPageRef.current = true;
            isPausedRef.current = false;
            setIsPlayingPage(true);
            setIsPaused(false);
            setCurrentVerseIndex(0);
            setCurrentRepeatIndex(0);

            setTimeout(() => {
                playNextVerse(0, 0);
            }, 100);
        }
    }, [isPlayingPage, isPaused, verses, pausePagePlayback, resumePagePlayback, playNextVerse, id]);

    return {
        pageRepeatMode,
        setPageRepeatMode,
        pageRepeatCount,
        setPageRepeatCount,
        isPlayingPage,
        isPaused,
        currentVerseIndex,
        currentRepeatIndex,
        togglePagePlayback,
        stopPagePlayback,
    };
}







// // usePageRepeat.ts
// import { useState, useRef, useCallback } from 'react';
// import { Ayah } from '@/types/quran';
//
// interface UsePageRepeatProps {
//     id: string;
//     verses: Ayah[];
//     getAudioUrl: (ayahId: number) => string | null;
//     onVersePlay: (ayahId: number) => void;
//     onVersePause: () => void;
// }
//
// export function usePageRepeat({
//     id,
//                                   verses,
//                                   getAudioUrl,
//                                   onVersePlay,
//                                   onVersePause,
//                               }: UsePageRepeatProps) {
//     console.log("hhhhhhhhhhhhhhhhhhhh", verses, id);
//     const [pageRepeatMode, setPageRepeatMode] = useState(false);
//     const [pageRepeatCount, setPageRepeatCount] = useState(3);
//     const [isPlayingPage, setIsPlayingPage] = useState(false);
//     const [isPaused, setIsPaused] = useState(false);
//     const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
//     const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);
//     const [error, setError] = useState({message: "", isError: false});
//
//     const isPlayingPageRef = useRef(false);
//     const isPausedRef = useRef(false);
//     const currentAudioRef = useRef<HTMLAudioElement | null>(null);
//
//     const stopPagePlayback = useCallback(() => {
//         isPlayingPageRef.current = false;
//         isPausedRef.current = false;
//         if (currentAudioRef.current) {
//             currentAudioRef.current.pause();
//             currentAudioRef.current.removeEventListener('ended', () => {});
//             currentAudioRef.current.removeEventListener('error', () => {});
//             currentAudioRef.current = null;
//         }
//         setIsPlayingPage(false);
//         setIsPaused(false);
//         setCurrentVerseIndex(0);
//         setCurrentRepeatIndex(0);
//         onVersePause();
//     }, [onVersePause]);
//
//     const pausePagePlayback = useCallback(() => {
//         if (currentAudioRef.current) {
//             currentAudioRef.current.pause();
//         }
//         isPausedRef.current = true;
//         setIsPaused(true);
//         onVersePause();
//     }, [onVersePause]);
//
//     const playNextVerse = useCallback(
//         async (verseIndex: number, repeatIndex: number) => {
//             if (!isPlayingPageRef.current || isPausedRef.current || !verses || verseIndex >= verses.length) {
//                 if (verseIndex >= verses.length) {
//                     stopPagePlayback();
//                 }
//                 return;
//             }
//
//             const currentVerse = verses[verseIndex];
//             if (!currentVerse) return;
//
//             setCurrentVerseIndex(verseIndex);
//             setCurrentRepeatIndex(repeatIndex);
//
//             const audioUrl = getAudioUrl(currentVerse.numberInSurah);
//             if (!audioUrl) {
//                 // Skip to next
//                 setTimeout(() => {
//                     if (repeatIndex + 1 < pageRepeatCount) {
//                         playNextVerse(verseIndex, repeatIndex + 1);
//                     } else {
//                         playNextVerse(verseIndex + 1, 0);
//                     }
//                 }, 500);
//                 return;
//             }
//
//             const audio = new Audio(audioUrl);
//
//             const handleAudioEnd = () => {
//                 audio.removeEventListener('ended', handleAudioEnd);
//                 audio.removeEventListener('error', handleAudioError);
//                 onVersePause();
//
//                 if (!isPlayingPageRef.current || isPausedRef.current) return;
//
//                 if (repeatIndex + 1 < pageRepeatCount) {
//                     setTimeout(() => playNextVerse(verseIndex, repeatIndex + 1), 800);
//                 } else {
//                     setTimeout(() => playNextVerse(verseIndex + 1, 0), 1200);
//                 }
//             };
//
//             const handleAudioError = () => {
//                 audio.removeEventListener('ended', handleAudioEnd);
//                 audio.removeEventListener('error', handleAudioError);
//                 onVersePause();
//
//                 setTimeout(() => {
//                     if (repeatIndex + 1 < pageRepeatCount) {
//                         playNextVerse(verseIndex, repeatIndex + 1);
//                     } else {
//                         playNextVerse(verseIndex + 1, 0);
//                     }
//                 }, 500);
//             };
//
//             audio.addEventListener('ended', handleAudioEnd);
//             audio.addEventListener('error', handleAudioError);
//             audio.addEventListener('play', () => onVersePlay(currentVerse.id));
//
//             currentAudioRef.current = audio;
//             await audio.play();
//         },
//         [verses, getAudioUrl, pageRepeatCount, onVersePlay, onVersePause, stopPagePlayback]
//     );
//
//     const resumePagePlayback = useCallback(() => {
//         if (!isPausedRef.current) return;
//
//         isPausedRef.current = false;
//         setIsPaused(false);
//
//         // Resume the currently paused audio
//         if (currentAudioRef.current) {
//             currentAudioRef.current.play().catch(console.error);
//             const currentVerse = verses[currentVerseIndex];
//             if (currentVerse) {
//                 onVersePlay(currentVerse.id);
//             }
//         } else {
//             // Fallback: if audio reference is lost, restart from current position
//             playNextVerse(currentVerseIndex, currentRepeatIndex);
//         }
//     }, [currentVerseIndex, currentRepeatIndex, verses, onVersePlay, playNextVerse]);
//
//     const togglePagePlayback = useCallback(() => {
//         if (isPlayingPage || isPlayingPageRef.current) {
//             if (isPaused) {
//                 resumePagePlayback();
//             } else {
//                 pausePagePlayback();
//             }
//         } else {
//             if (!verses || verses.length === 0) return;
//
//             isPlayingPageRef.current = true;
//             isPausedRef.current = false;
//             setIsPlayingPage(true);
//             setIsPaused(false);
//             setCurrentVerseIndex(0);
//             setCurrentRepeatIndex(0);
//
//             setTimeout(() => {
//                 playNextVerse(0, 0);
//             }, 100);
//         }
//     }, [isPlayingPage, isPaused, verses, pausePagePlayback, resumePagePlayback, playNextVerse]);
//
//     return {
//         pageRepeatMode,
//         setPageRepeatMode,
//         pageRepeatCount,
//         setPageRepeatCount,
//         isPlayingPage,
//         isPaused,
//         currentVerseIndex,
//         currentRepeatIndex,
//         togglePagePlayback,
//         stopPagePlayback,
//     };
// }