'use client';

import { Button } from '@/components/ui/button';
import { Play, Pause, Square } from 'lucide-react';

interface VerseRepeatPanelProps {
    repeatCount: number;
    onRepeatCountChange: (count: number) => void;
    isPlaying: boolean;
    isPaused?: boolean;
    onTogglePlay: () => void;
    onStop?: () => void;
    currentRepeatCount?: number;
    verseName?: string; // e.g., "Al-Fatiha 1:1" or "Verse 5"
    disabled: boolean;
}

export default function VerseRepeatPanel({
                                             repeatCount,
                                             onRepeatCountChange,
                                             isPlaying,
                                             isPaused = false,
                                             onTogglePlay,
                                             onStop,
                                             currentRepeatCount = 0,
                                             verseName = 'Selected Verse',
                                             disabled
                                         }: VerseRepeatPanelProps) {
    const speeds = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 70, 100];

    return (
        <div className="text-center mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                <strong>Verse Repeat Mode Active</strong>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                Repeat a single verse continuously for memorization - {verseName} will play {repeatCount} {repeatCount === 1 ? 'time' : 'times'}
            </p>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Repetitions:
                    </label>
                    <select
                        value={repeatCount}
                        onChange={(e) => onRepeatCountChange(Number(e.target.value))}
                        className="px-3 py-1 border border-blue-300 rounded text-sm bg-white dark:bg-gray-800"
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
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
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
                                Repeat Verse
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
                <div className="mt-3 text-sm text-blue-600 dark:text-blue-400">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <div className="font-medium">
                            Playing: {verseName}
                        </div>
                        <div className="text-xs">
                            (Repetition {currentRepeatCount + 1}/{repeatCount})
                        </div>
                    </div>
                    <div className="w-full max-w-xs mx-auto bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                        <div
                            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${((currentRepeatCount + 1) / repeatCount) * 100}%`
                            }}
                        />
                    </div>
                    <div className="text-xs mt-1">
                        {Math.round(((currentRepeatCount + 1) / repeatCount) * 100)}% Complete
                    </div>
                </div>
            )}
        </div>
    );
}




// 'use client';
//
// interface IndividualRepeatPanelProps {
//     repeatCount: number;
//     onRepeatCountChange: (count: number) => void;
//     currentRepeatCount?: number;
//     totalRepeats?: number;
//     isActive?: boolean;
// }
//
// export default function IndividualRepeatPanel({
//                                                   repeatCount,
//                                                   onRepeatCountChange,
//                                                   currentRepeatCount,
//                                                   totalRepeats,
//                                                   isActive = false,
//                                               }: IndividualRepeatPanelProps) {
//     return (
//         <div className="text-center mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
//             <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
//                 🔁 <strong>Repeat Mode Active</strong>
//             </p>
//             <p className="text-xs text-orange-600 dark:text-orange-400 mb-3">
//                 Each verse will repeat {repeatCount} times when you click play
//             </p>
//             <div className="flex justify-center items-center gap-4">
//                 <div className="flex items-center gap-2">
//                     <label className="text-sm font-medium text-orange-700 dark:text-orange-300">
//                         Repeat count:
//                     </label>
//                     <select
//                         value={repeatCount}
//                         onChange={(e) => onRepeatCountChange(Number(e.target.value))}
//                         className="px-3 py-1 border border-orange-300 rounded text-sm bg-white dark:bg-gray-800"
//                     >
//                         <option value={1}>1x</option>
//                         <option value={2}>2x</option>
//                         <option value={3}>3x</option>
//                         <option value={5}>5x</option>
//                         <option value={7}>7x</option>
//                         <option value={10}>10x</option>
//                     </select>
//                 </div>
//                 {isActive && typeof currentRepeatCount === 'number' && typeof totalRepeats === 'number' && (
//                     <div className="text-sm text-orange-600 dark:text-orange-400">
//                         Repeat {currentRepeatCount + 1}/{totalRepeats}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }