'use client';

import {
    BookOpen,
    Layers,
    BookMarked,
    Pin,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Surah } from '@/types/quran';

interface SurahHeaderProps {
    surah: Surah;
    currentPage: number;   // global Quran page
    children?: React.ReactNode;
}

export default function SurahHeader({ surah, currentPage, children }: SurahHeaderProps) {

    const hasPageRange = typeof surah.startingPage === 'number'
        && typeof surah.endingPage === 'number';

    // Global Quran progress (assuming 604 pages Mushaf standard)
    const TOTAL_QURAN_PAGES = 604;

    // Surah progress
    let surahProgress = null;
    if (hasPageRange) {
        const totalSurahPages = surah.endingPage! - surah.startingPage! + 1;
        const currentInSurah = currentPage - surah.startingPage! + 1;

        surahProgress = Math.min(
            100,
            Math.max(0, (currentInSurah / totalSurahPages) * 100)
        );
    }

    return (
        <div className="max-w-4xl mx-auto mb-8">
            <Card>
                <CardContent className="p-4 space-y-4 text-center">

                    {/* Top Meta */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <BookOpen className="h-7 w-7 text-emerald-600" />

                        <Badge variant="outline">
                            Surah {surah.number}
                        </Badge>

                        <Badge variant={surah.revelationType === 'Meccan' ? 'default' : 'secondary'}>
                            {surah.revelationType}
                        </Badge>

                        <Badge variant="outline">
                            {surah.numberOfAyahs} Ayahs
                        </Badge>
                    </div>

                    {/* Names */}
                    <div className="flex flex-col justify-center items-center">
                        <h1 className="text-3xl font-bold">{surah.name}</h1>
                        <h2 className="text-2xl font-semibold text-emerald-600">
                            {surah.englishName}
                        </h2>
                        <p className="text-sm text-muted-foreground italic">
                            {surah.englishNameTranslation}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="flex justify-center items-center gap-4 text-sm">

                        <Badge variant="outline" className="flex items-center gap-2 justify-center sm:justify-start">
                            <Layers className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium">Ayahs:</span>
                            <span>{surah.numberOfAyahs}</span>
                        </Badge>

                        {hasPageRange && (
                            <Badge variant="outline" className="flex items-center gap-2 justify-center sm:justify-start">
                                <BookMarked className="h-4 w-4 text-emerald-600" />
                                <span className="font-medium">Surah Pages:</span>
                                <span>
                                    {surah.startingPage} – {surah.endingPage}
                                </span>
                            </Badge>
                        )}

                        <Badge variant="outline" className="text-xs">
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                            <span>Qur’an Page: {currentPage} / {TOTAL_QURAN_PAGES}</span>
                        </Badge>

                        {/* Surah page */}
                        {hasPageRange && surahProgress !== null && (
                            <Badge variant="secondary" className="text-xs">
                                <Pin className="h-4 w-4 text-emerald-600" />
                                <span>
                                    Surah Page: {currentPage - surah.startingPage! + 1} /
                                    {surah.endingPage! - surah.startingPage! + 1}
                                </span>
                            </Badge>
                        )}
                    </div>

                    {children && (
                        <>
                            <Separator />
                            <div>{children}</div>
                        </>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
