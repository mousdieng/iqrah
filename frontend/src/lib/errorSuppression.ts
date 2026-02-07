// Utility to suppress common development warnings and errors

// Suppress audio preload warnings in development
export const suppressAudioWarnings = () => {
  if (typeof window === 'undefined') return;

  // Override console.warn for specific audio warnings
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');

    // Suppress specific warnings that are not critical
    if (
      message.includes('preload') ||
      message.includes('The resource was preloaded') ||
      message.includes('link preload') ||
      message.includes('not used within a few seconds')
    ) {
      return; // Don't log these warnings
    }

    // Log all other warnings normally
    originalWarn.apply(console, args);
  };
};

// Call this in development to reduce console noise
if (process.env.NODE_ENV === 'development') {
  suppressAudioWarnings();
}