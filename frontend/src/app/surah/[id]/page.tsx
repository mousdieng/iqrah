'use client';

import {useEffect, useRef, useState} from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { usePageNavigation } from '@/hooks/useKeyboardNavigation';
import { Card, CardContent } from '@/components/ui/card';
import {hasValidAudioSelection, useQuran} from '@/contexts/QuranContext';
import { usePageSurah, useSurah } from '@/hooks/useQuranQueries';
import { Ayah } from '@/types/quran';

import SurahHeader from '@/components/quran/SurahHeader';
import RepeatModeControls from '@/components/navigation/RepeatModeControls';
import PageRepeatPanel from '@/components/navigation/PageRepeatPanel';
import PageNavigation from '@/components/navigation/PageNavigation';
import MushafPage from '@/components/quran/MushafPage';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { usePageRepeat } from '@/hooks/usePageRepeat';
import {useSurahRepeat} from "@/hooks/useSurahRepeat";
import SurahRepeatPanel from "@/components/navigation/SurahRepeatPanel";
import SelectionTooltip from "@/components/SelectionTooltip";

export default function SurahPage() {
    const params = useParams();
    const surahId = parseInt(params.id as string);
    const { state } = useQuran();

    const { data: surah, isLoading: loadingSurah } = useSurah(surahId);
    const [currentPage, setCurrentPage] = useState(1);
    const {
        data: pageVerses = [],
        isLoading: loadingPageVerses,
        refetch: refetchPageVerses,
    } = usePageSurah(surahId, currentPage);

    const {playingAyaId, playAudio, stopAudio,
        getAudioUrl, error, clearError} = useAudioPlayer({
        surahId,
        audioMode: state.audioMode,
        selectedReciter: state.selectedReciter,
        selectedTafsir: state.selectedTafsir,
    });

    // Verse selection
    const [selectedVerses, setSelectedVerses] = useState<Ayah[]>([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // SELECTED VERSES REPEAT HOOK (for multi-select verse repeat)
    const {
        pageRepeatMode: selectedVersesRepeatMode,
        setPageRepeatMode: setSelectedVersesRepeatMode,
        pageRepeatCount: selectedVersesRepeatCount,
        setPageRepeatCount: setSelectedVersesRepeatCount,
        isPlayingPage: isPlayingSelectedVerses,
        isPaused: isSelectedVersesPaused,
        currentVerseIndex: selectedVersesCurrentIndex,
        currentRepeatIndex: selectedVersesRepeatIndex,
        togglePagePlayback: toggleSelectedVersesPlayback,
        stopPagePlayback: stopSelectedVersesPlayback,
    } = usePageRepeat({
        id: "SELECT",
        verses: selectedVerses,
        getAudioUrl,
        onVersePlay: (ayahId) => {
            // Handle verse play
        },
        onVersePause: () => {
            // Handle verse pause
        },
    });

    useEffect(() => {
        console.log(selectedVersesRepeatCount)
    }, [selectedVersesRepeatCount]);

    // PAGE REPEAT HOOK (for full page repeat)
    const {
        pageRepeatMode,
        setPageRepeatMode,
        pageRepeatCount,
        setPageRepeatCount,
        isPlayingPage,
        isPaused: isPagePaused,
        currentVerseIndex: currentPageVerseIndex,
        currentRepeatIndex: currentPageRepeatCount,
        togglePagePlayback,
        stopPagePlayback,
    } = usePageRepeat({
        id: "PAGE",
        verses: pageVerses,
        getAudioUrl,
        onVersePlay: (ayahId) => {
            // Handle verse play
        },
        onVersePause: () => {
            // Handle verse pause
        },
    });

    // SURAH REPEAT HOOK
    const {
        surahRepeatMode,
        setSurahRepeatMode,
        surahRepeatCount,
        setSurahRepeatCount,
        isPlayingSurah,
        isPaused: isSurahPaused,
        currentPlayingPage,
        currentVerseIndex: currentSurahVerseIndex,
        currentRepeatIndex: currentSurahRepeatCount,
        toggleSurahPlayback,
        stopSurahPlayback,
        continuePlaybackAfterPageChange,
    } = useSurahRepeat({
        startPage: surah?.startingPage || 1,
        endPage: surah?.endingPage || 1,
        currentPageVerses: pageVerses,
        currentPage: currentPage,
        onPageChange: goToPage,
        getAudioUrl,
        onVersePlay: (ayahId) => {
            // Handle verse play
        },
        onVersePause: () => {
            // Handle verse pause
        },
    });

    // Page navigation
    function goToPage(page: number) {
        const start = surah?.startingPage || 1;
        const end = surah?.endingPage || 1;
        if (page >= start && page <= end) {
            setCurrentPage(page);
            refetchPageVerses();
        }
    }

    // Continue surah playback when page verses are loaded
    const pageVersesLengthRef = useRef(0);
    useEffect(() => {
        if (pageVerses.length > 0 && pageVerses.length !== pageVersesLengthRef.current) {
            pageVersesLengthRef.current = pageVerses.length;
            continuePlaybackAfterPageChange();
        }
    }, [pageVerses, continuePlaybackAfterPageChange]);

    // Keyboard navigation
    usePageNavigation(
        () => {
            const start = surah?.startingPage || 1;
            if (currentPage > start) {
                goToPage(currentPage - 1);
            }
        },
        () => {
            const end = surah?.endingPage || 1;
            if (currentPage < end) {
                goToPage(currentPage + 1);
            }
        },
        () => {
            if (pageRepeatMode) {
                togglePagePlayback();
            }
        }
    );

    // Handle verse selection
    const handleVerseSelect = (ayah: Ayah) => {
        setSelectedVerses(prev => {
            const isAlreadySelected = prev.some(v => v.id === ayah.id);
            if (isAlreadySelected) {
                return prev.filter(v => v.id !== ayah.id);
            } else {
                return [...prev, ayah].sort((a, b) => a.id - b.id);
            }
        });
    };

    // Ensure only one repeat mode is active at a time
    const handleToggleVerseRepeat = () => {
        if (!selectedVersesRepeatMode) {
            setPageRepeatMode(false);
            setSurahRepeatMode(false);
            stopPagePlayback();
            stopSurahPlayback();
            setIsSelectionMode(true); // Enable selection mode
        } else {
            setIsSelectionMode(false); // Disable selection mode
            setSelectedVerses([]); // Clear selection
        }
        setSelectedVersesRepeatMode(!selectedVersesRepeatMode);
    };

    const handleTogglePageRepeat = () => {
        if (!pageRepeatMode) {
            setSelectedVersesRepeatMode(false);
            setSurahRepeatMode(false);
            stopSelectedVersesPlayback();
            stopSurahPlayback();
        }
        setPageRepeatMode(!pageRepeatMode);
    };

    const handleToggleSurahRepeat = () => {
        if (!surahRepeatMode) {
            setSelectedVersesRepeatMode(false);
            setPageRepeatMode(false);
            stopSelectedVersesPlayback();
            stopPagePlayback();
        }
        setSurahRepeatMode(!surahRepeatMode);
    };

    useEffect(() => {
        setCurrentPage(surah?.startingPage || 1);
    }, [surah]);

    if (loadingSurah) {
        return (
            <div className="min-h-screen bg-background">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <Card className="min-h-[800px]">
                            <CardContent className="p-12 text-center">
                                <div className="animate-pulse">
                                    <div className="h-8 bg-muted rounded mb-6"></div>
                                    <div className="space-y-4">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className="h-6 bg-muted rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    if (!surah) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background" data-page-playing={isPlayingPage}>
            <Header />

            <main className="container mx-auto px-4 py-8">
                <SurahHeader
                    surah={surah}
                    currentPage={currentPage}
                >
                    <RepeatModeControls
                        verseRepeatMode={selectedVersesRepeatMode}
                        onToggleVerseRepeat={handleToggleVerseRepeat}
                        pageRepeatMode={pageRepeatMode}
                        onTogglePageRepeat={handleTogglePageRepeat}
                        surahRepeatMode={surahRepeatMode}
                        onToggleSurahRepeat={handleToggleSurahRepeat}
                    />

                    {/* Page Repeat Panel */}
                    {pageRepeatMode && (
                        <PageRepeatPanel
                            repeatCount={pageRepeatCount}
                            onRepeatCountChange={setPageRepeatCount}
                            isPlaying={isPlayingPage}
                            isPaused={isPagePaused}
                            onTogglePlay={togglePagePlayback}
                            onStop={stopPagePlayback}
                            currentVerseIndex={currentPageVerseIndex}
                            currentRepeatCount={currentPageRepeatCount}
                            disabled={!hasValidAudioSelection(state)}
                            totalVerses={pageVerses.length}
                        />
                    )}

                    {/* Surah Repeat Panel */}
                    {surahRepeatMode && (
                        <SurahRepeatPanel
                            repeatCount={surahRepeatCount}
                            onRepeatCountChange={setSurahRepeatCount}
                            isPlaying={isPlayingSurah}
                            isPaused={isSurahPaused}
                            onTogglePlay={toggleSurahPlayback}
                            onStop={stopSurahPlayback}
                            currentPlayingPage={currentPlayingPage}
                            currentVerseIndex={currentSurahVerseIndex}
                            currentRepeatCount={currentSurahRepeatCount}
                            totalPages={surah.endingPage! - surah.startingPage! + 1}
                            totalVerses={pageVerses.length}
                            disabled={!hasValidAudioSelection(state)}
                        />
                    )}
                </SurahHeader>

                <div className="flex flex-col gap-4">
                    {/* Page Navigation */}
                    <PageNavigation
                        currentPage={currentPage}
                        startPage={surah.startingPage || 0}
                        endPage={surah.endingPage || 0}
                        onPageChange={goToPage}
                    />

                    {/* Mushaf Page */}
                    <MushafPage
                        verses={pageVerses}
                        currentPage={currentPage}
                        playingAyaId={playingAyaId}
                        fontSize={state.fontSize}
                        versesRepeatMode={selectedVersesRepeatMode}
                        versesRepeatCount={selectedVersesRepeatCount}
                        pageRepeatMode={pageRepeatMode}
                        pageRepeatCount={pageRepeatCount}
                        isPlayingPage={isPlayingPage}
                        currentPageVerseIndex={currentPageVerseIndex}
                        currentPageRepeatCount={currentPageRepeatCount}
                        isSelectionMode={isSelectionMode}
                        selectedVerseIds={selectedVerses.map((v) => v.id)}
                        onVerseSelect={handleVerseSelect}
                    />

                    {/* Selection Tooltip - Shows when verses are selected */}
                    {selectedVerses.length > 0 && isSelectionMode && (
                        <SelectionTooltip
                            selectedCount={selectedVerses.length}
                            repeatCount={selectedVersesRepeatCount}
                            onRepeatCountChange={setSelectedVersesRepeatCount}
                            isPlaying={isPlayingSelectedVerses}
                            isPaused={isSelectedVersesPaused}
                            onTogglePlay={toggleSelectedVersesPlayback}
                            onStop={() => {
                                stopSelectedVersesPlayback();
                                setSelectedVerses([]);
                            }}
                            onClearSelection={() => setSelectedVerses([])}
                            currentVerseIndex={selectedVersesCurrentIndex}
                            currentRepeatCount={selectedVersesRepeatIndex}
                        />
                    )}

                    {/* Bottom Page Navigation */}
                    <PageNavigation
                        currentPage={currentPage}
                        startPage={surah.startingPage || 0}
                        endPage={surah.endingPage || 0}
                        onPageChange={goToPage}
                    />
                </div>

                {/* Empty state */}
                {pageVerses.length === 0 && !loadingPageVerses && (
                    <div className="max-w-4xl mx-auto text-center py-12">
                        <p className="text-muted-foreground">No verses found on this page.</p>
                    </div>
                )}
            </main>
        </div>
    );
}