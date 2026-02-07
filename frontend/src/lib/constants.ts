//
// export const TAFSIR = [
//   {
//     id: "hady",
//     name: "Hady Niass",
//     arabicName: "ماهر المعيقلي"
//   }
// ];
//
// export const RECITERS = [
//   {
//     id: "maher_al_muaiqly",
//     name: "Maher Al Muaiqly",
//     arabicName: "ماهر المعيقلي"
//   },
//   {
//     id: "husary",
//     name: "Mahmoud Khalil Al-Husary",
//     arabicName: "محمود خليل الحصري"
//   },
//   {
//     id: "minshawi",
//     name: "Mohamed Siddiq El-Minshawi",
//     arabicName: "محمد صديق المنشاوي"
//   },
//   {
//     id: "sudais",
//     name: "Abdurrahman As-Sudais",
//     arabicName: "عبد الرحمن السديس"
//   }
// ];
//
// export const TRANSLATORS = {
//   english: [
//     { id: "Sahih International", name: "Sahih International" },
//     { id: "Pickthall", name: "Pickthall" },
//   ],
//   french: [
//     { id: "Muhammad Hamidullah", name: "Muhammad Hamidullah" },
//   ],
// };
//
// // Get backend API base URL
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
//
// // Generate backend audio URL for individual verse
// export const getAyahReciterAudioUrl = (reciterId: string, surahNumber: number, ayahNumber: number): string => {
//   // Validate reciter exists
//   const reciter = RECITERS.find(r => r.id === reciterId);
//   if (!reciter) {
//     console.warn(`Reciter ${reciterId} not found, using default`);
//     return `${API_BASE_URL}/api/audio/reciter/husary/${surahNumber}/${ayahNumber}`;
//   }
//
//   return `${API_BASE_URL}/api/audio/reciter/${reciterId}/${surahNumber}/${ayahNumber}`;
// };
//
// export const getAyahTafsirAudioUrl = (tafsirId: string, surahNumber: number, ayahNumber: number): string => {
//   // Validate reciter exists
//   const reciter = TAFSIR.find(r => r.id === tafsirId);
//   if (!reciter) {
//     console.warn(`Reciter ${tafsirId} not found, using default`);
//     return `${API_BASE_URL}/api/audio/tafsir/hady/${surahNumber}/${ayahNumber}`;
//   }
//
//   return `${API_BASE_URL}/api/audio/tafsir/${tafsirId}/${surahNumber}/${ayahNumber}`;
// };
//
// // Utility function to generate QuranicAudio.com URLs (full surah - not used for verse-by-verse)
// export const getQuranicAudioUrl = (reciterId: string, surahNumber: number): string => {
//   // For full surah audio, we could still use external sources
//   // Or build a concatenated version from backend
//   const formattedSurahNumber = surahNumber.toString().padStart(3, '0');
//   return `https://download.quranicaudio.com/quran/${reciterId}/${formattedSurahNumber}.mp3`;
// };
//
// // Backend audio URL (primary method - uses local backend files)
// export const getEveryAyahUrl = (reciterId: string, surahNumber: number, ayahNumber: number): string => {
//   return getAyahReciterAudioUrl(reciterId, surahNumber, ayahNumber);
// };
//
// export const getEveryAyahUrlTafsir = (tafsirId: string, surahNumber: number, ayahNumber: number): string => {
//   return getAyahTafsirAudioUrl(tafsirId, surahNumber, ayahNumber);
// };