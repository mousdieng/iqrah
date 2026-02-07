'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  BookOpen,
  Navigation,
  Hash,
  Menu,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface FloatingNavigationProps {
  // Page navigation
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // Verse navigation
  currentVerse?: number;
  totalVerses?: number;
  onVerseChange?: (verse: number) => void;

  // Audio controls
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;

  // Surah navigation
  currentSurah?: number;
  onSurahChange?: (surah: number) => void;

  // Settings
  showOnMobile?: boolean;
  position?: 'bottom' | 'right' | 'left';
  autoHide?: boolean;
  hideDelay?: number;
}

export default function FloatingNavigation({
  currentPage,
  totalPages,
  onPageChange,
  currentVerse,
  totalVerses,
  onVerseChange,
  isPlaying = false,
  onPlayPause,
  onPrevious,
  onNext,
  currentSurah,
  onSurahChange,
  showOnMobile = true,
  position = 'bottom',
  autoHide = true,
  hideDelay = 3000
}: FloatingNavigationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isMuted, setIsMuted] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide functionality
  useEffect(() => {
    if (!autoHide) return;

    const handleMouseMove = () => {
      setLastInteraction(Date.now());
      setIsVisible(true);
    };

    const handleTouchStart = () => {
      setLastInteraction(Date.now());
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [autoHide]);

  useEffect(() => {
    if (!autoHide) return;

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      if (Date.now() - lastInteraction >= hideDelay) {
        setIsVisible(false);
        setIsExpanded(false);
      }
    }, hideDelay);

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [lastInteraction, hideDelay, autoHide]);

  // Swipe gesture handling
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Minimum swipe distance
      const minSwipeDistance = 50;

      // Horizontal swipes for page navigation
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) {
          // Swipe left - next page
          if (currentPage && totalPages && currentPage < totalPages) {
            onPageChange?.(currentPage + 1);
          }
        } else {
          // Swipe right - previous page
          if (currentPage && currentPage > 1) {
            onPageChange?.(currentPage - 1);
          }
        }
      }
      // Vertical swipes for verse navigation
      else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
        if (diffY > 0) {
          // Swipe up - next verse
          if (currentVerse !== undefined && totalVerses && currentVerse < totalVerses - 1) {
            onVerseChange?.(currentVerse + 1);
          }
        } else {
          // Swipe down - previous verse
          if (currentVerse !== undefined && currentVerse > 0) {
            onVerseChange?.(currentVerse - 1);
          }
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage, totalPages, currentVerse, totalVerses, onPageChange, onVerseChange]);

  if (!showOnMobile && typeof window !== 'undefined' && window.innerWidth >= 768) {
    return null;
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'fixed right-4 top-1/2 -translate-y-1/2 flex-col';
      case 'left':
        return 'fixed left-4 top-1/2 -translate-y-1/2 flex-col';
      case 'bottom':
      default:
        return 'fixed bottom-4 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div
      className={`${getPositionClasses()} z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setLastInteraction(Date.now())}
      onTouchStart={() => setLastInteraction(Date.now())}
    >
      <Card className="shadow-lg border-2">
        <CardContent className="p-2">
          {isExpanded ? (
            // Expanded view
            <div className="space-y-2">
              {/* Header with collapse button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Navigation</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrevious}
                  className="h-8 w-8 p-0"
                >
                  <SkipBack className="h-3 w-3" />
                </Button>
                <Button
                  variant={isPlaying ? "secondary" : "default"}
                  size="sm"
                  onClick={onPlayPause}
                  className="h-8 w-8 p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  className="h-8 w-8 p-0"
                >
                  <SkipForward className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8 p-0"
                >
                  {isMuted ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {/* Page Navigation */}
              {currentPage && totalPages && (
                <div className="space-y-1">
                  <div className="text-xs text-center text-muted-foreground">
                    Page Navigation
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPageChange?.(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {currentPage} / {totalPages}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPageChange?.(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Verse Navigation */}
              {currentVerse !== undefined && totalVerses && (
                <div className="space-y-1">
                  <div className="text-xs text-center text-muted-foreground">
                    Verse Navigation
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVerseChange?.(currentVerse - 1)}
                      disabled={currentVerse <= 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      {currentVerse + 1} / {totalVerses}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onVerseChange?.(currentVerse + 1)}
                      disabled={currentVerse >= totalVerses - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Surah Navigation */}
              {currentSurah && (
                <div className="space-y-1">
                  <div className="text-xs text-center text-muted-foreground">
                    Surah Navigation
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSurahChange?.(currentSurah - 1)}
                      disabled={currentSurah <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Badge variant="outline" className="text-xs">
                      Surah {currentSurah}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSurahChange?.(currentSurah + 1)}
                      disabled={currentSurah >= 114}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Gesture Hints */}
              <div className="text-xs text-center text-muted-foreground border-t pt-2">
                <div>Swipe ← → for pages</div>
                <div>Swipe ↑ ↓ for verses</div>
              </div>
            </div>
          ) : (
            // Compact view
            <div className="flex items-center gap-2">
              {/* Quick audio control */}
              <Button
                variant={isPlaying ? "secondary" : "ghost"}
                size="sm"
                onClick={onPlayPause}
                className="h-8 w-8 p-0"
              >
                {isPlaying ? (
                  <Pause className="h-3 w-3" />
                ) : (
                  <Play className="h-3 w-3" />
                )}
              </Button>

              {/* Page info */}
              {currentPage && totalPages && (
                <Badge variant="outline" className="text-xs">
                  {currentPage}/{totalPages}
                </Badge>
              )}

              {/* Verse info */}
              {currentVerse !== undefined && totalVerses && (
                <Badge variant="secondary" className="text-xs">
                  {currentVerse + 1}/{totalVerses}
                </Badge>
              )}

              {/* Expand button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Touch hint for first-time users */}
      {!isExpanded && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border animate-pulse">
          Tap to expand
        </div>
      )}
    </div>
  );
}