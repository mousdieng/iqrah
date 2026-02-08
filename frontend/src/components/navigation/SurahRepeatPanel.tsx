'use client';

import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

interface SurahRepeatPanelProps {
    repeatCount: number;
    onRepeatCountChange: (count: number) => void;
    isPlaying: boolean;
    isPaused?: boolean;
    onTogglePlay: () => void;
    onStop?: () => void;
    currentPlayingPage?: number;
    currentVerseIndex?: number;
    currentRepeatCount?: number;
    totalPages?: number;
    totalVerses?: number;
    disabled: boolean;
}

export default function SurahRepeatPanel({
                                             repeatCount,
                                             onRepeatCountChange,
                                             isPlaying,
                                             isPaused = false,
                                             onTogglePlay,
                                             onStop,
                                             currentPlayingPage = 1,
                                             currentVerseIndex = 0,
                                             currentRepeatCount = 0,
                                             totalPages = 0,
                                             totalVerses = 0,
                                             disabled
                                         }: SurahRepeatPanelProps) {
    const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <div className="text-center mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                <strong>Surah Repeat Mode Active</strong>
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mb-3">
                Play entire surah continuously - all pages will be played {repeatCount} {repeatCount === 1 ? 'time' : 'times'}
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        Surah repeats:
                    </label>
                    <select
                        value={repeatCount}
                        onChange={(e) => onRepeatCountChange(Number(e.target.value))}
                        className="px-3 py-1 border border-purple-300 rounded text-sm bg-white dark:bg-gray-800"
                        disabled={isPlaying}
                    >
                        {speeds.map(speed => (
                            <option key={speed} value={speed}>
                                {speed}x
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={onTogglePlay}
                        variant={isPlaying && !isPaused ? 'default' : 'outline'}
                        size="sm"
                        disabled={disabled}
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {isPlaying && !isPaused ? (
                            <>
                                <Pause className="h-4 w-4" />
                                Pause
                            </>
                        ) : isPaused ? (
                            <>
                                <Play className="h-4 w-4" />
                                Resume
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Play Surah
                            </>
                        )}
                    </Button>
                    {isPlaying && onStop && (
                        <Button
                            onClick={onStop}
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                        >
                            <Square className="h-4 w-4" />
                            Stop
                        </Button>
                    )}
                </div>
            </div>
            {isPlaying && (
                <div className="mt-3 text-sm text-purple-600 dark:text-purple-400">
                    <div className="flex justify-center items-center gap-3 mb-2 flex-wrap">
                        <div className="text-xs">
                            Verse {currentVerseIndex + 1} of {totalVerses}
                        </div>
                        <div className="text-xs">
                            (Repeat {currentRepeatCount + 1}/{repeatCount})
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}