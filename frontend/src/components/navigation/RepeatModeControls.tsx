'use client';

import { Button } from '@/components/ui/button';
import { Repeat, Repeat1, BookOpen } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface RepeatModeControlsProps {
    // Verse Repeat
    verseRepeatMode: boolean;
    onToggleVerseRepeat: () => void;

    // Page Repeat
    pageRepeatMode: boolean;
    onTogglePageRepeat: () => void;

    // Surah Repeat
    surahRepeatMode: boolean;
    onToggleSurahRepeat: () => void;
}

export default function RepeatModeControls({
                                               verseRepeatMode,
                                               onToggleVerseRepeat,
                                               pageRepeatMode,
                                               onTogglePageRepeat,
                                               surahRepeatMode,
                                               onToggleSurahRepeat,
                                           }: RepeatModeControlsProps) {
    return (
        <div className="flex justify-center gap-2 mb-4">
            <TooltipProvider>
                {/* Verse Repeat */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={verseRepeatMode ? 'default' : 'outline'}
                            size="sm"
                            onClick={onToggleVerseRepeat}
                            className={`gap-2 ${
                                verseRepeatMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                        >
                            <Repeat1 className="h-4 w-4" />
                            Verse Repeat
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Repeat a single verse multiple times for memorization</p>
                    </TooltipContent>
                </Tooltip>

                {/* Page Repeat */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={pageRepeatMode ? 'default' : 'outline'}
                            size="sm"
                            onClick={onTogglePageRepeat}
                            className={`gap-2 ${
                                pageRepeatMode
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                        >
                            <Repeat className="h-4 w-4" />
                            Page Repeat
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Play entire page continuously with verse repetition</p>
                    </TooltipContent>
                </Tooltip>

                {/* Surah Repeat */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={surahRepeatMode ? 'default' : 'outline'}
                            size="sm"
                            onClick={onToggleSurahRepeat}
                            className={`gap-2 ${
                                surahRepeatMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
                            }`}
                        >
                            <BookOpen className="h-4 w-4" />
                            Surah Repeat
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Play entire surah (all pages) with repetition</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}






// 'use client';
//
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
//
// import {StickyNote, Repeat} from "lucide-react";
//
// interface RepeatModeControlsProps {
//     individualRepeatMode: boolean;
//     onToggleIndividualRepeat: () => void;
//     pageRepeatMode: boolean;
//     onTogglePageRepeat: () => void;
// }
//
// export default function RepeatModeControls({
//                                                individualRepeatMode,
//                                                onToggleIndividualRepeat,
//                                                pageRepeatMode,
//                                                onTogglePageRepeat,
//                                            }: RepeatModeControlsProps) {
//     return (
//         <div className="flex justify-center gap-3 mb-2 flex-wrap">
//             <Button
//                 onClick={onToggleIndividualRepeat}
//                 variant={individualRepeatMode ? 'default' : 'outline'}
//                 className="gap-2 bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
//             >
//                 <Repeat />
//                 <span>Repeat Mode</span>
//                 {individualRepeatMode && <Badge className="ml-2 bg-orange-600 text-white text-xs">ON</Badge>}
//             </Button>
//             <Button
//                 onClick={onTogglePageRepeat}
//                 variant={pageRepeatMode ? 'default' : 'outline'}
//                 className="gap-2 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
//             >
//                 <StickyNote />
//                 <span>Page Repeat</span>
//                 {pageRepeatMode && <Badge className="ml-2 bg-green-600 text-white">ON</Badge>}
//             </Button>
//         </div>
//     );
// }