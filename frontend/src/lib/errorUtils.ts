// lib/errorUtils.ts
import { ErrorSeverity, Errors } from '@/types/quran';

export function createError(
    message: string,
    title: string,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
): Errors {
    return {
        severity,
        message,
        title,
        isError: severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL
    };
}

export function getErrorSeverityColor(severity: ErrorSeverity): string {
    switch (severity) {
        case ErrorSeverity.INFO:
            return 'info';
        case ErrorSeverity.WARNING:
            return 'warning';
        case ErrorSeverity.ERROR:
            return 'destructive';
        case ErrorSeverity.CRITICAL:
            return 'destructive';
        default:
            return 'default';
    }
}