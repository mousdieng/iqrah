import { Reciter } from '../types';

export const RECITERS: Record<string, Reciter> = {
  maher: {
    id: 'maher',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    subfolder: 'Maher_AlMuaiqly_64kbps',
    bitrate: '64kbps',
  },
  husary: {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    subfolder: 'Husary_64kbps',
    bitrate: '64kbps',
  },
  minshawi: {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    subfolder: 'Minshawy_Murattal_128kbps',
    bitrate: '128kbps',
  },
  sudais: {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    arabicName: 'عبد الرحمن السديس',
    subfolder: 'Abdurrahmaan_As-Sudais_192kbps',
    bitrate: '192kbps',
  },
};

export const DEFAULT_RECITER = 'maher';

// Audio URLs
export const AUDIO_URLS = {
  // Full Surah audio from QuranicAudio.com
  fullSurah: (reciter: string, surahNumber: number) =>
    `https://download.quranicaudio.com/quran/${RECITERS[reciter]?.subfolder}/${String(surahNumber).padStart(3, '0')}.mp3`,

  // Individual ayah audio from EveryAyah.com
  ayah: (reciter: string, surahNumber: number, ayahNumber: number) =>
    `https://everyayah.com/data/${RECITERS[reciter]?.subfolder}/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`,
};
