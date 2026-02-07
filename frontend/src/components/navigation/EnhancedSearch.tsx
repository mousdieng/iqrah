'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Hash, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'surah' | 'verse' | 'page' | 'recent';
  title: string;
  subtitle?: string;
  arabicText?: string;
  href: string;
  surahNumber?: number;
  verseNumber?: number;
  pageNumber?: number;
  relevance?: number;
}

interface EnhancedSearchProps {
  onClose?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  showRecentSearches?: boolean;
}

// Mock data - in a real app, this would come from your API
const MOCK_SEARCH_DATA: SearchResult[] = [
  {
    id: '1-1',
    type: 'verse',
    title: 'Al-Fatihah 1:1',
    subtitle: 'In the name of Allah, the Gracious, the Merciful',
    arabicText: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ',
    href: '/surah/1#verse-1',
    surahNumber: 1,
    verseNumber: 1
  },
  {
    id: '2-255',
    type: 'verse',
    title: 'Al-Baqarah 2:255',
    subtitle: 'Ayat al-Kursi - Allah - there is no deity except Him',
    arabicText: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ',
    href: '/surah/2#verse-255',
    surahNumber: 2,
    verseNumber: 255
  },
  {
    id: 'surah-1',
    type: 'surah',
    title: 'Al-Fatihah',
    subtitle: 'The Opening - 7 verses',
    arabicText: 'الفاتحة',
    href: '/surah/1',
    surahNumber: 1
  },
  {
    id: 'surah-18',
    type: 'surah',
    title: 'Al-Kahf',
    subtitle: 'The Cave - 110 verses',
    arabicText: 'الكهف',
    href: '/surah/18',
    surahNumber: 18
  }
];

const RECENT_SEARCHES = [
  'Allah',
  'paradise',
  'prayer',
  'mercy',
  'forgiveness'
];

export default function EnhancedSearch({
  onClose,
  placeholder = "Search Quran...",
  className = "",
  autoFocus = false,
  showRecentSearches = true
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(RECENT_SEARCHES);
  const [showResults, setShowResults] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Simulate search API call
  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Simple filtering for demo
    const filtered = MOCK_SEARCH_DATA.filter(item => {
      const queryLower = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(queryLower) ||
        item.subtitle?.toLowerCase().includes(queryLower) ||
        item.arabicText?.includes(searchQuery) ||
        (item.surahNumber && item.surahNumber.toString().includes(queryLower)) ||
        (item.verseNumber && item.verseNumber.toString().includes(queryLower))
      );
    });

    // Add relevance scoring (simple example)
    const scored = filtered.map(item => ({
      ...item,
      relevance: item.title.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0.5
    }));

    // Sort by relevance
    scored.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    setResults(scored);
    setIsLoading(false);
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Show/hide results
  useEffect(() => {
    setShowResults(hasFocus && (query.length > 0 || showRecentSearches));
  }, [query, showRecentSearches, hasFocus]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults) return;

      const totalItems = query.length > 0 ? results.length : recentSearches.length;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          handleSelection();
          break;
        case 'Escape':
          e.preventDefault();
          clearSearch();
          onClose?.();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showResults, results, recentSearches, selectedIndex, query]);

  const handleSelection = () => {
    if (query.length > 0 && results.length > 0) {
      const selectedResult = results[selectedIndex];
      if (selectedResult) {
        addToRecentSearches(query);
        router.push(selectedResult.href);
        onClose?.();
      }
    } else if (showRecentSearches && recentSearches.length > 0) {
      const selectedSearch = recentSearches[selectedIndex];
      setQuery(selectedSearch);
      inputRef.current?.focus();
    }
  };

  const addToRecentSearches = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (trimmed && !recentSearches.includes(trimmed)) {
      setRecentSearches(prev => [trimmed, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    inputRef.current?.focus();
  };

  const removeRecentSearch = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(term => term !== searchTerm));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setHasFocus(true)}
          onBlur={() => {
            // Delay hiding to allow for clicks on results
            setTimeout(() => setHasFocus(false), 200);
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                <div className="animate-pulse">Searching...</div>
              </div>
            ) : query.length > 0 ? (
              // Search Results
              <div className="max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-xs mt-1">Try searching for surah names, verse numbers, or Arabic text</p>
                  </div>
                ) : (
                  results.map((result, index) => {
                    const isSelected = index === selectedIndex;
                    const Icon = result.type === 'surah' ? BookOpen : Hash;

                    return (
                      <Link
                        key={result.id}
                        href={result.href}
                        onClick={() => {
                          addToRecentSearches(query);
                          onClose?.();
                        }}
                        className={`block p-4 border-b last:border-b-0 transition-colors ${
                          isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{result.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {result.type}
                              </Badge>
                            </div>
                            {result.subtitle && (
                              <p className="text-sm text-muted-foreground truncate mb-1">
                                {result.subtitle}
                              </p>
                            )}
                            {result.arabicText && (
                              <p className="text-sm text-right" dir="rtl">
                                {result.arabicText}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            ) : showRecentSearches && recentSearches.length > 0 ? (
              // Recent Searches
              <div className="p-2">
                <div className="text-xs text-muted-foreground px-2 py-1 mb-2">
                  Recent searches
                </div>
                {recentSearches.map((searchTerm, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={searchTerm}
                      onClick={() => handleRecentSearchClick(searchTerm)}
                      className={`w-full flex items-center justify-between p-2 rounded transition-colors ${
                        isSelected ? 'bg-muted' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{searchTerm}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => removeRecentSearch(searchTerm, e)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Footer */}
            {showResults && (
              <div className="border-t p-2 bg-muted/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">↑↓</kbd>
                      <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">Enter</kbd>
                      <span>Select</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-background rounded text-xs">Esc</kbd>
                      <span>Close</span>
                    </div>
                  </div>
                  {query && (
                    <div className="text-xs">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}