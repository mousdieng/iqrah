// Utility functions for audio handling with error recovery

export const createAudioElement = (src: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();

    // Set up event listeners before setting src
    audio.addEventListener('loadeddata', () => {
      console.log(`Audio loaded successfully: ${src}`);
      resolve(audio);
    });

    audio.addEventListener('error', (e) => {
      console.warn(`Audio failed to load: ${src}`, e);
      reject(new Error(`Failed to load audio: ${src}`));
    });

    // Set audio properties for better compatibility
    audio.preload = 'none'; // Don't preload to avoid console warnings
    audio.crossOrigin = 'anonymous';

    // Set source last
    audio.src = src;
  });
};

export const playAudioSafely = async (audio: HTMLAudioElement): Promise<void> => {
  try {
    // Check if audio is ready
    if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
      await audio.play();
    } else {
      // Wait for audio to be ready
      return new Promise((resolve, reject) => {
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          audio.play().then(resolve).catch(reject);
        };

        const onError = (e: Event) => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          reject(new Error('Audio playback failed'));
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);
      });
    }
  } catch (error) {
    console.warn('Audio playback failed:', error);
    throw error;
  }
};

export const getWorkingAudioUrl = async (urls: string[]): Promise<string | null> => {
  for (const url of urls) {
    try {
      // Test if URL is accessible
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      if (response.ok || response.type === 'opaque') {
        return url;
      }
    } catch (error) {
      console.warn(`Audio URL not accessible: ${url}`);
    }
  }
  return null;
};

// Get backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Generate backend audio URL for a verse
// export const generateBackendAudioUrl = (reciterId: string, surahNumber: number, ayaNumber: number): string => {
//   return `${API_BASE_URL}/api/audio/${reciterId}/${surahNumber}/${ayaNumber}`;
// };

// Generate audio URLs with fallback to other reciters
// export const generateAudioUrl = (reciterId: string, surahNumber: number, ayaNumber: number): string[] => {
//   // Primary: use backend audio
//   const primaryUrl = generateBackendAudioUrl(reciterId, surahNumber, ayaNumber);
//
//   // Fallback: try other backend reciters
//   const fallbackReciters = ['maher_al_muaiqly', 'husary', 'minshawi', 'sudais'].filter(r => r !== reciterId);
//   const fallbackUrls = fallbackReciters.map(r => generateBackendAudioUrl(r, surahNumber, ayaNumber));
//
//   return [primaryUrl, ...fallbackUrls];
// };

// export const handleAudioError = (error: any, context: string) => {
//   console.warn(`Audio error in ${context}:`, error);
//
//   // Don't throw errors for audio failures - just log them
//   // This prevents the app from breaking when audio is unavailable
//   if (error?.name === 'NotSupportedError') {
//     console.warn('Audio format not supported by browser');
//   } else if (error?.name === 'NotAllowedError') {
//     console.warn('Audio playback not allowed (user interaction required)');
//   } else if (error?.name === 'AbortError') {
//     console.warn('Audio playback aborted');
//   } else {
//     console.warn('Unknown audio error:', error);
//   }
// };