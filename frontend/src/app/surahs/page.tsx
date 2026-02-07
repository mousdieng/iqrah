'use client';

import { useState, useMemo, useCallback } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, BookOpen, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAllSurahs } from "@/hooks/useQuranQueries";

export default function SurahsPage() {
  const { data: surahs, isLoading: loadingSurahs, error } = useAllSurahs();
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized filtered surahs for better performance
  const filteredSurahs = useMemo(() => {
    if (!surahs) return [];

    const query = searchQuery.trim().toLowerCase();
    if (!query) return surahs;

    return surahs.filter((surah) => {
      const matchesName = surah.name.toLowerCase().includes(query);
      const matchesEnglishName = surah.englishName.toLowerCase().includes(query);
      const matchesTranslation = surah.englishNameTranslation?.toLowerCase().includes(query);
      const matchesNumber = surah.number.toString().includes(query);

      return matchesName || matchesEnglishName || matchesTranslation || matchesNumber;
    });
  }, [surahs, searchQuery]);

  // Debounced search handler for better performance
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <header className="flex items-center justify-center mb-8">
            <BookOpen className="h-8 w-8 text-emerald-600 mr-3" aria-hidden="true" />
            <h1 className="text-3xl font-bold">All Surahs</h1>
          </header>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  aria-hidden="true"
              />
              <Input
                  type="search"
                  placeholder="Search by name, number, or translation..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                  aria-label="Search surahs"
                  autoComplete="off"
              />
            </div>
            {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Found {filteredSurahs.length} surah{filteredSurahs.length !== 1 ? 's' : ''}
                </p>
            )}
          </div>

          {/* Error State */}
          {error && (
              <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load surahs. Please try refreshing the page.
                </AlertDescription>
              </Alert>
          )}

          {/* Loading State */}
          {loadingSurahs && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, index) => (
                    <Card key={`loading-${index}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-3">
                          <Skeleton className="h-6 w-3/4 mx-auto" />
                          <Skeleton className="h-5 w-2/3 mx-auto" />
                          <Skeleton className="h-4 w-1/2 mx-auto" />
                          <Skeleton className="h-4 w-1/3 mx-auto" />
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
          )}

          {/* Surahs Grid */}
          {!loadingSurahs && !error && (
              <>
                <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    role="list"
                    aria-label="List of Surahs"
                >
                  {filteredSurahs.map((surah) => (
                      <Link
                          key={`surah-${surah.number}`}
                          href={`/surah/${surah.number}`}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-lg"
                          role="listitem"
                      >
                        <Card className="h-full cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all duration-200 hover:-translate-y-1">
                          <CardContent className="p-6">
                            {/* Header Badges */}
                            <div className="flex items-start justify-between mb-4">
                              <Badge
                                  variant="outline"
                                  className="text-xs font-mono"
                                  aria-label={`Surah number ${surah.number}`}
                              >
                                {surah.number}
                              </Badge>
                              <Badge
                                  variant={surah.revelationType === 'Meccan' ? 'default' : 'secondary'}
                                  className="text-xs"
                                  aria-label={`Revealed in ${surah.revelationType}`}
                              >
                                {surah.revelationType}
                              </Badge>
                            </div>

                            {/* Surah Names */}
                            <div className="text-center mb-4 space-y-2">
                              <h2
                                  className="text-2xl font-bold text-right leading-relaxed"
                                  dir="rtl"
                                  lang="ar"
                              >
                                {surah.name}
                              </h2>
                              <h3 className="text-lg font-semibold text-emerald-600">
                                {surah.englishName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {surah.englishNameTranslation}
                              </p>
                            </div>

                            {/* Verse Count */}
                            <div className="text-center pt-3 border-t border-border">
                              <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {surah.numberOfAyahs}
                          </span>{' '}
                                verse{surah.numberOfAyahs !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                  ))}
                </div>

                {/* Empty State */}
                {filteredSurahs.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground mb-2">
                        No surahs found
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search query
                      </p>
                    </div>
                )}
              </>
          )}
        </main>
      </div>
  );
}













// 'use client';
//
// import { useState, useEffect } from 'react';
// import Header from '@/components/layout/Header';
// import Breadcrumb from '@/components/navigation/Breadcrumb';
// import { Card, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Search, BookOpen } from 'lucide-react';
// import Link from 'next/link';
// import {useAllSurahs, useReciters, useTranslators} from "@/hooks/useQuranQueries";
//
// export default function SurahsPage() {
//   const { data: surahs, isLoading: loadingSurahs } = useAllSurahs();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filteredSurahs, setFilteredSurahs] = useState(surahs);
//
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       const filtered = surahs?.filter(surah =>
//         surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         surah.id.toString().includes(searchQuery)
//       );
//       setFilteredSurahs(filtered);
//     } else {
//       setFilteredSurahs(surahs);
//     }
//   }, [searchQuery]);
//
//   useEffect(() => {
//     console.log(surahs)
//   }, [surahs])
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
//         <div className="flex items-center justify-center mb-8">
//           <BookOpen className="h-8 w-8 text-emerald-600 mr-3" />
//           <h1 className="text-3xl font-bold">All Surahs</h1>
//         </div>
//
//         {/* Search */}
//         <div className="max-w-md mx-auto mb-8">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               type="text"
//               placeholder="Search surahs..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </div>
//
//         {/* Surahs Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filteredSurahs?.map((surah) => (
//             <Link key={surah.id} href={`/surah/${surah.id}`}>
//               <Card className="cursor-pointer hover:shadow-lg transition-shadow">
//                 <CardContent className="p-6">
//                   <div className="flex items-start justify-between mb-3">
//                     <Badge variant="outline" className="text-xs">
//                       {surah.id}
//                     </Badge>
//                     <Badge
//                       variant={surah.revelationType === 'Meccan' ? 'default' : 'secondary'}
//                       className="text-xs"
//                     >
//                       {surah.revelationType}
//                     </Badge>
//                   </div>
//
//                   <div className="text-center mb-4">
//                     <h3 className="text-xl font-bold mb-1 text-right" dir="rtl">
//                       {surah.name}
//                     </h3>
//                     <h4 className="text-lg font-semibold text-emerald-600">
//                       {surah.name}
//                     </h4>
//                     <p className="text-sm text-muted-foreground">
//                       {surah.englishName}
//                     </p>
//                   </div>
//
//                   <div className="text-center text-sm text-muted-foreground">
//                     {surah.numberOfAyahs} verse{surah.numberOfAyahs !== 1 ? 's' : ''}
//                   </div>
//                 </CardContent>
//               </Card>
//             </Link>
//           ))}
//         </div>
//
//         {filteredSurahs?.length === 0 && (
//           <div className="text-center py-12">
//             <p className="text-muted-foreground">No surahs found matching your search.</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }