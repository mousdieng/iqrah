import { useState, useCallback } from 'react';
import { Ayah } from '@/types/quran';

interface UseVerseRepeat {
    onPlayVerse: (ayah: Ayah, onEnded: () => void) => Promise<void>;
}

export function useVerseRepeat({ onPlayVerse }: UseVerseRepeat) {
    const [repeatMode, setRepeatMode] = useState(false);
    const [repeatCount, setRepeatCount] = useState(3);
    const [currentRepeatCount, setCurrentRepeatCount] = useState(0);
    const [repeatTargetVerse, setRepeatTargetVerse] = useState<Ayah | null>(null);

    const playVerseWithRepeat = useCallback(
        async (ayah: Ayah, currentRepeat = 0) => {
            setRepeatTargetVerse(ayah);
            setCurrentRepeatCount(currentRepeat);

            const handleEnded = () => {
                if (repeatMode && currentRepeat + 1 < repeatCount) {
                    setTimeout(() => {
                        playVerseWithRepeat(ayah, currentRepeat + 1);
                    }, 1000);
                } else {
                    setRepeatTargetVerse(null);
                    setCurrentRepeatCount(0);
                }
            };

            await onPlayVerse(ayah, handleEnded);
        },
        [repeatMode, repeatCount, onPlayVerse]
    );

    const reset = useCallback(() => {
        setRepeatTargetVerse(null);
        setCurrentRepeatCount(0);
    }, []);

    return {
        repeatMode,
        setRepeatMode,
        repeatCount,
        setRepeatCount,
        currentRepeatCount,
        repeatTargetVerse,
        playVerseWithRepeat,
        reset,
    };
}