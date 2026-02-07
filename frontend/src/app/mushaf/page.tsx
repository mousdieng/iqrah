// 'use client';
//
// import { useState, useEffect } from 'react';
// import Header from '@/components/layout/Header';
// import Breadcrumb from '@/components/navigation/Breadcrumb';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { ChevronLeft, ChevronRight, BookOpen, Home } from 'lucide-react';
// import Link from 'next/link';
// import { useQuran } from '@/contexts/QuranContext';
// import { quranApi } from '@/lib/api';
// import { Ayah } from '@/types/quran';
//
// // Mushaf page configuration
// const TOTAL_PAGES = 604; // Standard Mushaf has 604 pages
//
// // Function to get Arabic surah names
// const getSurahArabicName = (surahNumber: number): string => {
//   const surahNames: Record<number, string> = {
//     1: "الْفَاتِحَة", 2: "الْبَقَرَة", 3: "آلِ عِمْرَان", 4: "النِّسَاء", 5: "الْمَائِدَة",
//     6: "الْأَنْعَام", 7: "الْأَعْرَاف", 8: "الْأَنْفَال", 9: "التَّوْبَة", 10: "يُونُس",
//     // Add more as needed
//   };
//   return surahNames[surahNumber] || `سورة ${surahNumber}`;
// };
//
// export default function MushafPage() {
//   const { state, dispatch } = useQuran();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageVerses, setPageVerses] = useState<Ayah[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//
//   useEffect(() => {
//     loadMushafPage();
//   }, [currentPage]);
//
//   const loadMushafPage = async () => {
//     setIsLoading(true);
//     try {
//       // Use the proper page API from AlQuran.cloud through our backend
//       const verses = await quranApi.getPage(currentPage);
//       setPageVerses(verses);
//     } catch (error) {
//       console.error('Error loading mushaf page:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const goToPage = (page: number) => {
//     if (page >= 1 && page <= TOTAL_PAGES) {
//       setCurrentPage(page);
//     }
//   };
//
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <main className="container mx-auto px-4 py-8">
//           <div className="max-w-6xl mx-auto">
//             <Card className="min-h-[800px]">
//               <CardContent className="p-12 text-center">
//                 <div className="animate-pulse">
//                   <div className="h-8 bg-muted rounded mb-6"></div>
//                   <div className="space-y-4">
//                     {[...Array(10)].map((_, i) => (
//                       <div key={i} className="h-6 bg-muted rounded"></div>
//                     ))}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </main>
//       </div>
//     );
//   }
//
//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//
//       <main className="container mx-auto px-4 py-8">
//         {/* Breadcrumb Navigation */}
//         <div className="mb-6">
//           <Breadcrumb />
//         </div>
//
//         {/* Navigation */}
//         <div className="flex items-center justify-between mb-6">
//           <Link href="/">
//             <Button variant="ghost" className="gap-2">
//               <Home className="h-4 w-4" />
//               Home
//             </Button>
//           </Link>
//
//           <div className="flex items-center gap-2">
//             <Badge variant="outline">
//               Page {currentPage} of {TOTAL_PAGES}
//             </Badge>
//           </div>
//
//           <div className="flex items-center gap-2">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => goToPage(currentPage - 1)}
//               disabled={currentPage <= 1}
//             >
//               <ChevronLeft className="h-4 w-4" />
//               Previous
//             </Button>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => goToPage(currentPage + 1)}
//               disabled={currentPage >= TOTAL_PAGES}
//             >
//               Next
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//         </div>
//
//         {/* Mushaf Page */}
//         <div className="max-w-4xl mx-auto">
//           <Card className="bg-slate-800 text-white shadow-2xl border border-slate-600 min-h-[900px] relative">
//             <CardContent className="p-12">
//               {/* Page Header - Translation/Reading Toggle */}
//               <div className="flex justify-center gap-8 mb-8">
//                 <button
//                   onClick={() => dispatch({ type: 'TOGGLE_TRANSLATIONS' })}
//                   className={`flex items-center gap-2 px-4 py-2 rounded ${
//                     state.showTranslations
//                       ? 'bg-teal-600 text-white'
//                       : 'bg-slate-700 text-slate-300'
//                   }`}
//                 >
//                   <span className="text-sm">📖</span>
//                   Translation
//                 </button>
//                 <div className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded">
//                   <span className="text-sm">📚</span>
//                   Reading
//                 </div>
//               </div>
//
//               {/* Action Buttons */}
//               <div className="flex justify-between items-center mb-8">
//                 <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-md hover:bg-slate-600 transition-colors">
//                   <span className="text-sm">ℹ️</span>
//                   Surah Info
//                 </button>
//                 <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
//                   <span className="text-sm">▶️</span>
//                   Play Audio
//                 </button>
//               </div>
//
//               {/* Verses */}
//               <div className="space-y-4 min-h-[600px] text-center">
//                 {pageVerses.map((aya, index) => {
//                   // const selectedTranslation = aya.translations.find(
//                   //   t => t.translatorName === state.selectedTranslation
//                   // );
//
//                   // Check if this is the first verse of a new surah
//                   const isFirstVerseOfSurah = aya.id === 1;
//                   const prevAya = index > 0 ? pageVerses[index - 1] : null;
//                   const isNewSurah = !prevAya || prevAya.surahNumber !== aya.surahNumber;
//
//                   return (
//                     <div key={aya.id} className="group">
//                       {/* Surah Header (if first verse of surah on this page) */}
//                       {isFirstVerseOfSurah && isNewSurah && (
//                         <div className="text-center mb-8">
//                           <div className="text-3xl font-bold mb-6 text-white" dir="rtl">
//                             سُورَةُ {getSurahArabicName(aya.surahNumber)}
//                           </div>
//                           {/* Bismillah for surahs except Al-Fatihah and At-Tawbah */}
//                           {aya.surahNumber !== 1 && aya.surahNumber !== 9 && (
//                             <div className="text-center mb-8">
//                               <p className="text-2xl leading-relaxed text-white" dir="rtl">
//                                 بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
//                               </p>
//                             </div>
//                           )}
//                         </div>
//                       )}
//
//                       {/* Verse */}
//                       <div className="mb-6">
//                         <p
//                           className="text-center leading-relaxed font-arabic text-2xl text-white mb-4"
//                           style={{
//                             fontSize: `${Math.max(state.fontSize + 4, 24)}px`,
//                             lineHeight: '2.5'
//                           }}
//                           dir="rtl"
//                         >
//                           {aya.text}
//                           <span className="inline-flex items-center justify-center w-8 h-8 mx-3 bg-transparent border-2 border-white text-white text-sm font-bold rounded-full">
//                             {aya.id}
//                           </span>
//                         </p>
//
//                         {/* Translation (if enabled) */}
//                         {selectedTranslation && state.showTranslations && (
//                           <div className="mt-4 pt-3 border-t border-slate-600">
//                             <p className="text-sm text-slate-400 leading-relaxed italic text-center max-w-3xl mx-auto">
//                               {selectedTranslation.text}
//                             </p>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//
//               {/* Page Footer */}
//               <div className="text-center mt-8 pt-4 border-t-2 border-amber-200">
//                 <div className="flex justify-between items-center">
//                   <div className="text-sm text-amber-300">
//                     {pageVerses.length > 0 && (
//                       <>
//                         From {pageVerses[0].surahNumber}:{pageVerses[0].ayaNumber}
//                       </>
//                     )}
//                   </div>
//
//                   <div className="text-center">
//                     <div className="w-12 h-12 mx-auto bg-amber-600 text-white font-bold text-xl rounded-full flex items-center justify-center">
//                       {currentPage}
//                     </div>
//                   </div>
//
//                   <div className="text-sm text-amber-300">
//                     {pageVerses.length > 0 && (
//                       <>
//                         To {pageVerses[pageVerses.length - 1].surahNumber}:{pageVerses[pageVerses.length - 1].ayaNumber}
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//
//         {/* Page Navigation Controls */}
//         <div className="flex justify-center items-center gap-4 mt-8">
//           <Button
//             variant="outline"
//             onClick={() => goToPage(1)}
//             disabled={currentPage <= 1}
//           >
//             First Page
//           </Button>
//
//           <div className="flex items-center gap-2">
//             <span className="text-sm">Go to page:</span>
//             <input
//               type="number"
//               min="1"
//               max={TOTAL_PAGES}
//               value={currentPage}
//               onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
//               className="w-20 px-2 py-1 border rounded text-center"
//             />
//           </div>
//
//           <Button
//             variant="outline"
//             onClick={() => goToPage(TOTAL_PAGES)}
//             disabled={currentPage >= TOTAL_PAGES}
//           >
//             Last Page
//           </Button>
//         </div>
//       </main>
//     </div>
//   );
// }