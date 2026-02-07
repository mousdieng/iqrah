'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Heart,
  Play,
  Pause,
  BookmarkPlus,
  MoreVertical,
  Copy,
  Share,
} from 'lucide-react';
import { Ayah } from '@/types/quran';
import { useQuran } from '@/contexts/QuranContext';

interface AyaCardProps {
  ayah: Ayah;
  showSurahInfo?: boolean;
  onPlay?: () => void;
  isPlaying?: boolean;
}

export default function AyaCard({
  ayah,
  showSurahInfo = true,
  onPlay,
  isPlaying = false
}: AyaCardProps) {
  const { state, dispatch } = useQuran();
  const [isMemorized, setIsMemorized] = useState(false);
  const isFavorite = state.favorites.includes(ayah.id);

  // const selectedTranslation = ayah.translations.find(
  //   t => t.translatorName === state.selectedTranslation
  // );

  const handleToggleFavorite = () => {
    if (isFavorite) {
      dispatch({ type: 'REMOVE_FAVORITE', payload: ayah.id });
    } else {
      dispatch({ type: 'ADD_FAVORITE', payload: ayah.id });
    }
  };

  const handleToggleMemorized = () => {
    setIsMemorized(!isMemorized);
    if (isMemorized) {
      dispatch({ type: 'REMOVE_MEMORIZED', payload: ayah.id });
    } else {
      dispatch({ type: 'ADD_MEMORIZED', payload: ayah.id });
    }
  };

  const handleCopyText = () => {
    const textToCopy = `${ayah.text}\n || ''}`;
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {showSurahInfo && (
              <Badge variant="outline" className="text-xs">
                Surah {ayah.surah?.number}:{ayah.id}
              </Badge>
            )}
            {isMemorized && (
              <Badge variant="secondary" className="text-xs">
                Memorized
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-1">
            {/* Play Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onPlay}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            {/* Favorite Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleMemorized}>
                  <BookmarkPlus className="mr-2 h-4 w-4" />
                  {isMemorized ? 'Remove from Memorized' : 'Mark as Memorized'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyText}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Text
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Arabic Text */}
        <div className="mb-6">
          <p
            className="text-right leading-relaxed font-arabic text-2xl md:text-3xl"
            style={{ fontSize: `${state.fontSize}px` }}
            dir="rtl"
          >
            {ayah.text}
          </p>
        </div>

        {/* Translation */}
        {/*{selectedTranslation && state.showTranslations && (*/}
        {/*  <div className="border-t pt-4">*/}
        {/*    <p className="text-muted-foreground text-sm mb-2">*/}
        {/*      Translation by {selectedTranslation.translatorName}*/}
        {/*    </p>*/}
        {/*    <p className="leading-relaxed">*/}
        {/*      {selectedTranslation.text}*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*)}*/}
      </CardContent>
    </Card>
  );
}