'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Square, X, Repeat } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SelectionTooltipProps {
    selectedCount: number;
    repeatCount: number;
    onRepeatCountChange: (count: number) => void;
    isPlaying: boolean;
    isPaused: boolean;
    onTogglePlay: () => void;
    onStop: () => void;
    onClearSelection: () => void;
    currentVerseIndex?: number;
    currentRepeatCount?: number;
}

export default function SelectionTooltip({
                                             selectedCount,
                                             repeatCount,
                                             onRepeatCountChange,
                                             isPlaying,
                                             isPaused,
                                             onTogglePlay,
                                             onStop,
                                             onClearSelection,
                                             currentVerseIndex = 0,
                                             currentRepeatCount = 0,
                                         }: SelectionTooltipProps) {
    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
            <Card className="bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-2xl border-2 border-teal-400">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-6">
                        {/* Selection Info */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 rounded-full p-2">
                                <Repeat className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold">
                                    {selectedCount} Verse{selectedCount !== 1 ? 's' : ''} Selected
                                </div>
                                {isPlaying && (
                                    <div className="text-xs text-teal-100">
                                        Playing: Verse {currentVerseIndex + 1}/{selectedCount} • Repeat {currentRepeatCount + 1}/{repeatCount}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-12 w-px bg-white/30" />

                        {/* Repeat Count Control */}
                        <div className="flex items-center gap-3 min-w-[200px]">
                            <span className="text-sm font-medium whitespace-nowrap">
                                Repeat: {repeatCount}x
                            </span>
                            <Slider
                                value={[repeatCount]}
                                onValueChange={(value) => onRepeatCountChange(value[0])}
                                min={1}
                                max={10}
                                step={1}
                                className="w-32"
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-12 w-px bg-white/30" />

                        {/* Playback Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={onTogglePlay}
                                size="sm"
                                variant="secondary"
                                className="bg-white/90 hover:bg-white text-teal-700 font-semibold"
                            >
                                {isPlaying && !isPaused ? (
                                    <>
                                        <Pause className="h-4 w-4 mr-2" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4 mr-2" />
                                        {isPaused ? 'Resume' : 'Play'}
                                    </>
                                )}
                            </Button>

                            {isPlaying && (
                                <Button
                                    onClick={onStop}
                                    size="sm"
                                    variant="secondary"
                                    className="bg-red-500/90 hover:bg-red-600 text-white"
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    Stop
                                </Button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-12 w-px bg-white/30" />

                        {/* Clear Selection */}
                        <Button
                            onClick={onClearSelection}
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}