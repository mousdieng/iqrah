'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  BookOpen,
  Menu,
  Home,
  Heart,
  Settings,
  Volume2,
  Languages,
  Search,
  Clock,
  Star,
  ChevronRight,
  Hash,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { useQuran } from '@/contexts/QuranContext';
import {useReciters, useTranslators} from "@/hooks/useQuranQueries";

interface MobileNavProps {
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: any;
  description: string;
  action?: string;
  badge?: string;
  number?: number;
}

const NAVIGATION_SECTIONS: { title: string; items: NavigationItem[] }[] = [
  {
    title: 'Main',
    items: [
      { label: 'Home', href: '/', icon: Home, description: 'Dashboard and daily verse' },
      { label: 'All Surahs', href: '/surahs', icon: BookOpen, description: '114 chapters of the Quran' },
      { label: 'Mushaf Pages', href: '/mushaf', icon: BookOpen, description: 'Traditional page-by-page view' },
    ]
  },
  {
    title: 'Quick Access',
    items: [
      { label: 'Search', href: '#', icon: Search, description: 'Find verses and surahs', action: 'search' },
      { label: 'Favorites', href: '#', icon: Heart, description: 'Your saved verses', badge: 'favorites' },
      { label: 'Recent', href: '#', icon: Clock, description: 'Recently viewed surahs' },
    ]
  },
  {
    title: 'Popular Surahs',
    items: [
      { label: 'Al-Fatihah', href: '/surah/1', icon: Star, description: 'The Opening', number: 1 },
      { label: 'Al-Baqarah', href: '/surah/2', icon: BookOpen, description: 'The Cow', number: 2 },
      { label: 'Al-Kahf', href: '/surah/18', icon: BookOpen, description: 'The Cave', number: 18 },
      { label: 'Yasin', href: '/surah/36', icon: BookOpen, description: 'Ya Sin', number: 36 },
      { label: 'Ar-Rahman', href: '/surah/55', icon: BookOpen, description: 'The Beneficent', number: 55 },
      { label: 'Al-Mulk', href: '/surah/67', icon: BookOpen, description: 'The Sovereignty', number: 67 },
    ]
  },
  {
    title: 'Tools & Settings',
    items: [
      { label: 'Audio Settings', href: '#', icon: Volume2, description: 'Change reciter and audio options', action: 'audio' },
      { label: 'Translation', href: '#', icon: Languages, description: 'Select translation language', action: 'translation' },
      { label: 'Settings', href: '#', icon: Settings, description: 'App preferences' },
    ]
  }
];

export default function MobileNav({ className = "" }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { data: reciters, isLoading: loadingRecitors } = useReciters();
  const { data: translators, isLoading: loadingTranslators } = useTranslators();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { state, dispatch } = useQuran();

  const handleItemClick = (item: any) => {
    if (item.action) {
      setActiveSection(item.action);
      return;
    }

    if (item.href && item.href !== '#') {
      setOpen(false);
    }
  };

  const renderMainMenu = () => (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* App Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <BookOpen className="h-6 w-6 text-emerald-600 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              إقراء
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Quran Reading & Memorization
          </p>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted rounded-lg text-center">
            <Heart className="h-4 w-4 text-red-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{state.favorites.length}</div>
            <div className="text-xs text-muted-foreground">Favorites</div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-medium">{state.memorized.length}</div>
            <div className="text-xs text-muted-foreground">Memorized</div>
          </div>
        </div>

        {/* Navigation Sections */}
        {NAVIGATION_SECTIONS.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                let badgeValue = '';

                if (item.badge === 'favorites') {
                  badgeValue = state.favorites.length.toString();
                }

                return (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    onClick={() => handleItemClick(item)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.number && (
                          <Badge variant="outline" className="text-xs">
                            {item.number}
                          </Badge>
                        )}
                        {badgeValue && (
                          <Badge variant="secondary" className="text-xs">
                            {badgeValue}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Numbers */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Quick Jump
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 18, 36, 55, 67, 78, 112, 114].map((num) => (
              <Link
                key={num}
                href={`/surah/${num}`}
                onClick={() => setOpen(false)}
                className="p-2 text-center bg-muted rounded hover:bg-muted/80 transition-colors"
              >
                <Hash className="h-3 w-3 mx-auto mb-1" />
                <span className="text-xs font-medium">{num}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  const renderAudioSettings = () => (
    <div className="p-4 space-y-4">
      <Button
        variant="ghost"
        onClick={() => setActiveSection(null)}
        className="mb-4"
      >
        ← Back
      </Button>

      <h3 className="font-semibold mb-4">Select Reciter</h3>
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {reciters?.map((reciter) => (
            <button
              key={reciter}
              onClick={() => {
                dispatch({ type: 'SET_RECITER', payload: reciter });
                setActiveSection(null);
              }}
              className={`w-full p-3 text-left rounded-lg transition-colors ${
                state.selectedReciter === reciter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <div className="text-sm opacity-70">{reciter}</div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'audio':
        return renderAudioSettings();
      case 'search':
        // This would trigger the search dialog
        setOpen(false);
        return null;
      default:
        return renderMainMenu();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className={`md:hidden ${className}`}>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        {renderContent()}
      </SheetContent>
    </Sheet>
  );
}