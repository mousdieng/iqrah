'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PageNavigationProps {
    currentPage: number;
    startPage: number;
    endPage: number;
    onPageChange: (page: number) => void;
}

export default function PageNavigation({
                                           currentPage,
                                           startPage,
                                           endPage,
                                           onPageChange,
                                       }: PageNavigationProps) {
    return (
        <>
            <div className="flex flex-col items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= startPage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage >= endPage}
                        >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="w-24" /> {/* Spacer for layout balance */}
            </div>

            {/* Bottom Navigation */}
            <div className="flex justify-center items-center gap-4 mt-2">
                <Button
                    variant="outline"
                    onClick={() => onPageChange(startPage)}
                    disabled={currentPage <= startPage}
                >
                    First Page
                </Button>

                <div className="flex items-center gap-2">
                    <span className="text-sm">Jump to page:</span>
                    <input
                        type="number"
                        min={startPage}
                        max={endPage}
                        value={currentPage}
                        onChange={(e) => {
                            const page = parseInt(e.target.value);
                            if (page >= startPage && page <= endPage) {
                                onPageChange(page);
                            }
                        }}
                        className="w-20 px-2 py-1 border rounded text-center"
                        placeholder={`${startPage}-${endPage}`}
                    />
                </div>

                <Button
                    variant="outline"
                    onClick={() => onPageChange(endPage)}
                    disabled={currentPage >= endPage}
                >
                    Last Page
                </Button>
            </div>
        </>
    );
}