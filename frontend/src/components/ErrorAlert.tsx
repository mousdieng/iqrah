// components/ui/ErrorAlert.tsx
'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, XCircle, RefreshCw } from 'lucide-react';
import { Errors, ErrorSeverity } from '@/types/quran';
import { getErrorSeverityColor } from '@/lib/errorUtils';

interface ErrorAlertProps {
    error: Errors | null;
    onDismiss?: () => void;
    onRetry?: () => void;
    className?: string;
    showTitle?: boolean;
    showDismiss?: boolean;
}

export default function ErrorAlert({
                                       error,
                                       onDismiss,
                                       onRetry,
                                       className = '',
                                       showTitle = true,
                                       showDismiss = true,
                                   }: ErrorAlertProps) {
    if (!error) return null;

    const getIcon = () => {
        switch (error.severity) {
            case ErrorSeverity.INFO:
                return <Info className="h-4 w-4" />;
            case ErrorSeverity.WARNING:
                return <AlertTriangle className="h-4 w-4" />;
            case ErrorSeverity.ERROR:
                return <AlertCircle className="h-4 w-4" />;
            case ErrorSeverity.CRITICAL:
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getVariant = (): 'default' | 'destructive' => {
        if (error.severity === ErrorSeverity.ERROR || error.severity === ErrorSeverity.CRITICAL) {
            return 'destructive';
        }
        return 'default';
    };

    return (
        <Alert
            variant={getVariant()}
            className={`max-w-2xl mx-auto ${className}`}
        >
            {getIcon()}
            <div className="flex-1">
                {showTitle && error.title && (
                    <AlertTitle>{error.title}</AlertTitle>
                )}
                <AlertDescription>
                    {error.message}
                    {error.context?.details && (
                        <div className="mt-2 text-xs opacity-80">
                            {error.context.details}
                        </div>
                    )}
                </AlertDescription>
            </div>
            <div className="flex gap-2 ml-auto">
                {error.retryable && onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="gap-1"
                    >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                    </Button>
                )}
                {showDismiss && onDismiss && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDismiss}
                    >
                        Dismiss
                    </Button>
                )}
            </div>
        </Alert>
    );
}