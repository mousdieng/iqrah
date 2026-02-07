// 'use client';
//
// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Separator } from '@/components/ui/separator';
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   BookOpen,
//   Hash,
//   Clock,
//   Heart,
//   Bookmark,
//   Search,
//   MapPin,
//   ArrowRight,
//   ChevronDown,
//   ChevronUp,
//   Navigation,
// } from 'lucide-react';
// import { Ayah } from '@/types/quran';
//
// interface VerseNavigatorProps {
//   verses: Ayah[];
//   currentVerseIndex?: number;
//   onVerseSelect: (verseIndex: number) => void;
//   trigger?: React.ReactNode;
//   surahNumber: number;
//   surahName: string;
//   arabicName: string;
// }
//
// interface VerseGroup {
//   startVerse: number;
//   endVerse: number;
//   theme?: string;
//   description?: string;
// }
//
// // Sample verse groupings for common surahs - in real app, this would come from API
// const VERSE_GROUPS: Record<number, VerseGroup[]> = {
//   1: [
//     { startVerse: 1, endVerse: 7, theme: "Opening Prayer", description: "The complete prayer" }
//   ],
//   2: [
//     { startVerse: 1, endVerse: 7, theme: "Introduction", description: "Opening verses" },
//     { startVerse: 8, endVerse: 20, theme: "The Hypocrites", description: "Description of hypocrites" },
//     { startVerse: 21, endVerse: 39, theme: "Call to Worship", description: "Invitation to worship Allah" },
//     { startVerse: 40, endVerse: 103, theme: "Children of Israel", description: "Stories and lessons" },
//     { startVerse: 104, endVerse: 141, theme: "Abraham's Legacy", description: "Ibrahim and his descendants" },
//     { startVerse: 142, endVerse: 176, theme: "Change of Qibla", description: "Direction of prayer" },
//     { startVerse: 177, endVerse: 202, theme: "Laws and Ethics", description: "Social and moral guidance" },
//     { startVerse: 203, endVerse: 242, theme: "Fighting and Peace", description: "Rules of conflict" },
//     { startVerse: 243, endVerse: 286, theme: "Financial Laws", description: "Trade, charity, and loans" }
//   ],
//   18: [
//     { startVerse: 1, endVerse: 12, theme: "Opening", description: "Introduction to the stories" },
//     { startVerse: 13, endVerse: 26, theme: "People of the Cave", description: "The main story" },
//     { startVerse: 27, endVerse: 59, theme: "Gardens Parable", description: "Rich and poor man" },
//     { startVerse: 60, endVerse: 82, theme: "Moses and Khidr", description: "Journey of learning" },
//     { startVerse: 83, endVerse: 110, theme: "Dhul-Qarnayn", description: "The great ruler's story" }
//   ]
// };
//
// export default function VerseNavigator({
//   verses,
//   currentVerseIndex = 0,
//   onVerseSelect,
//   trigger,
//   surahNumber,
//   surahName,
//   arabicName
// }: VerseNavigatorProps) {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredVerses, setFilteredVerses] = useState(verses);
//   const [showGroups, setShowGroups] = useState(true);
//   const [bookmarks, setBookmarks] = useState<number[]>([]);
//   const [recentVerses, setRecentVerses] = useState<number[]>([]);
//
//   const verseGroups = VERSE_GROUPS[surahNumber] || [];
//
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       const filtered = verses.filter((verse, index) => {
//         const verseNum = index + 1;
//         return (
//           verse.arabicText.includes(searchQuery) ||
//           verse.translations.some(t =>
//             t.text.toLowerCase().includes(searchQuery.toLowerCase())
//           ) ||
//           verseNum.toString().includes(searchQuery)
//         );
//       });
//       setFilteredVerses(filtered);
//     } else {
//       setFilteredVerses(verses);
//     }
//   }, [searchQuery, verses]);
//
//   const handleVerseClick = (verseIndex: number) => {
//     onVerseSelect(verseIndex);
//     // Add to recent verses
//     setRecentVerses(prev => {
//       const updated = [verseIndex, ...prev.filter(v => v !== verseIndex)].slice(0, 5);
//       return updated;
//     });
//   };
//
//   const toggleBookmark = (verseIndex: number) => {
//     setBookmarks(prev =>
//       prev.includes(verseIndex)
//         ? prev.filter(v => v !== verseIndex)
//         : [...prev, verseIndex]
//     );
//   };
//
//   const getVerseInGroup = (verseNumber: number) => {
//     return verseGroups.find(group =>
//       verseNumber >= group.startVerse && verseNumber <= group.endVerse
//     );
//   };
//
//   const defaultTrigger = (
//     <Button variant="outline" className="gap-2">
//       <Navigation className="h-4 w-4" />
//       Verse Navigator
//       <Badge variant="secondary" className="ml-1">
//         {verses.length}
//       </Badge>
//     </Button>
//   );
//
//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         {trigger || defaultTrigger}
//       </SheetTrigger>
//       <SheetContent side="right" className="w-[400px] sm:w-[500px] p-0">
//         <div className="flex flex-col h-full">
//           <SheetHeader className="p-6 pb-3 border-b">
//             <SheetTitle className="text-left">
//               <div className="flex items-center gap-3">
//                 <BookOpen className="h-5 w-5 text-emerald-600" />
//                 <div>
//                   <div className="text-lg font-bold">{surahName}</div>
//                   <div className="text-sm text-muted-foreground" dir="rtl">
//                     {arabicName}
//                   </div>
//                 </div>
//               </div>
//             </SheetTitle>
//           </SheetHeader>
//
//           <div className="flex-1 overflow-hidden flex flex-col">
//             {/* Search */}
//             <div className="p-4 border-b">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                 <Input
//                   placeholder="Search verses..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//
//             {/* Quick Actions */}
//             <div className="p-4 border-b">
//               <div className="grid grid-cols-2 gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleVerseClick(0)}
//                   className="gap-2"
//                 >
//                   <Hash className="h-3 w-3" />
//                   First Verse
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => handleVerseClick(verses.length - 1)}
//                   className="gap-2"
//                 >
//                   <Hash className="h-3 w-3" />
//                   Last Verse
//                 </Button>
//               </div>
//             </div>
//
//             {/* Current Position */}
//             {currentVerseIndex >= 0 && (
//               <div className="p-4 border-b bg-muted/50">
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="flex items-center gap-2">
//                     <MapPin className="h-4 w-4 text-emerald-600" />
//                     <span className="font-medium">Current Position</span>
//                   </div>
//                   <Badge variant="secondary">
//                     Verse {currentVerseIndex + 1} of {verses.length}
//                   </Badge>
//                 </div>
//                 <div className="mt-2 w-full bg-background rounded-full h-1.5">
//                   <div
//                     className="bg-emerald-600 h-1.5 rounded-full transition-all"
//                     style={{
//                       width: `${((currentVerseIndex + 1) / verses.length) * 100}%`
//                     }}
//                   />
//                 </div>
//               </div>
//             )}
//
//             {/* Recent Verses */}
//             {recentVerses.length > 0 && (
//               <div className="p-4 border-b">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Clock className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm font-medium">Recent</span>
//                 </div>
//                 <div className="flex flex-wrap gap-1">
//                   {recentVerses.map(verseIndex => (
//                     <Button
//                       key={verseIndex}
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleVerseClick(verseIndex)}
//                       className="h-8 px-2 text-xs"
//                     >
//                       {verseIndex + 1}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             )}
//
//             {/* Bookmarked Verses */}
//             {bookmarks.length > 0 && (
//               <div className="p-4 border-b">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Bookmark className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm font-medium">Bookmarks</span>
//                 </div>
//                 <div className="flex flex-wrap gap-1">
//                   {bookmarks.map(verseIndex => (
//                     <Button
//                       key={verseIndex}
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleVerseClick(verseIndex)}
//                       className="h-8 px-2 text-xs"
//                     >
//                       {verseIndex + 1}
//                     </Button>
//                   ))}
//                 </div>
//               </div>
//             )}
//
//             {/* Verse Groups */}
//             {verseGroups.length > 0 && (
//               <div className="p-4 border-b">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <BookOpen className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-sm font-medium">Sections</span>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setShowGroups(!showGroups)}
//                     className="h-6 w-6 p-0"
//                   >
//                     {showGroups ? (
//                       <ChevronUp className="h-3 w-3" />
//                     ) : (
//                       <ChevronDown className="h-3 w-3" />
//                     )}
//                   </Button>
//                 </div>
//                 {showGroups && (
//                   <div className="space-y-2">
//                     {verseGroups.map((group, index) => (
//                       <Card key={index} className="cursor-pointer hover:bg-muted/50">
//                         <CardContent className="p-3">
//                           <div
//                             className="flex items-center justify-between"
//                             onClick={() => handleVerseClick(group.startVerse - 1)}
//                           >
//                             <div className="flex-1">
//                               <div className="font-medium text-sm">{group.theme}</div>
//                               {group.description && (
//                                 <div className="text-xs text-muted-foreground">
//                                   {group.description}
//                                 </div>
//                               )}
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Badge variant="outline" className="text-xs">
//                                 {group.startVerse}-{group.endVerse}
//                               </Badge>
//                               <ArrowRight className="h-3 w-3 text-muted-foreground" />
//                             </div>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//
//             {/* Verse List */}
//             <div className="flex-1 overflow-auto">
//               <div className="p-4">
//                 <div className="flex items-center gap-2 mb-3">
//                   <Hash className="h-4 w-4 text-muted-foreground" />
//                   <span className="text-sm font-medium">
//                     All Verses
//                     {searchQuery && (
//                       <span className="text-muted-foreground">
//                         ({filteredVerses.length} results)
//                       </span>
//                     )}
//                   </span>
//                 </div>
//                 <div className="space-y-1">
//                   {filteredVerses.map((verse, originalIndex) => {
//                     const verseIndex = verses.findIndex(v => v.id === verse.id);
//                     const verseNumber = verseIndex + 1;
//                     const isCurrentVerse = verseIndex === currentVerseIndex;
//                     const isBookmarked = bookmarks.includes(verseIndex);
//                     const group = getVerseInGroup(verseNumber);
//
//                     return (
//                       <div
//                         key={verse.id}
//                         className={`flex items-center justify-between p-2 rounded transition-colors cursor-pointer ${
//                           isCurrentVerse
//                             ? 'bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
//                             : 'hover:bg-muted/50'
//                         }`}
//                         onClick={() => handleVerseClick(verseIndex)}
//                       >
//                         <div className="flex items-center gap-3 flex-1 min-w-0">
//                           <Badge
//                             variant={isCurrentVerse ? "default" : "outline"}
//                             className="text-xs flex-shrink-0"
//                           >
//                             {verseNumber}
//                           </Badge>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-sm truncate" dir="rtl">
//                               {verse.arabicText.substring(0, 50)}
//                               {verse.arabicText.length > 50 && '...'}
//                             </div>
//                             {group && (
//                               <div className="text-xs text-muted-foreground mt-1">
//                                 {group.theme}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               toggleBookmark(verseIndex);
//                             }}
//                             className={`h-6 w-6 p-0 ${isBookmarked ? 'text-blue-600' : 'text-muted-foreground'}`}
//                           >
//                             <Bookmark className={`h-3 w-3 ${isBookmarked ? 'fill-current' : ''}`} />
//                           </Button>
//                           {isCurrentVerse && (
//                             <MapPin className="h-3 w-3 text-emerald-600" />
//                           )}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </SheetContent>
//     </Sheet>
//   );
// }