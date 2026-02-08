'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Ayah } from '@/types/quran';
import VerseCard from './VerseCard';
import { Pause, Play } from 'lucide-react';

interface MushafPageProps {
    verses: Ayah[];
    currentPage: number;
    playingAyaId: number | null;
    fontSize: number;
    versesRepeatMode: boolean;
    versesRepeatCount: number;
    pageRepeatMode: boolean;
    pageRepeatCount: number;
    isPlayingPage: boolean;
    currentPageVerseIndex: number;
    currentPageRepeatCount: number;
    isSelectionMode: boolean;
    selectedVerseIds: number[];
    onVerseSelect?: (ayah: Ayah) => void;
    isPlayingSurah?: boolean;
    onPlaySurah?: () => void;
}

export default function MushafPage({
                                       verses,
                                       currentPage,
                                       playingAyaId,
                                       fontSize,
                                       versesRepeatMode,
                                       versesRepeatCount,
                                       pageRepeatMode,
                                       pageRepeatCount,
                                       isPlayingPage,
                                       currentPageVerseIndex,
                                       currentPageRepeatCount,
                                       isSelectionMode,
                                       selectedVerseIds,
                                       onVerseSelect,
                                       isPlayingSurah = false,
                                       onPlaySurah,
                                   }: MushafPageProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <Card className="bg-slate-800 text-white shadow-2xl border border-slate-600 relative">
                <CardContent className="">
                    {/* Page Controls */}
                    <div className="flex justify-between items-center mb-6">
                        {onPlaySurah && (
                            <button
                                onClick={onPlaySurah}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                            >
                                {isPlayingSurah ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4" />
                                )}
                                {isPlayingSurah ? 'Pause' : 'Play'} Surah Audio
                            </button>
                        )}
                    </div>

                    {/* Verses */}
                    <div className="px-2 py-2">
                        <div className="space-y-4">
                            {verses.map((ayah, index) => {
                                const isCurrentPageVerse = isPlayingPage && currentPageVerseIndex === index;

                                return (
                                    <VerseCard
                                        key={ayah.id}
                                        ayah={ayah}
                                        isPlaying={playingAyaId === ayah.id}
                                        isCurrentVerse={isCurrentPageVerse}
                                        fontSize={fontSize}
                                        versesRepeatMode={versesRepeatMode}
                                        versesRepeatCount={versesRepeatCount}
                                        pageRepeatMode={pageRepeatMode}
                                        pageRepeatCount={pageRepeatCount}
                                        onSelect={onVerseSelect ? () => onVerseSelect(ayah) : undefined}
                                        isSelected={selectedVerseIds.includes(ayah.id)}
                                        isSelectionMode={isSelectionMode}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Page Footer */}
                    <div className="text-center mt-2 pt-2 border-t-2 border-amber-200">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-amber-300">
                                {verses.length > 0 && (
                                    <>
                                        From {verses[0].id}
                                    </>
                                )}
                            </div>

                            <div className="text-center">
                                <div className="w-12 h-12 mx-auto bg-amber-600 text-white font-bold text-xl rounded-full flex items-center justify-center">
                                    {currentPage}
                                </div>
                            </div>

                            <div className="text-sm text-amber-300">
                                {verses.length > 0 && (
                                    <>To {verses[verses.length - 1].id}</>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}




// 'use client';
//
// import { Card, CardContent } from '@/components/ui/card';
// import { Ayah } from '@/types/quran';
// import VerseCard from './VerseCard';
// import { Pause, Play } from 'lucide-react';
//
// interface MushafPageProps {
//     verses: Ayah[];
//     currentPage: number;
//     playingAyaId: number | null;
//     fontSize: number;
//     versesRepeatMode: boolean;
//     versesRepeatCount: number;
//     pageRepeatMode: boolean;
//     pageRepeatCount: number;
//     isPlayingPage: boolean;
//     currentPageVerseIndex: number;
//     currentPageRepeatCount: number;
//     // repeatTargetVerseId: number | null;
//     // currentRepeatForVerse: number;
//     isSelectionMode: boolean;
//     selectedVerseIds: number[];
//     // onPlayAudio: (ayah: Ayah) => void;
//     // onVerseSelect: (ayah: Ayah) => void;
//     isPlayingSurah?: boolean;
//     onPlaySurah?: () => void;
// }
//
// export default function MushafPage({
//                                        verses,
//                                        currentPage,
//                                        playingAyaId,
//                                        fontSize,
//                                        versesRepeatMode,
//                                        versesRepeatCount,
//                                        pageRepeatMode,
//                                        pageRepeatCount,
//                                        isPlayingPage,
//                                        currentPageVerseIndex,
//                                        currentPageRepeatCount,
//                                        // repeatTargetVerseId,
//                                        // currentRepeatForVerse,
//                                        isSelectionMode,
//                                        selectedVerseIds,
//                                        // onPlayAudio,
//                                        // onVerseSelect,
//                                        isPlayingSurah = false,
//                                        onPlaySurah,
//                                    }: MushafPageProps) {
//     return (
//         <div className="max-w-4xl mx-auto">
//             <Card className="bg-slate-800 text-white shadow-2xl border border-slate-600 relative">
//                 <CardContent className="">
//                     {/* Page Controls */}
//                     <div className="flex justify-between items-center mb-6">
//                         {onPlaySurah && (
//                             <button
//                                 onClick={onPlaySurah}
//                                 className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
//                             >
//                                 {isPlayingSurah ? (
//                                     <Pause className="h-4 w-4" />
//                                 ) : (
//                                     <Play className="h-4 w-4" />
//                                 )}
//                                 {isPlayingSurah ? 'Pause' : 'Play'} Surah Audio
//                             </button>
//                         )}
//                     </div>
//
//                     {/* Verses */}
//                     <div className="px-2 py-2">
//                         <div className="space-y-4">
//                             {verses.map((ayah, index) => {
//                                 const isCurrentPageVerse = isPlayingPage && currentPageVerseIndex === index;
//                                 // const isRepeatTarget = repeatTargetVerseId === ayah.id;
//
//                                 return (
//                                     <VerseCard
//                                         key={ayah.id}
//                                         ayah={ayah}
//                                         isPlaying={playingAyaId === ayah.id}
//                                         isCurrentVerse={isCurrentPageVerse}
//                                         fontSize={fontSize}
//                                         versesRepeatMode={versesRepeatMode}
//                                         versesRepeatCount={versesRepeatCount}
//                                         pageRepeatMode={pageRepeatMode}
//                                         pageRepeatCount={pageRepeatCount}
//                                         // currentRepeatCount={
//                                         //     isRepeatTarget && playingAyaId === ayah.id
//                                         //         ? currentRepeatForVerse
//                                         //         : isCurrentPageVerse
//                                         //             ? currentPageRepeatCount
//                                         //             : 0
//                                         // }
//                                         // showRepeatInfo={
//                                         //     (isRepeatTarget && playingAyaId === ayah.id) || isCurrentPageVerse
//                                         // }
//                                         // onPlayClick={() => onPlayAudio(ayah)}
//                                         // onSelect={() => onVerseSelect(ayah)}
//                                         isSelected={selectedVerseIds.includes(ayah.id)}
//                                         isSelectionMode={isSelectionMode}
//                                     />
//                                 );
//                             })}
//                         </div>
//                     </div>
//
//                     {/* Page Footer */}
//                     <div className="text-center mt-2 pt-2 border-t-2 border-amber-200">
//                         <div className="flex justify-between items-center">
//                             <div className="text-sm text-amber-300">
//                                 {verses.length > 0 && (
//                                     <>
//                                         From {verses[0].id}
//                                     </>
//                                 )}
//                             </div>
//
//                             <div className="text-center">
//                                 <div className="w-12 h-12 mx-auto bg-amber-600 text-white font-bold text-xl rounded-full flex items-center justify-center">
//                                     {currentPage}
//                                 </div>
//                             </div>
//
//                             <div className="text-sm text-amber-300">
//                                 {verses.length > 0 && (
//                                     <>To {verses[verses.length - 1].id}</>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// }