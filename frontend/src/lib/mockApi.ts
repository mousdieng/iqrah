// import { AyaWithTranslationsAndAudio } from '@/types/quran';
//
// // Mock Quran data for development/fallback when backend is unavailable
// export const MOCK_QURAN_DATA: Record<number, AyaWithTranslationsAndAudio[]> = {
//   1: [ // Al-Fatihah
//     {
//       id: 1,
//       surahNumber: 1,
//       ayaNumber: 1,
//       arabicText: "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
//       translations: [{
//         id: 1,
//         ayaId: 1,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "In the name of Allah—the Most Compassionate, Most Merciful."
//       }],
//       audios: [{
//         id: 1,
//         ayaId: 1,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/1",
//         localPath: "audio/maher_al_muaiqly/001/001.mp3"
//       }]
//     },
//     {
//       id: 2,
//       surahNumber: 1,
//       ayaNumber: 2,
//       arabicText: "ٱلۡحَمۡدُ لِلَّهِ رَبِّ ٱلۡعَٰلَمِينَ",
//       translations: [{
//         id: 2,
//         ayaId: 2,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "All praise is for Allah—Lord of all worlds,"
//       }],
//       audios: [{
//         id: 2,
//         ayaId: 2,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/2",
//         localPath: "audio/maher_al_muaiqly/001/002.mp3"
//       }]
//     },
//     {
//       id: 3,
//       surahNumber: 1,
//       ayaNumber: 3,
//       arabicText: "ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ",
//       translations: [{
//         id: 3,
//         ayaId: 3,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "the Most Compassionate, Most Merciful,"
//       }],
//       audios: [{
//         id: 3,
//         ayaId: 3,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/3",
//         localPath: "audio/maher_al_muaiqly/001/003.mp3"
//       }]
//     },
//     {
//       id: 4,
//       surahNumber: 1,
//       ayaNumber: 4,
//       arabicText: "مَٰلِكِ يَوۡمِ ٱلدِّينِ",
//       translations: [{
//         id: 4,
//         ayaId: 4,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "Master of the Day of Judgment."
//       }],
//       audios: [{
//         id: 4,
//         ayaId: 4,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/4",
//         localPath: "audio/maher_al_muaiqly/001/004.mp3"
//       }]
//     },
//     {
//       id: 5,
//       surahNumber: 1,
//       ayaNumber: 5,
//       arabicText: "إِيَّاكَ نَعۡبُدُ وَإِيَّاكَ نَسۡتَعِينُ",
//       translations: [{
//         id: 5,
//         ayaId: 5,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "You ˹alone˺ we worship and You ˹alone˺ we ask for help."
//       }],
//       audios: [{
//         id: 5,
//         ayaId: 5,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/5",
//         localPath: ""
//       }]
//     },
//     {
//       id: 6,
//       surahNumber: 1,
//       ayaNumber: 6,
//       arabicText: "ٱهۡدِنَا ٱلصِّرَٰطَ ٱلۡمُسۡتَقِيمَ",
//       translations: [{
//         id: 6,
//         ayaId: 6,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "Guide us along the Straight Path,"
//       }],
//       audios: [{
//         id: 6,
//         ayaId: 6,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/6",
//         localPath: ""
//       }]
//     },
//     {
//       id: 7,
//       surahNumber: 1,
//       ayaNumber: 7,
//       arabicText: "صِرَٰطَ ٱلَّذِينَ أَنۡعَمۡتَ عَلَيۡهِمۡ غَيۡرِ ٱلۡمَغۡضُوبِ عَلَيۡهِمۡ وَلَا ٱلضَّآلِّينَ",
//       translations: [{
//         id: 7,
//         ayaId: 7,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "the Path of those You have blessed—not those You are displeased with, or those who are astray."
//       }],
//       audios: [{
//         id: 7,
//         ayaId: 7,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/1/7",
//         localPath: ""
//       }]
//     }
//   ],
//   2: [ // First few verses of Al-Baqarah
//     {
//       id: 8,
//       surahNumber: 2,
//       ayaNumber: 1,
//       arabicText: "الم",
//       translations: [{
//         id: 8,
//         ayaId: 8,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "Alif-Lam-Mim."
//       }],
//       audios: [{
//         id: 8,
//         ayaId: 8,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/2/1",
//         localPath: ""
//       }]
//     },
//     {
//       id: 9,
//       surahNumber: 2,
//       ayaNumber: 2,
//       arabicText: "ذَٰلِكَ ٱلۡكِتَٰبُ لَا رَيۡبَ ۛ فِيهِ ۛ هُدٗى لِّلۡمُتَّقِينَ",
//       translations: [{
//         id: 9,
//         ayaId: 9,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "This is the Book! There is no doubt about it—a guide for those mindful ˹of Allah˺,"
//       }],
//       audios: [{
//         id: 9,
//         ayaId: 9,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/2/2",
//         localPath: ""
//       }]
//     },
//     {
//       id: 10,
//       surahNumber: 2,
//       ayaNumber: 3,
//       arabicText: "ٱلَّذِينَ يُؤۡمِنُونَ بِٱلۡغَيۡبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقۡنَٰهُمۡ يُنفِقُونَ",
//       translations: [{
//         id: 10,
//         ayaId: 10,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "who believe in the unseen, establish prayer, and donate from what We have provided for them,"
//       }],
//       audios: [{
//         id: 10,
//         ayaId: 10,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/2/3",
//         localPath: ""
//       }]
//     },
//     {
//       id: 11,
//       surahNumber: 2,
//       ayaNumber: 4,
//       arabicText: "وَٱلَّذِينَ يُؤۡمِنُونَ بِمَآ أُنزِلَ إِلَيۡكَ وَمَآ أُنزِلَ مِن قَبۡلِكَ وَبِٱلۡأَٰخِرَةِ هُمۡ يُوقِنُونَ",
//       translations: [{
//         id: 11,
//         ayaId: 11,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "and who believe in what has been revealed to you ˹O Prophet˺ and what was revealed before you, and have sure faith in the Hereafter."
//       }],
//       audios: [{
//         id: 11,
//         ayaId: 11,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/2/4",
//         localPath: ""
//       }]
//     },
//     {
//       id: 12,
//       surahNumber: 2,
//       ayaNumber: 5,
//       arabicText: "أُوۡلَٰٓئِكَ عَلَىٰ هُدٗى مِّن رَّبِّهِمۡ ۖ وَأُوۡلَٰٓئِكَ هُمُ ٱلۡمُفۡلِحُونَ",
//       translations: [{
//         id: 12,
//         ayaId: 12,
//         language: "en",
//         translatorName: "Dr. Mustafa Khattab",
//         text: "It is they who are ˹truly˺ guided by their Lord, and it is they who will be successful."
//       }],
//       audios: [{
//         id: 12,
//         ayaId: 12,
//         reciterName: "Maher Al Muaiqly",
//         url: "http://localhost:8080/api/audio/maher_al_muaiqly/2/5",
//         localPath: ""
//       }]
//     }
//   ]
// };
//
// // Beautiful verses for random display
// export const INSPIRATIONAL_VERSES: AyaWithTranslationsAndAudio[] = [
//   {
//     id: 255,
//     surahNumber: 2,
//     ayaNumber: 255,
//     arabicText: "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُ ۚ لَا تَأۡخُذُهُۥ سِنَةٞ وَلَا نَوۡمٞ",
//     translations: [{
//       id: 255,
//       ayaId: 255,
//       language: "en",
//       translatorName: "Dr. Mustafa Khattab",
//       text: "Allah—there is no god ˹worthy of worship˺ except Him, the Ever-Living, All-Sustaining. Neither drowsiness nor sleep overtakes Him."
//     }],
//     audios: [{
//       id: 255,
//       ayaId: 255,
//       reciterName: "Maher Al Muaiqly",
//       url: "http://localhost:8080/api/audio/maher_al_muaiqly/2/255",
//       localPath: ""
//     }]
//   },
//   {
//     id: 1001,
//     surahNumber: 55,
//     ayaNumber: 13,
//     arabicText: "فَبِأَيِّ ءَالَآءِ رَبِّكُمَا تُكَذِّبَانِ",
//     translations: [{
//       id: 1001,
//       ayaId: 1001,
//       language: "en",
//       translatorName: "Dr. Mustafa Khattab",
//       text: "Then which of your Lord's favours will you ˹humans and jinn˺ both deny?"
//     }],
//     audios: [{
//       id: 1001,
//       ayaId: 1001,
//       reciterName: "Maher Al Muaiqly",
//       url: "http://localhost:8080/api/audio/maher_al_muaiqly/55/13",
//       localPath: ""
//     }]
//   },
//   {
//     id: 1002,
//     surahNumber: 94,
//     ayaNumber: 5,
//     arabicText: "فَإِنَّ مَعَ ٱلۡعُسۡرِ يُسۡرًا",
//     translations: [{
//       id: 1002,
//       ayaId: 1002,
//       language: "en",
//       translatorName: "Dr. Mustafa Khattab",
//       text: "So, surely with hardship comes ease."
//     }],
//     audios: [{
//       id: 1002,
//       ayaId: 1002,
//       reciterName: "Maher Al Muaiqly",
//       url: "http://localhost:8080/api/audio/maher_al_muaiqly/94/5",
//       localPath: ""
//     }]
//   }
// ];
//
// // Mock API functions with fallback logic
// export const mockQuranApi = {
//   // Get ayah by surah and ayah number
//   getAya: async (surahNumber: number, ayaNumber: number): Promise<AyaWithTranslationsAndAudio> => {
//     console.log(`Mock API: Getting verse ${surahNumber}:${ayaNumber}`);
//
//     const surahData = MOCK_QURAN_DATA[surahNumber];
//     if (surahData) {
//       const aya = surahData.find(a => a.ayaNumber === ayaNumber);
//       if (aya) {
//         return aya;
//       }
//     }
//
//     // Return first verse of Al-Fatihah as fallback
//     return MOCK_QURAN_DATA[1][0];
//   },
//
//   // Get all ayahs in a surah
//   getSurahAyahs: async (surahNumber: number): Promise<AyaWithTranslationsAndAudio[]> => {
//     console.log(`Mock API: Getting surah ${surahNumber}`);
//
//     const surahData = MOCK_QURAN_DATA[surahNumber];
//     if (surahData) {
//       return surahData;
//     }
//
//     // Return Al-Fatihah as fallback
//     return MOCK_QURAN_DATA[1];
//   },
//
//   // Get random ayah
//   getRandomAya: async (): Promise<AyaWithTranslationsAndAudio> => {
//     console.log('Mock API: Getting random verse');
//
//     const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_VERSES.length);
//     return INSPIRATIONAL_VERSES[randomIndex];
//   },
//
//   // Get range of ayahs
//   getAyasRange: async (surahNumber: number, from: number, to: number): Promise<AyaWithTranslationsAndAudio[]> => {
//     console.log(`Mock API: Getting range ${surahNumber}:${from}-${to}`);
//
//     const surahData = MOCK_QURAN_DATA[surahNumber];
//     if (surahData) {
//       return surahData.filter(aya => aya.ayaNumber >= from && aya.ayaNumber <= to);
//     }
//
//     return MOCK_QURAN_DATA[1].slice(from - 1, to);
//   },
//
//   // Get page of ayahs (mock implementation)
//   getPage: async (pageNumber: number): Promise<AyaWithTranslationsAndAudio[]> => {
//     console.log(`Mock API: Getting page ${pageNumber}`);
//
//     // Page 1 has Al-Fatihah
//     if (pageNumber === 1) {
//       return MOCK_QURAN_DATA[1];
//     }
//
//     // Page 2 has beginning of Al-Baqarah
//     if (pageNumber === 2) {
//       return MOCK_QURAN_DATA[2];
//     }
//
//     // For other pages, return a mix
//     return [...MOCK_QURAN_DATA[1].slice(0, 3), ...MOCK_QURAN_DATA[2].slice(0, 2)];
//   },
//
//   // Search ayahs (mock implementation)
//   searchAyahs: async (query: string): Promise<AyaWithTranslationsAndAudio[]> => {
//     console.log(`Mock API: Searching for "${query}"`);
//
//     const allVerses = [...MOCK_QURAN_DATA[1], ...MOCK_QURAN_DATA[2], ...INSPIRATIONAL_VERSES];
//
//     return allVerses.filter(aya =>
//       aya.arabicText.includes(query) ||
//       aya.translations.some(t => t.text.toLowerCase().includes(query.toLowerCase()))
//     );
//   }
// };