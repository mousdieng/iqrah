'use client';

import {useEffect, useState} from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { usePageNavigation } from '@/hooks/useKeyboardNavigation';
import { Card, CardContent } from '@/components/ui/card';
import {hasValidAudioSelection, useQuran} from '@/contexts/QuranContext';
import { usePageSurah, useSurah } from '@/hooks/useQuranQueries';
import { Ayah } from '@/types/quran';

// Refactored components
import SurahHeader from '@/components/quran/SurahHeader';
import RepeatModeControls from '@/components/navigation/RepeatModeControls';
import IndividualRepeatPanel from '@/components/navigation/IndividualRepeatPanel';
import PageRepeatPanel from '@/components/navigation/PageRepeatPanel';
import PageNavigation from '@/components/navigation/PageNavigation';
import MushafPage from '@/components/quran/MushafPage';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useVerseRepeat } from '@/hooks/useVerseRepeat';
import { usePageRepeat } from '@/hooks/usePageRepeat';
import ErrorAlert from "@/components/ErrorAlert";

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

  const {
    repeatMode: individualRepeatMode,
    setRepeatMode: setIndividualRepeatMode,
    repeatCount: individualRepeatCount,
    setRepeatCount: setIndividualRepeatCount,
    currentRepeatCount: currentRepeatForVerse,
    repeatTargetVerse,
    playVerseWithRepeat,
    reset: resetVerseRepeat
  } = useVerseRepeat({
    onPlayVerse: async (ayah, onEnded) => {
      await playAudio(ayah, onEnded);
    },
  });

  const {
    pageRepeatMode,
    setPageRepeatMode,
    pageRepeatCount,
    setPageRepeatCount,
    isPlayingPage,
    isPaused,
    currentVerseIndex: currentPageVerseIndex,
    currentRepeatIndex: currentPageRepeatCount,
    togglePagePlayback,
    stopPagePlayback,
  } = usePageRepeat({
    verses: pageVerses,
    getAudioUrl,
    onVersePlay: (ayahId) => {
      // This will be handled by the hook itself
    },
    onVersePause: () => {
      // This will be handled by the hook itself
    },
  });

  // Verse selection
  const [selectedVerses, setSelectedVerses] = useState<Ayah[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Page navigation
  const goToPage = (page: number) => {
    const start = surah?.startingPage || 1;
    const end = surah?.endingPage || 1;
    if (page >= start && page <= end) {
      setCurrentPage(page);
      refetchPageVerses();
    }
  };

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

  // Handle play audio for individual verses
  const handlePlayAudio = async (ayah: Ayah) => {
    // If same verse is playing, pause it
    if (playingAyaId === ayah.id) {
      stopAudio();
      resetVerseRepeat();
      return;
    }

    // Stop page playback if active
    if (isPlayingPage) {
      stopPagePlayback();
    }

    // Play with or without repeat based on mode
    if (individualRepeatMode) {
      await playVerseWithRepeat(ayah, 0);
    } else {
      await playAudio(ayah);
    }
  };

  // Handle verse selection
  const handleVerseSelect = (ayah: Ayah) => {
    if (!isSelectionMode) return;

    const isSelected = selectedVerses.some((v) => v.id === ayah.id);
    if (isSelected) {
      setSelectedVerses(selectedVerses.filter((v) => v.id !== ayah.id));
    } else {
      setSelectedVerses([...selectedVerses, ayah]);
    }
  };

  useEffect(() => {
    setCurrentPage(surah?.startingPage || 1)
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
                individualRepeatMode={individualRepeatMode}
                onToggleIndividualRepeat={() => setIndividualRepeatMode(!individualRepeatMode)}
                pageRepeatMode={pageRepeatMode}
                onTogglePageRepeat={() => setPageRepeatMode(!pageRepeatMode)}
            />

            {/* Individual Repeat Panel */}
            {individualRepeatMode && (
                <IndividualRepeatPanel
                    repeatCount={individualRepeatCount}
                    onRepeatCountChange={setIndividualRepeatCount}
                    currentRepeatCount={currentRepeatForVerse}
                    totalRepeats={individualRepeatCount}
                    isActive={!!repeatTargetVerse && playingAyaId === repeatTargetVerse.id}
                />
            )}

            {/* Page Repeat Panel */}
            {pageRepeatMode && (
                <PageRepeatPanel
                  repeatCount={pageRepeatCount}
                  onRepeatCountChange={setPageRepeatCount}
                  isPlaying={isPlayingPage}
                  isPaused={isPaused}
                  onTogglePlay={togglePagePlayback}
                  onStop={stopPagePlayback}
                  currentVerseIndex={currentPageVerseIndex}
                  currentRepeatCount={currentPageRepeatCount}
                  disabled={!hasValidAudioSelection(state)}
                  totalVerses={pageVerses.length}
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
                individualRepeatMode={individualRepeatMode}
                individualRepeatCount={individualRepeatCount}
                pageRepeatMode={pageRepeatMode}
                pageRepeatCount={pageRepeatCount}
                isPlayingPage={isPlayingPage}
                currentPageVerseIndex={currentPageVerseIndex}
                currentPageRepeatCount={currentPageRepeatCount}
                repeatTargetVerseId={repeatTargetVerse?.id || null}
                currentRepeatForVerse={currentRepeatForVerse}
                isSelectionMode={isSelectionMode}
                selectedVerseIds={selectedVerses.map((v) => v.id)}
                onPlayAudio={handlePlayAudio}
                onVerseSelect={handleVerseSelect}
            />

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