'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  BookOpen,
  Heart,
  Moon,
  Settings,
  Sun,
  Volume2,
  Zap,
  Check,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useQuran } from '@/contexts/QuranContext';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import Link from 'next/link';
import EnhancedSearch from '@/components/navigation/EnhancedSearch';
import QuickJump from '@/components/navigation/QuickJump';
import MobileNav from '@/components/navigation/MobileNav';
import { useReciters, useTranslators } from '@/hooks/useQuranQueries';
import { AudioType } from '@/types/quran';
import { cn } from '@/lib/utils';

export default function Header() {
  const { data: reciters, isLoading: loadingReciters } = useReciters();
  const { data: translators, isLoading: loadingTranslators } = useTranslators();

  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickJump, setShowQuickJump] = useState(false);
  const { theme, setTheme } = useTheme();
  const { state, dispatch } = useQuran();

  // Initialize keyboard navigation
  useKeyboardNavigation({
    onSearchOpen: () => setShowSearch(true),
    onQuickJumpOpen: () => setShowQuickJump(true),
  });

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoized audio mode check
  const isRecitationMode = useMemo(
      () => state.audioMode === AudioType.RECITATION,
      [state.audioMode]
  );

  // Toggle audio mode handler
  const handleAudioModeToggle = useCallback(() => {
    dispatch({
      type: 'SET_AUDIO_MODE',
      payload: isRecitationMode ? AudioType.TRANSLATOR : AudioType.RECITATION,
    });
  }, [dispatch, isRecitationMode]);

  // Toggle theme handler
  const handleThemeToggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Reciter selection handler
  const handleReciterSelect = useCallback(
      (reciter: string) => {
        dispatch({ type: 'SET_RECITER', payload: reciter });
      },
      [dispatch]
  );

  // Tafsir selection handler
  const handleTafsirSelect = useCallback(
      (tafsir: string) => {
        dispatch({ type: 'SET_TAFSIR', payload: tafsir });
      },
      [dispatch]
  );

  // Get current audio source name
  const currentAudioSource = useMemo(() => {
    if (!mounted) return isRecitationMode ? 'Reciter' : 'Tafsir';

    if (isRecitationMode) {
      return reciters?.find((r) => r === state.selectedReciter) || 'Select Reciter';
    }
    return translators?.find((t) => t === state.selectedTafsir) || 'Select Tafsir';
  }, [mounted, isRecitationMode, reciters, translators, state.selectedReciter, state.selectedTafsir]);

  return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container relative flex h-16 items-center max-w-7xl mx-auto px-4">
          {/* Logo - Left Side */}
          <Link
              href="/"
              className="flex items-end space-x-2 flex-shrink-0 pb-1 pl-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-md"
              aria-label="إقراء - Home"
          >
            <BookOpen className="h-5 w-5 text-emerald-600 transition-transform group-hover:scale-110" />
            <span
                className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent"
                lang="ar"
            >
            إقراء
          </span>
          </Link>

          {/* Search and Quick Jump - Centered */}
          <div className="flex-1 flex justify-center px-4 mx-8">
            <div className="flex gap-1 md:gap-2 w-full max-w-sm md:max-w-md">
              {/* Enhanced Search */}
              <div className="flex-1">
                <EnhancedSearch
                    placeholder="Search Quran..."
                    className="w-full"
                    onClose={() => setShowSearch(false)}
                />
              </div>

              {/* Quick Jump Button */}
              <div className="hidden sm:block">
                <QuickJump
                    trigger={
                      <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 md:gap-2"
                          aria-label="Quick jump to surah or ayah"
                      >
                        <Zap className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden md:inline">Quick</span>
                      </Button>
                    }
                />
              </div>
            </div>
          </div>

          {/* Navigation & Mobile Menu - Right Side */}
          <div className="flex items-center justify-end flex-shrink-0 ml-auto">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2" aria-label="Main navigation">
              {/* Surahs Link */}
              <Link href="/surahs">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    aria-label="Browse all Surahs"
                >
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  Surahs
                </Button>
              </Link>

              {/* Audio Mode Toggle */}
              <Button
                  variant={isRecitationMode ? 'ghost' : 'default'}
                  size="sm"
                  className="gap-2"
                  onClick={handleAudioModeToggle}
                  suppressHydrationWarning
                  aria-label={`Audio mode: ${isRecitationMode ? 'Recitation' : 'Tafsir'}. Click to switch`}
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">
                {mounted ? (isRecitationMode ? 'Recitation' : 'Tafsir') : 'Audio'}
              </span>
              </Button>

              {/* Reciter/Tafsir Selection Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 max-w-[140px]"
                      suppressHydrationWarning
                      aria-label={`Current ${isRecitationMode ? 'reciter' : 'tafsir'}: ${currentAudioSource}`}
                      disabled={isRecitationMode ? loadingReciters : loadingTranslators}
                  >
                  <span className="text-xs truncate">
                    {currentAudioSource}
                  </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {isRecitationMode ? 'Select Reciter' : 'Select Tafsir'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isRecitationMode ? (
                      <>
                        {loadingReciters ? (
                            <DropdownMenuItem disabled>Loading reciters...</DropdownMenuItem>
                        ) : reciters && reciters.length > 0 ? (
                            reciters.map((reciter) => (
                                <DropdownMenuItem
                                    key={reciter}
                                    onClick={() => handleReciterSelect(reciter)}
                                    className="flex items-center justify-between"
                                >
                                  <span className="text-sm">{reciter}</span>
                                  {state.selectedReciter === reciter && (
                                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                  )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled>No reciters available</DropdownMenuItem>
                        )}
                      </>
                  ) : (
                      <>
                        {loadingTranslators ? (
                            <DropdownMenuItem disabled>Loading tafsirs...</DropdownMenuItem>
                        ) : translators && translators.length > 0 ? (
                            translators.map((tafsir) => (
                                <DropdownMenuItem
                                    key={tafsir}
                                    onClick={() => handleTafsirSelect(tafsir)}
                                    className="flex items-center justify-between"
                                >
                                  <span className="text-sm">{tafsir}</span>
                                  {state.selectedTafsir === tafsir && (
                                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                  )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled>No tafsirs available</DropdownMenuItem>
                        )}
                      </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Favorites */}
              <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 relative"
                  suppressHydrationWarning
                  aria-label={`Favorites${mounted && state.favorites.length > 0 ? `: ${state.favorites.length} items` : ''}`}
              >
                <Heart
                    className={cn(
                        'h-4 w-4 transition-colors',
                        mounted && state.favorites.length > 0 && 'fill-red-500 text-red-500'
                    )}
                    aria-hidden="true"
                />
                {mounted && state.favorites.length > 0 && (
                    <Badge
                        variant="secondary"
                        className="text-xs absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                        aria-hidden="true"
                    >
                      {state.favorites.length}
                    </Badge>
                )}
              </Button>

              {/* Theme Toggle */}
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleThemeToggle}
                  suppressHydrationWarning
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {!mounted ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                ) : theme === 'dark' ? (
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-transform" aria-hidden="true" />
                ) : (
                    <Moon className="h-4 w-4 rotate-0 scale-100 transition-transform" aria-hidden="true" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* Settings */}
              <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Open settings"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Settings</span>
              </Button>
            </nav>

            {/* Mobile Menu */}
            <MobileNav />
          </div>
        </div>
      </header>
  );
}




// 'use client';
//
// import {useEffect, useState} from 'react';
// import {Button} from '@/components/ui/button';
// import {Badge} from '@/components/ui/badge';
// import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
// import {BookOpen, Heart, Moon, Settings, Sun, Volume2, Zap,} from 'lucide-react';
// import {useTheme} from 'next-themes';
// import {useQuran} from '@/contexts/QuranContext';
// import {useKeyboardNavigation} from '@/hooks/useKeyboardNavigation';
// import Link from 'next/link';
// import EnhancedSearch from '@/components/navigation/EnhancedSearch';
// import QuickJump from '@/components/navigation/QuickJump';
// import MobileNav from '@/components/navigation/MobileNav';
// import {useReciters, useTranslators} from "@/hooks/useQuranQueries";
// import {AudioType} from "@/types/quran";
//
// export default function Header() {
//   const { data: reciters, isLoading: loadingRecitors } = useReciters();
//   const { data: translators, isLoading: loadingTranslators } = useTranslators();
//
//   const [mounted, setMounted] = useState(false);
//   const [showSearch, setShowSearch] = useState(false);
//   const [showQuickJump, setShowQuickJump] = useState(false);
//   const { theme, setTheme } = useTheme();
//   const { state, dispatch } = useQuran();
//
//   // Initialize keyboard navigation
//   useKeyboardNavigation({
//     onSearchOpen: () => setShowSearch(true),
//     onQuickJumpOpen: () => setShowQuickJump(true)
//   });
//
//   useEffect(() => {
//     setMounted(true);
//   }, []);
//
//
//
//   return (
//     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container relative flex h-16 items-center max-w-7xl mx-auto px-4">
//         {/* Logo - Left Side (slightly offset down and in corner) */}
//         <div className="flex items-end space-x-2 flex-shrink-0 pb-1 pl-2">
//           <BookOpen className="h-5 w-5 text-emerald-600" />
//           <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
//             إقراء
//           </span>
//         </div>
//
//         {/* Search and Quick Jump - Centered within container bounds */}
//         <div className="flex-1 flex justify-center px-4 mx-8">
//           <div className="flex gap-1 md:gap-2 w-full max-w-sm md:max-w-md">
//             {/* Enhanced Search */}
//             <div className="flex-1">
//               <EnhancedSearch
//                 placeholder="Search..."
//                 className="w-full"
//                 onClose={() => setShowSearch(false)}
//               />
//             </div>
//
//             {/* Quick Jump Button - Hidden on very small screens */}
//             <div className="hidden sm:block">
//               <QuickJump
//                 trigger={
//                   <Button variant="outline" size="sm" className="gap-1 md:gap-2">
//                     <Zap className="h-4 w-4" />
//                     <span className="hidden md:inline">Quick</span>
//                   </Button>
//                 }
//               />
//             </div>
//           </div>
//         </div>
//
//         {/* Navigation & Mobile Menu - Right Side */}
//         <div className="flex items-center justify-end flex-shrink-0 ml-auto">
//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-2">
//             {/* Surahs Link */}
//             <Link href="/surahs">
//               <Button variant="ghost" size="sm" className="gap-2">
//                 <BookOpen className="h-4 w-4" />
//                 Surahs
//               </Button>
//             </Link>
//
//             {/* Audio Mode Toggle */}
//             <Button
//               variant={state.audioMode === AudioType.TRANSLATOR ? 'default' : 'ghost'}
//               size="sm"
//               className="gap-2"
//               onClick={() => dispatch({
//                 type: 'SET_AUDIO_MODE',
//                 payload: state.audioMode === AudioType.RECITATION ? AudioType.TRANSLATOR : AudioType.RECITATION
//               })}
//               suppressHydrationWarning
//             >
//               <Volume2 className="h-4 w-4" />
//               {mounted ? (state.audioMode === AudioType.RECITATION ? 'Recitation' : 'Tafsir') : 'Audio'}
//             </Button>
//
//             {/* Conditional Reciter/Tafsir Selection based on Audio Mode */}
//             {state.audioMode === AudioType.RECITATION ? (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="sm" className="gap-2" suppressHydrationWarning>
//                     <span className="text-xs">
//                       {mounted ? (reciters?.find(r => r === state.selectedReciter) || 'Reciter') : 'Reciter'}
//                     </span>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   {reciters?.map((reciter) => (
//                     <DropdownMenuItem
//                       key={reciter}
//                       onClick={() => dispatch({ type: 'SET_RECITER', payload: reciter })}
//                     >
//                       <div className="flex flex-col">
//                         <span className="text-sm text-muted-foreground">{reciter}</span>
//                       </div>
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ) : (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" size="sm" className="gap-2" suppressHydrationWarning>
//                     <span className="text-xs">
//                       {mounted ? (translators?.find(t => t === state.selectedTafsir) || 'Tafsir') : 'Tafsir'}
//                     </span>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   {translators?.map((tafsir) => (
//                     <DropdownMenuItem
//                       key={tafsir}
//                       onClick={() => dispatch({ type: 'SET_TAFSIR', payload: tafsir })}
//                     >
//                       <div className="flex flex-col">
//                         <span className="text-sm text-muted-foreground">{tafsir}</span>
//                       </div>
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             )}
//
//             {/* Favorites */}
//             <Button variant="ghost" size="sm" className="gap-2" suppressHydrationWarning>
//               <Heart className="h-4 w-4" />
//               {mounted && state.favorites.length > 0 && (
//                 <Badge variant="secondary" className="text-xs">
//                   {state.favorites.length}
//                 </Badge>
//               )}
//             </Button>
//
//             {/* Theme Toggle */}
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//               suppressHydrationWarning
//             >
//               {!mounted ? (
//                 <Sun className="h-4 w-4" />
//               ) : theme === 'dark' ? (
//                 <Sun className="h-4 w-4" />
//               ) : (
//                 <Moon className="h-4 w-4" />
//               )}
//             </Button>
//
//             {/* Settings */}
//             <Button variant="ghost" size="sm">
//               <Settings className="h-4 w-4" />
//             </Button>
//           </nav>
//
//           {/* Enhanced Mobile Menu */}
//           <MobileNav />
//         </div>
//       </div>
//     </header>
//   );
// }