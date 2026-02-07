// PageRepeatPanel.tsx
'use client';

import { Button } from '@/components/ui/button';
import {Play, Pause, Square} from 'lucide-react';
import {useEffect} from "react";

interface PageRepeatPanelProps {
    repeatCount: number;
    onRepeatCountChange: (count: number) => void;
    isPlaying: boolean;
    isPaused?: boolean;
    onTogglePlay: () => void;
    onStop?: () => void;
    currentVerseIndex?: number;
    currentRepeatCount?: number;
    totalVerses?: number;
    disabled: boolean;
}

export default function PageRepeatPanel({
                                            repeatCount,
                                            onRepeatCountChange,
                                            isPlaying,
                                            isPaused = false,
                                            onTogglePlay,
                                            onStop,
                                            currentVerseIndex = 0,
                                            currentRepeatCount = 0,
                                            totalVerses = 0,
                                            disabled
                                        }: PageRepeatPanelProps) {
    const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    return (
        <div className="text-center mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                <strong>Page Repeat Mode Active</strong>
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mb-3">
                Play entire page continuously - each verse repeats {repeatCount} times before moving to next
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300">
                        Per-verse repeats:
                    </label>
                    <select
                        value={repeatCount}
                        onChange={(e) => onRepeatCountChange(Number(e.target.value))}
                        className="px-3 py-1 border border-green-300 rounded text-sm bg-white dark:bg-gray-800"
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
                        className="gap-2 bg-green-600 hover:bg-green-700 text-white"
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
                                Play Page
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
                <div className="mt-3 text-sm text-green-600 dark:text-green-400">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <div className="font-medium">
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