// useSurahRepeat.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { Ayah } from '@/types/quran';

interface UseSurahRepeatProps {
    startPage: number;
    endPage: number;
    currentPageVerses: Ayah[];
    currentPage: number;
    onPageChange: (page: number) => void; // Callback to change page and fetch verses
    getAudioUrl: (ayahId: number) => string | null;
    onVersePlay: (ayahId: number) => void;
    onVersePause: () => void;
}

export function useSurahRepeat({
                                   startPage,
                                   endPage,
                                   currentPageVerses,
                                   currentPage,
                                   onPageChange,
                                   getAudioUrl,
                                   onVersePlay,
                                   onVersePause,
                               }: UseSurahRepeatProps) {
    const [surahRepeatMode, setSurahRepeatMode] = useState(false);
    const [surahRepeatCount, setSurahRepeatCount] = useState(3);
    const [isPlayingSurah, setIsPlayingSurah] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentPlayingPage, setCurrentPlayingPage] = useState(startPage);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [currentRepeatIndex, setCurrentRepeatIndex] = useState(0);

    const isPlayingSurahRef = useRef(false);
    const isPausedRef = useRef(false);
    const currentAudioRef = useRef<HTMLAudioElement | null>(null);
    const currentPlayingPageRef = useRef(startPage);

    const stopSurahPlayback = useCallback(() => {
        isPlayingSurahRef.current = false;
        isPausedRef.current = false;
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
            currentAudioRef.current.removeEventListener('ended', () => {});
            currentAudioRef.current.removeEventListener('error', () => {});
            currentAudioRef.current = null;
        }
        setIsPlayingSurah(false);
        setIsPaused(false);
        setCurrentPlayingPage(startPage);
        currentPlayingPageRef.current = startPage;
        setCurrentVerseIndex(0);
        setCurrentRepeatIndex(0);
        onVersePause();
    }, [onVersePause, startPage]);

    const pauseSurahPlayback = useCallback(() => {
        if (currentAudioRef.current) {
            currentAudioRef.current.pause();
        }
        isPausedRef.current = true;
        setIsPaused(true);
        onVersePause();
    }, [onVersePause])

    const playNextVerse = useCallback(
        async (pageNumber: number, verseIndex: number, repeatIndex: number) => {
            console.log("jjjjjjj", pageNumber, verseIndex, repeatIndex);
            if (!isPlayingSurahRef.current || isPausedRef.current) return;

            // Stop if beyond range
            if (pageNumber > endPage) {
                stopSurahPlayback();
                return;
            }

            /* ---------- PAGE SYNC ---------- */
            if (pageNumber !== currentPage) {
                currentPlayingPageRef.current = pageNumber;
                setCurrentPlayingPage(pageNumber);
                onPageChange(pageNumber);
                return; // wait for verses to load (useEffect triggers continue)
            }

            const verses = currentPageVerses;

            /* ---------- PAGE END ---------- */
            if (!verses || verseIndex >= verses.length) {
                // go to next page
                setTimeout(() => {
                    playNextVerse(pageNumber + 1, 0, repeatIndex);
                }, 1000);
                return;
            }

            const currentVerse = verses[verseIndex];
            if (!currentVerse) return;

            setCurrentPlayingPage(pageNumber);
            setCurrentVerseIndex(verseIndex);
            setCurrentRepeatIndex(repeatIndex);

            const audioUrl = getAudioUrl(currentVerse.numberInSurah);

            /* ---------- NO AUDIO ---------- */
            if (!audioUrl) {
                // Check if we need to repeat this verse
                if (repeatIndex + 1 < surahRepeatCount) {
                    setTimeout(() => {
                        playNextVerse(pageNumber, verseIndex, repeatIndex + 1);
                    }, 300);
                } else {
                    // Move to next verse, reset repeat counter
                    setTimeout(() => {
                        playNextVerse(pageNumber, verseIndex + 1, 0);
                    }, 300);
                }
                return;
            }

            const audio = new Audio(audioUrl);

            const handleAudioEnd = () => {
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('error', handleAudioError);
                onVersePause();

                if (!isPlayingSurahRef.current || isPausedRef.current) return;

                // Check if we need to repeat this verse
                if (repeatIndex + 1 < surahRepeatCount) {
                    // Repeat the same verse
                    setTimeout(() => {
                        playNextVerse(pageNumber, verseIndex, repeatIndex + 1);
                    }, 600);
                } else {
                    // Move to next verse, reset repeat counter
                    setTimeout(() => {
                        playNextVerse(pageNumber, verseIndex + 1, 0);
                    }, 600);
                }
            };

            const handleAudioError = () => {
                audio.removeEventListener('ended', handleAudioEnd);
                audio.removeEventListener('error', handleAudioError);
                onVersePause();

                // On error, move to next verse
                if (repeatIndex + 1 < surahRepeatCount) {
                    setTimeout(() => {
                        playNextVerse(pageNumber, verseIndex, repeatIndex + 1);
                    }, 300);
                } else {
                    setTimeout(() => {
                        playNextVerse(pageNumber, verseIndex + 1, 0);
                    }, 300);
                }
            };

            audio.addEventListener('ended', handleAudioEnd);
            audio.addEventListener('error', handleAudioError);
            audio.addEventListener('play', () => onVersePlay(currentVerse.id));

            currentAudioRef.current = audio;
            await audio.play();
        },
        [
            currentPage,
            currentPageVerses,
            endPage,
            startPage,
            surahRepeatCount,
            getAudioUrl,
            onVersePlay,
            onVersePause,
            stopSurahPlayback,
            onPageChange
        ]
    );

    const resumeSurahPlayback = useCallback(() => {
        if (!isPausedRef.current) return;

        isPausedRef.current = false;
        setIsPaused(false);

        // Resume the currently paused audio
        if (currentAudioRef.current) {
            currentAudioRef.current.play().catch(console.error);
            const verses = currentPage === currentPlayingPageRef.current ? currentPageVerses : [];
            const currentVerse = verses?.[currentVerseIndex];
            if (currentVerse) {
                onVersePlay(currentVerse.id);
            }
        } else {
            // Fallback: restart from current position
            playNextVerse(currentPlayingPageRef.current, currentVerseIndex, currentRepeatIndex);
        }
    }, [currentPage, currentPageVerses, currentVerseIndex, currentRepeatIndex, onVersePlay, playNextVerse]);

    const toggleSurahPlayback = useCallback(() => {
        if (isPlayingSurah || isPlayingSurahRef.current) {
            if (isPaused) {
                resumeSurahPlayback();
            } else {
                pauseSurahPlayback();
            }
        } else {
            isPlayingSurahRef.current = true;
            isPausedRef.current = false;
            setIsPlayingSurah(true);
            setIsPaused(false);
            setCurrentPlayingPage(startPage);
            currentPlayingPageRef.current = startPage;
            setCurrentVerseIndex(0);
            setCurrentRepeatIndex(0);

            // Navigate to start page if not already there
            if (currentPage !== startPage) {
                onPageChange(startPage);
            }

            setTimeout(() => {
                playNextVerse(startPage, 0, 0);
            }, 100);
        }
    }, [isPlayingSurah, isPaused, startPage, currentPage, pauseSurahPlayback, resumeSurahPlayback, playNextVerse, onPageChange]);

    // Continue playback when page changes during surah repeat
    const continuePlaybackAfterPageChange = useCallback(() => {
        if (isPlayingSurahRef.current &&
            !isPausedRef.current &&
            currentPage === currentPlayingPageRef.current &&
            currentPageVerses.length > 0) {
            // Continue from verse 0 of the new page with repeatIndex 0
            setTimeout(() => {
                playNextVerse(currentPlayingPageRef.current, 0, 0); // Changed: reset repeatIndex to 0
            }, 300);
        }
    }, [currentPage, currentPageVerses, playNextVerse]); // Removed currentRepeatIndex from dependencies

    return {
        surahRepeatMode,
        setSurahRepeatMode,
        surahRepeatCount,
        setSurahRepeatCount,
        isPlayingSurah,
        isPaused,
        currentPlayingPage,
        currentVerseIndex,
        currentRepeatIndex,
        toggleSurahPlayback,
        stopSurahPlayback,
        continuePlaybackAfterPageChange,
    };
}