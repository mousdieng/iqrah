'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardNavigationOptions {
  enableGlobalShortcuts?: boolean;
  enableQuickJump?: boolean;
  onSearchOpen?: () => void;
  onQuickJumpOpen?: () => void;
}

export function useKeyboardNavigation({
  enableGlobalShortcuts = true,
  enableQuickJump = true,
  onSearchOpen,
  onQuickJumpOpen
}: KeyboardNavigationOptions = {}) {
  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle shortcuts when user is typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as Element)?.getAttribute('contenteditable') === 'true'
    ) {
      return;
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;
    const isModifierPressed = ctrlKey || metaKey;

    // Quick Jump (Ctrl/Cmd + K)
    if (enableQuickJump && isModifierPressed && key === 'k') {
      event.preventDefault();
      onQuickJumpOpen?.();
      return;
    }

    // Search (Ctrl/Cmd + /)
    if (enableGlobalShortcuts && isModifierPressed && key === '/') {
      event.preventDefault();
      onSearchOpen?.();
      return;
    }

    // Global Navigation Shortcuts
    if (enableGlobalShortcuts && !isModifierPressed) {
      switch (key) {
        case 'h':
          // Go to Home
          if (!altKey && !shiftKey) {
            event.preventDefault();
            router.push('/');
          }
          break;

        case 's':
          // Go to Surahs
          if (!altKey && !shiftKey) {
            event.preventDefault();
            router.push('/surahs');
          }
          break;

        case 'm':
          // Go to Mushaf
          if (!altKey && !shiftKey) {
            event.preventDefault();
            router.push('/mushaf');
          }
          break;

        case '?':
          // Show keyboard shortcuts help
          if (!altKey && !shiftKey) {
            event.preventDefault();
            // You could show a help modal here
            console.log('Keyboard shortcuts help would appear here');
          }
          break;
      }
    }

    // Numeric shortcuts for quick surah access (1-9)
    if (enableGlobalShortcuts && !isModifierPressed && !altKey) {
      const num = parseInt(key);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        const surahMappings: Record<number, number> = {
          1: 1,   // Al-Fatihah
          2: 2,   // Al-Baqarah
          3: 18,  // Al-Kahf
          4: 36,  // Yasin
          5: 55,  // Ar-Rahman
          6: 67,  // Al-Mulk
          7: 112, // Al-Ikhlas
          8: 113, // Al-Falaq
          9: 114, // An-Nas
        };

        const surahNumber = surahMappings[num];
        if (surahNumber) {
          event.preventDefault();
          router.push(`/surah/${surahNumber}`);
        }
      }
    }

    // Page navigation shortcuts within surah/mushaf pages
    if (enableGlobalShortcuts && !isModifierPressed) {
      switch (key) {
        case 'ArrowLeft':
          // Previous page/surah (when not in input)
          if (altKey) {
            event.preventDefault();
            // This would be handled by the individual page components
            document.dispatchEvent(new CustomEvent('navigate-previous'));
          }
          break;

        case 'ArrowRight':
          // Next page/surah (when not in input)
          if (altKey) {
            event.preventDefault();
            // This would be handled by the individual page components
            document.dispatchEvent(new CustomEvent('navigate-next'));
          }
          break;

        case ' ':
          // Space bar for play/pause (when not in input)
          if (!altKey && !shiftKey) {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('toggle-audio'));
          }
          break;
      }
    }
  }, [router, enableGlobalShortcuts, enableQuickJump, onSearchOpen, onQuickJumpOpen]);

  useEffect(() => {
    if (enableGlobalShortcuts || enableQuickJump) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enableGlobalShortcuts, enableQuickJump]);

  // Return utility functions for components to use
  return {
    // Helper function to check if shortcuts should be disabled
    shouldDisableShortcuts: useCallback((element: Element | null = null) => {
      const target = element || document.activeElement;
      return (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.getAttribute('contenteditable') === 'true'
      );
    }, []),

    // Helper to trigger navigation events
    triggerNavigation: useCallback((direction: 'previous' | 'next') => {
      document.dispatchEvent(new CustomEvent(`navigate-${direction}`));
    }, []),

    // Helper to trigger audio toggle
    triggerAudioToggle: useCallback(() => {
      document.dispatchEvent(new CustomEvent('toggle-audio'));
    }, [])
  };
}

// Custom hook for individual page navigation
export function usePageNavigation(onPrevious?: () => void, onNext?: () => void, onAudioToggle?: () => void) {
  useEffect(() => {
    const handleNavigatePrevious = () => onPrevious?.();
    const handleNavigateNext = () => onNext?.();
    const handleAudioToggle = () => onAudioToggle?.();

    document.addEventListener('navigate-previous', handleNavigatePrevious);
    document.addEventListener('navigate-next', handleNavigateNext);
    document.addEventListener('toggle-audio', handleAudioToggle);

    return () => {
      document.removeEventListener('navigate-previous', handleNavigatePrevious);
      document.removeEventListener('navigate-next', handleNavigateNext);
      document.removeEventListener('toggle-audio', handleAudioToggle);
    };
  }, [onPrevious, onNext, onAudioToggle]);
}

// Keyboard shortcuts reference
export const KEYBOARD_SHORTCUTS = {
  global: [
    { key: 'Ctrl/Cmd + K', description: 'Open quick jump' },
    { key: 'Ctrl/Cmd + /', description: 'Open search' },
    { key: 'H', description: 'Go to Home' },
    { key: 'S', description: 'Go to Surahs' },
    { key: 'M', description: 'Go to Mushaf' },
    { key: '?', description: 'Show help' },
  ],
  quickAccess: [
    { key: '1', description: 'Al-Fatihah (Surah 1)' },
    { key: '2', description: 'Al-Baqarah (Surah 2)' },
    { key: '3', description: 'Al-Kahf (Surah 18)' },
    { key: '4', description: 'Yasin (Surah 36)' },
    { key: '5', description: 'Ar-Rahman (Surah 55)' },
    { key: '6', description: 'Al-Mulk (Surah 67)' },
    { key: '7', description: 'Al-Ikhlas (Surah 112)' },
    { key: '8', description: 'Al-Falaq (Surah 113)' },
    { key: '9', description: 'An-Nas (Surah 114)' },
  ],
  navigation: [
    { key: 'Alt + ←', description: 'Previous page/surah' },
    { key: 'Alt + →', description: 'Next page/surah' },
    { key: 'Space', description: 'Play/pause audio' },
  ]
};