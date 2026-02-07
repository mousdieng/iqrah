// components/ui/InlineErrorAlert.tsx (Compact version)
'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { Errors } from '@/types/quran';

interface InlineErrorAlertProps {
    error: Errors | null;
    onDismiss?: () => void;
    onRetry?: () => void;
    className?: string;
}

export default function InlineErrorAlert({
                                             error,
                                             onDismiss,
                                             onRetry,
                                             className = '',
                                         }: InlineErrorAlertProps) {
    if (!error) return null;

    return (
        <Alert variant="destructive" className={`${className}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between gap-2 flex-1">
                <span>{error.message}</span>
                <div className="flex gap-1">
                    {error.retryable && onRetry && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onRetry}
                        >
                            <RefreshCw className="h-3 w-3" />
                        </Button>
                    )}
                    {onDismiss && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={onDismiss}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </AlertDescription>
        </Alert>
    );
}