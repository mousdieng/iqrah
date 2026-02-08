'use client';

import { Ayah } from '@/types/quran';

interface VerseCardProps {
    ayah: Ayah;
    isPlaying: boolean;
    isCurrentVerse?: boolean;
    fontSize: number;
    versesRepeatMode?: boolean;
    versesRepeatCount?: number;
    pageRepeatMode?: boolean;
    pageRepeatCount?: number;
    onSelect?: () => void;
    isSelected?: boolean;
    isSelectionMode?: boolean;
}

export default function VerseCard({
                                      ayah,
                                      isPlaying,
                                      isCurrentVerse = false,
                                      fontSize,
                                      versesRepeatMode = false,
                                      versesRepeatCount = 1,
                                      pageRepeatMode = false,
                                      pageRepeatCount = 1,
                                      onSelect,
                                      isSelected = false,
                                      isSelectionMode = false,
                                  }: VerseCardProps) {
    // Check if this is the first verse of a surah
    const isFirstVerseOfSurah = ayah.id === 1;
    const shouldShowBismillah = isFirstVerseOfSurah && ayah.id !== 1 && ayah.id !== 9;

    return (
        <div
            id={`verse-${ayah.id}`}
            className={`
        block mb-4 p-4 rounded-lg transition-all duration-200
        ${isCurrentVerse ? 'bg-purple-900/40 ring-2 ring-purple-500' :
                pageRepeatMode && isCurrentVerse ? 'bg-green-900/40 ring-2 ring-green-500' :
                    'bg-slate-700/30'}
        ${isSelectionMode ? 'cursor-pointer hover:bg-teal-800/50 hover:ring-2 hover:ring-teal-500' : ''}
        ${isSelected ? 'bg-teal-600/40 ring-2 ring-teal-400' : ''}
        border border-slate-600/50 hover:border-slate-500/70
      `}
            onClick={isSelectionMode ? onSelect : undefined}
        >
            {/* Surah Header */}
            {isFirstVerseOfSurah && (
                <div className="text-center mb-8 block">
                    <div className="text-3xl font-bold mb-6 text-white">
                        سُورَةُ
                    </div>
                    {shouldShowBismillah && (
                        <div className="text-center mb-8">
                            <div className="text-2xl leading-relaxed text-white">
                                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Verse Header */}
            <div className="flex items-center justify-between mb-2">
        <span className="text-amber-300 text-sm flex items-center gap-2">
            {isSelected && <span className="text-teal-400 font-bold">✓</span>}
            {versesRepeatMode && (
                <span className="text-orange-400 text-xs">🔁{versesRepeatCount}x</span>
            )}
            {pageRepeatMode && (
                <span className="text-green-400 text-xs">📄{pageRepeatCount}x</span>
            )}
        </span>
                {isSelectionMode && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.();
                        }}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            isSelected
                                ? 'bg-teal-600 text-white hover:bg-teal-700'
                                : 'bg-slate-600 hover:bg-slate-500 text-gray-300'
                        }`}
                    >
                        {isSelected ? '✓ Selected' : '+ Select'}
                    </button>
                )}
            </div>

            {/* Arabic Verse Text */}
            <div
                className="leading-relaxed text-white"
                style={{
                    fontFamily: "'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif",
                    fontSize: `${Math.max(fontSize + 4, 28)}px`,
                    lineHeight: '1.8',
                    textAlign: 'right',
                    direction: 'rtl',
                }}
            >
                {ayah.text}
                <span
                    className="inline-flex items-center justify-center mx-2 text-amber-300"
                    style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        verticalAlign: 'super',
                        lineHeight: '1',
                    }}
                >
          ﴿{ayah.id}﴾
        </span>
            </div>
        </div>
    );
}





// 'use client';
//
// import { Ayah } from '@/types/quran';
//
// interface VerseCardProps {
//     ayah: Ayah;
//     isPlaying: boolean;
//     isCurrentVerse?: boolean;
//     fontSize: number;
//     versesRepeatMode?: boolean;
//     versesRepeatCount?: number;
//     pageRepeatMode?: boolean;
//     pageRepeatCount?: number;
//     // currentRepeatCount?: number;
//     // showRepeatInfo?: boolean;
//     // onPlayClick: () => void;
//     // onSelect?: () => void;
//     isSelected?: boolean;
//     isSelectionMode?: boolean;
// }
//
// export default function VerseCard({
//                                       ayah,
//                                       isPlaying,
//                                       isCurrentVerse = false,
//                                       fontSize,
//                                       versesRepeatMode = false,
//                                       versesRepeatCount = 1,
//                                       pageRepeatMode = false,
//                                       pageRepeatCount = 1,
//                                       // currentRepeatCount = 0,
//                                       // showRepeatInfo = false,
//                                       // onPlayClick,
//                                       // onSelect,
//                                       isSelected = false,
//                                       isSelectionMode = false,
//                                   }: VerseCardProps) {
//     // Check if this is the first verse of a surah
//     const isFirstVerseOfSurah = ayah.id === 1;
//     const shouldShowBismillah = isFirstVerseOfSurah && ayah.id !== 1 && ayah.id !== 9;
//
//     return (
//         <div
//             id={`verse-${ayah.id}`}
//             className={`
//         block mb-4 p-4 rounded-lg transition-all duration-200
//         ${isCurrentVerse ? 'bg-purple-900/40 ring-2 ring-purple-500' :
//                 pageRepeatMode && isCurrentVerse ? 'bg-green-900/40 ring-2 ring-green-500' :
//                     'bg-slate-700/30'}
//         ${isSelectionMode ? 'cursor-pointer hover:bg-teal-800/50 hover:ring-2 hover:ring-teal-500' : ''}
//         ${isSelected ? 'bg-teal-600/40 ring-2 ring-teal-400' : ''}
//         border border-slate-600/50 hover:border-slate-500/70
//       `}
//             // onClick={isSelectionMode ? onSelect : undefined}
//         >
//             {/* Surah Header */}
//             {isFirstVerseOfSurah && (
//                 <div className="text-center mb-8 block">
//                     <div className="text-3xl font-bold mb-6 text-white">
//                         سُورَةُ
//                     </div>
//                     {shouldShowBismillah && (
//                         <div className="text-center mb-8">
//                             <div className="text-2xl leading-relaxed text-white">
//                                 بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             )}
//
//             {/* Verse Header */}
//             <div className="flex items-center justify-between mb-2">
//         <span className="text-amber-300 text-sm flex items-center gap-2">
//             {isSelected && <span className="text-teal-400">✓</span>}
//             {versesRepeatMode && (
//                 <span className="text-orange-400 text-xs">🔁{versesRepeatCount}x</span>
//             )}
//             {pageRepeatMode && (
//                 <span className="text-green-400 text-xs">📄{pageRepeatCount}x</span>
//             )}
//             {/*{showRepeatInfo && (*/}
//             {/*    <span className="text-orange-400 text-xs">*/}
//             {/*  ({currentRepeatCount + 1}/{individualRepeatMode ? individualRepeatCount : pageRepeatCount})*/}
//             {/*</span>*/}
//             {/*)}*/}
//         </span>
//                 <div className="flex gap-2">
//                     <button
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             // onPlayClick();
//                         }}
//                         className={`px-2 py-1 rounded text-white text-xs transition-colors ${
//                             versesRepeatMode
//                                 ? 'bg-orange-600 hover:bg-orange-700'
//                                 : 'bg-emerald-600 hover:bg-emerald-700'
//                         }`}
//                     >
//                         {isPlaying ? '⏸️' : versesRepeatMode ? '🔁' : '▶️'}
//                     </button>
//                     {isSelectionMode && (
//                         <button
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 // onSelect?.();
//                             }}
//                             className={`px-2 py-1 rounded text-xs transition-colors ${
//                                 isSelected
//                                     ? 'bg-teal-600 text-white'
//                                     : 'bg-slate-600 hover:bg-slate-500 text-gray-300'
//                             }`}
//                         >
//                             {isSelected ? '✓' : '+'}
//                         </button>
//                     )}
//                 </div>
//             </div>
//
//             {/* Arabic Verse Text */}
//             <div
//                 className="leading-relaxed text-white"
//                 style={{
//                     fontFamily: "'Scheherazade New', 'Noto Naskh Arabic', 'Amiri', serif",
//                     fontSize: `${Math.max(fontSize + 4, 28)}px`,
//                     lineHeight: '1.8',
//                     textAlign: 'right',
//                     direction: 'rtl',
//                 }}
//             >
//                 {ayah.text}
//                 <span
//                     className="inline-flex items-center justify-center mx-2 text-amber-300"
//                     style={{
//                         fontSize: '14px',
//                         fontWeight: 'bold',
//                         fontFamily: 'monospace',
//                         verticalAlign: 'super',
//                         lineHeight: '1',
//                     }}
//                 >
//           ﴿{ayah.id}﴾
//         </span>
//             </div>
//         </div>
//     );
// }