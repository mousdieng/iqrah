'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, BookOpen, Hash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuickJumpProps {
  trigger?: React.ReactNode;
  shortcut?: string;
}

const QUICK_ACTIONS = [
  { label: 'All Surahs', href: '/surahs', icon: BookOpen, category: 'Pages' },
  { label: 'Mushaf Pages', href: '/mushaf', icon: BookOpen, category: 'Pages' },
  { label: 'Home', href: '/', icon: BookOpen, category: 'Pages' },
];

const POPULAR_SURAHS = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة" },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف" },
  { number: 36, name: "Yasin", arabicName: "يس" },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن" },
  { number: 67, name: "Al-Mulk", arabicName: "الملك" },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص" },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق" },
  { number: 114, name: "An-Nas", arabicName: "الناس" },
];

export default function QuickJump({ trigger, shortcut = "Ctrl+K" }: QuickJumpProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Filter results based on search
  const filteredActions = QUICK_ACTIONS.filter(action =>
    action.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSurahs = POPULAR_SURAHS.filter(surah =>
    surah.name.toLowerCase().includes(search.toLowerCase()) ||
    surah.arabicName.includes(search) ||
    surah.number.toString().includes(search)
  );

  // Parse search for specific patterns
  const parseSearch = (query: string) => {
    const trimmed = query.trim();

    // Check if it's a surah number (1-114)
    const surahNumber = parseInt(trimmed);
    if (!isNaN(surahNumber) && surahNumber >= 1 && surahNumber <= 114) {
      return { type: 'surah', value: surahNumber };
    }

    // Check if it's a verse reference (e.g., "2:255", "18:10")
    const verseMatch = trimmed.match(/^(\d+):(\d+)$/);
    if (verseMatch) {
      const surah = parseInt(verseMatch[1]);
      const verse = parseInt(verseMatch[2]);
      if (surah >= 1 && surah <= 114 && verse >= 1) {
        return { type: 'verse', surah, verse };
      }
    }

    // Check if it's a page number
    const pageMatch = trimmed.match(/^p(?:age)?\s*(\d+)$/i);
    if (pageMatch) {
      const page = parseInt(pageMatch[1]);
      if (page >= 1 && page <= 604) {
        return { type: 'page', value: page };
      }
    }

    return null;
  };

  const allResults: any[] = [
    ...filteredActions.map(action => ({ ...action, type: 'action' as const })),
    ...filteredSurahs.map(surah => ({ ...surah, type: 'surah' as const, href: `/surah/${surah.number}`, label: surah.name }))
  ];

  const parsed = parseSearch(search);
  if (parsed) {
    if (parsed.type === 'surah') {
      allResults.unshift({
        type: 'action' as const,
        label: `Go to Surah ${parsed.value}`,
        href: `/surah/${parsed.value}`,
        icon: Hash,
        category: 'Quick Jump'
      });
    } else if (parsed.type === 'verse') {
      allResults.unshift({
        type: 'action' as const,
        label: `Go to Surah ${parsed.surah}, Verse ${parsed.verse}`,
        href: `/surah/${parsed.surah}#verse-${parsed.verse}`,
        icon: Hash,
        category: 'Quick Jump'
      });
    } else if (parsed.type === 'page') {
      allResults.unshift({
        type: 'action' as const,
        label: `Go to Mushaf Page ${parsed.value}`,
        href: `/mushaf?page=${parsed.value}`,
        icon: Hash,
        category: 'Quick Jump'
      });
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % allResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
          }
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, allResults]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSelect = (item: any) => {
    if (item.href) {
      router.push(item.href);
      setOpen(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2 text-muted-foreground">
      <Search className="h-4 w-4" />
      Quick Jump...
      <Badge variant="secondary" className="text-xs font-mono">
        {shortcut}
      </Badge>
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quick Jump</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search or type: surah number, verse (2:255), or page (p123)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Help Text */}
          {!search && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Try these quick formats:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><code>18</code> - Go to Surah 18</li>
                <li><code>2:255</code> - Go to Surah 2, Verse 255</li>
                <li><code>p123</code> - Go to Mushaf Page 123</li>
              </ul>
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {allResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No results found</p>
              </div>
            ) : (
              allResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon || BookOpen;

                return (
                  <button
                    key={`${item.type}-${index}`}
                    onClick={() => handleSelect(item)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.label || item.name}</div>
                      {item.type === 'surah' && item.arabicName && (
                        <div className={`text-sm ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {item.arabicName}
                        </div>
                      )}
                      {item.category && (
                        <div className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {item.category}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-3 w-3 flex-shrink-0 opacity-50" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
                <span>Close</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}