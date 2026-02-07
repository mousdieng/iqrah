// hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';
import { Errors, ErrorSeverity } from '@/types/quran';
import { createError as createErrorUtil } from '@/lib/errorUtils';

export function useErrorHandler() {
    const [error, setError] = useState<Errors | null>(null);

    const createError = useCallback((
        message: string,
        title: string,
        severity: ErrorSeverity = ErrorSeverity.ERROR
    ): Errors => {
        const err = createErrorUtil( message, title, severity);
        setError(err);
        return err;
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const hasError = useCallback(() => {
        return error !== null;
    }, [error]);

    return {
        error,
        setError,
        createError,
        clearError,
        hasError,
    };
}