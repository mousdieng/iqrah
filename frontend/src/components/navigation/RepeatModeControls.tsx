'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import {StickyNote, Repeat} from "lucide-react";

interface RepeatModeControlsProps {
    individualRepeatMode: boolean;
    onToggleIndividualRepeat: () => void;
    pageRepeatMode: boolean;
    onTogglePageRepeat: () => void;
}

export default function RepeatModeControls({
                                               individualRepeatMode,
                                               onToggleIndividualRepeat,
                                               pageRepeatMode,
                                               onTogglePageRepeat,
                                           }: RepeatModeControlsProps) {
    return (
        <div className="flex justify-center gap-3 mb-2 flex-wrap">
            <Button
                onClick={onToggleIndividualRepeat}
                variant={individualRepeatMode ? 'default' : 'outline'}
                className="gap-2 bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700"
            >
                <Repeat />
                <span>Repeat Mode</span>
                {individualRepeatMode && <Badge className="ml-2 bg-orange-600 text-white text-xs">ON</Badge>}
            </Button>
            <Button
                onClick={onTogglePageRepeat}
                variant={pageRepeatMode ? 'default' : 'outline'}
                className="gap-2 bg-green-50 border-green-200 hover:bg-green-100 text-green-700"
            >
                <StickyNote />
                <span>Page Repeat</span>
                {pageRepeatMode && <Badge className="ml-2 bg-green-600 text-white">ON</Badge>}
            </Button>
        </div>
    );
}