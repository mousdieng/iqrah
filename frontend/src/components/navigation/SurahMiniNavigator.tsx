'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Search,
  Star,
  Clock,
  ArrowRight,
  MapPin,
  Hash,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SurahInfo {
  number: number;
  name: string;
  arabicName: string;
  ayaCount: number;
  revelationType: string;
  englishName: string;
}

interface SurahMiniNavigatorProps {
  currentSurahNumber: number;
  trigger?: React.ReactNode;
  showInline?: boolean;
}

// Complete surah data - in real app this would come from API
const SURAH_DATA: SurahInfo[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", ayaCount: 7, revelationType: "Meccan", englishName: "The Opening" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", ayaCount: 286, revelationType: "Medinan", englishName: "The Cow" },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", ayaCount: 200, revelationType: "Medinan", englishName: "Family of Imran" },
  { number: 4, name: "An-Nisa", arabicName: "النساء", ayaCount: 176, revelationType: "Medinan", englishName: "The Women" },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", ayaCount: 120, revelationType: "Medinan", englishName: "The Table Spread" },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", ayaCount: 165, revelationType: "Meccan", englishName: "The Cattle" },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", ayaCount: 206, revelationType: "Meccan", englishName: "The Heights" },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", ayaCount: 75, revelationType: "Medinan", englishName: "The Spoils of War" },
  { number: 9, name: "At-Tawbah", arabicName: "التوبة", ayaCount: 129, revelationType: "Medinan", englishName: "The Repentance" },
  { number: 10, name: "Yunus", arabicName: "يونس", ayaCount: 109, revelationType: "Meccan", englishName: "Jonah" },
  { number: 11, name: "Hud", arabicName: "هود", ayaCount: 123, revelationType: "Meccan", englishName: "Hud" },
  { number: 12, name: "Yusuf", arabicName: "يوسف", ayaCount: 111, revelationType: "Meccan", englishName: "Joseph" },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", ayaCount: 43, revelationType: "Medinan", englishName: "The Thunder" },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", ayaCount: 52, revelationType: "Meccan", englishName: "Abraham" },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", ayaCount: 99, revelationType: "Meccan", englishName: "The Rocky Tract" },
  { number: 16, name: "An-Nahl", arabicName: "النحل", ayaCount: 128, revelationType: "Meccan", englishName: "The Bee" },
  { number: 17, name: "Al-Isra", arabicName: "الإسراء", ayaCount: 111, revelationType: "Meccan", englishName: "The Night Journey" },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", ayaCount: 110, revelationType: "Meccan", englishName: "The Cave" },
  { number: 19, name: "Maryam", arabicName: "مريم", ayaCount: 98, revelationType: "Meccan", englishName: "Mary" },
  { number: 20, name: "Taha", arabicName: "طه", ayaCount: 135, revelationType: "Meccan", englishName: "Ta-Ha" },
  { number: 21, name: "Al-Anbya", arabicName: "الأنبياء", ayaCount: 112, revelationType: "Meccan", englishName: "The Prophets" },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", ayaCount: 78, revelationType: "Medinan", englishName: "The Pilgrimage" },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", ayaCount: 118, revelationType: "Meccan", englishName: "The Believers" },
  { number: 24, name: "An-Nur", arabicName: "النور", ayaCount: 64, revelationType: "Medinan", englishName: "The Light" },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", ayaCount: 77, revelationType: "Meccan", englishName: "The Criterion" },
  { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", ayaCount: 227, revelationType: "Meccan", englishName: "The Poets" },
  { number: 27, name: "An-Naml", arabicName: "النمل", ayaCount: 93, revelationType: "Meccan", englishName: "The Ants" },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", ayaCount: 88, revelationType: "Meccan", englishName: "The Stories" },
  { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", ayaCount: 69, revelationType: "Meccan", englishName: "The Spider" },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", ayaCount: 60, revelationType: "Meccan", englishName: "The Romans" },
  { number: 31, name: "Luqman", arabicName: "لقمان", ayaCount: 34, revelationType: "Meccan", englishName: "Luqman" },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", ayaCount: 30, revelationType: "Meccan", englishName: "The Prostration" },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", ayaCount: 73, revelationType: "Medinan", englishName: "The Clans" },
  { number: 34, name: "Saba", arabicName: "سبأ", ayaCount: 54, revelationType: "Meccan", englishName: "Sheba" },
  { number: 35, name: "Fatir", arabicName: "فاطر", ayaCount: 45, revelationType: "Meccan", englishName: "Originator" },
  { number: 36, name: "Yasin", arabicName: "يس", ayaCount: 83, revelationType: "Meccan", englishName: "Ya Sin" },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", ayaCount: 182, revelationType: "Meccan", englishName: "Those who set the Ranks" },
  { number: 38, name: "Sad", arabicName: "ص", ayaCount: 88, revelationType: "Meccan", englishName: "The Letter 'Saad'" },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", ayaCount: 75, revelationType: "Meccan", englishName: "The Troops" },
  { number: 40, name: "Ghafir", arabicName: "غافر", ayaCount: 85, revelationType: "Meccan", englishName: "The Forgiver" },
  { number: 41, name: "Fussilat", arabicName: "فصلت", ayaCount: 54, revelationType: "Meccan", englishName: "Explained in Detail" },
  { number: 42, name: "Ash-Shuraa", arabicName: "الشورى", ayaCount: 53, revelationType: "Meccan", englishName: "The Consultation" },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", ayaCount: 89, revelationType: "Meccan", englishName: "The Ornaments of Gold" },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", ayaCount: 59, revelationType: "Meccan", englishName: "The Smoke" },
  { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", ayaCount: 37, revelationType: "Meccan", englishName: "The Crouching" },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", ayaCount: 35, revelationType: "Meccan", englishName: "The Wind-Curved Sandhills" },
  { number: 47, name: "Muhammad", arabicName: "محمد", ayaCount: 38, revelationType: "Medinan", englishName: "Muhammad" },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", ayaCount: 29, revelationType: "Medinan", englishName: "The Victory" },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", ayaCount: 18, revelationType: "Medinan", englishName: "The Rooms" },
  { number: 50, name: "Qaf", arabicName: "ق", ayaCount: 45, revelationType: "Meccan", englishName: "The Letter 'Qaf'" },
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", ayaCount: 60, revelationType: "Meccan", englishName: "The Winnowing Winds" },
  { number: 52, name: "At-Tur", arabicName: "الطور", ayaCount: 49, revelationType: "Meccan", englishName: "The Mount" },
  { number: 53, name: "An-Najm", arabicName: "النجم", ayaCount: 62, revelationType: "Meccan", englishName: "The Star" },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", ayaCount: 55, revelationType: "Meccan", englishName: "The Moon" },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", ayaCount: 78, revelationType: "Medinan", englishName: "The Beneficent" },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", ayaCount: 96, revelationType: "Meccan", englishName: "The Inevitable" },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", ayaCount: 29, revelationType: "Medinan", englishName: "The Iron" },
  { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", ayaCount: 22, revelationType: "Medinan", englishName: "The Pleading Woman" },
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", ayaCount: 24, revelationType: "Medinan", englishName: "The Exile" },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", ayaCount: 13, revelationType: "Medinan", englishName: "She that is to be examined" },
  { number: 61, name: "As-Saf", arabicName: "الصف", ayaCount: 14, revelationType: "Medinan", englishName: "The Ranks" },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", ayaCount: 11, revelationType: "Medinan", englishName: "The Congregation, Friday" },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", ayaCount: 11, revelationType: "Medinan", englishName: "The Hypocrites" },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", ayaCount: 18, revelationType: "Medinan", englishName: "The Mutual Disillusion" },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", ayaCount: 12, revelationType: "Medinan", englishName: "The Divorce" },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", ayaCount: 12, revelationType: "Medinan", englishName: "The Prohibition" },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", ayaCount: 30, revelationType: "Meccan", englishName: "The Sovereignty" },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", ayaCount: 52, revelationType: "Meccan", englishName: "The Pen" },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", ayaCount: 52, revelationType: "Meccan", englishName: "The Reality" },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", ayaCount: 44, revelationType: "Meccan", englishName: "The Ascending Stairways" },
  { number: 71, name: "Nuh", arabicName: "نوح", ayaCount: 28, revelationType: "Meccan", englishName: "Noah" },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", ayaCount: 28, revelationType: "Meccan", englishName: "The Jinn" },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", ayaCount: 20, revelationType: "Meccan", englishName: "The Enshrouded One" },
  { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", ayaCount: 56, revelationType: "Meccan", englishName: "The Cloaked One" },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", ayaCount: 40, revelationType: "Meccan", englishName: "The Resurrection" },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", ayaCount: 31, revelationType: "Medinan", englishName: "The Man" },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", ayaCount: 50, revelationType: "Meccan", englishName: "The Emissaries" },
  { number: 78, name: "An-Naba", arabicName: "النبأ", ayaCount: 40, revelationType: "Meccan", englishName: "The Tidings" },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", ayaCount: 46, revelationType: "Meccan", englishName: "Those who drag forth" },
  { number: 80, name: "Abasa", arabicName: "عبس", ayaCount: 42, revelationType: "Meccan", englishName: "He frowned" },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", ayaCount: 29, revelationType: "Meccan", englishName: "The Overthrowing" },
  { number: 82, name: "Al-Infitar", arabicName: "الإنفطار", ayaCount: 19, revelationType: "Meccan", englishName: "The Cleaving" },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", ayaCount: 36, revelationType: "Meccan", englishName: "The Defrauding" },
  { number: 84, name: "Al-Inshiqaq", arabicName: "الإنشقاق", ayaCount: 25, revelationType: "Meccan", englishName: "The Sundering" },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", ayaCount: 22, revelationType: "Meccan", englishName: "The Mansions of the Stars" },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", ayaCount: 17, revelationType: "Meccan", englishName: "The Morning Star" },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", ayaCount: 19, revelationType: "Meccan", englishName: "The Most High" },
  { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", ayaCount: 26, revelationType: "Meccan", englishName: "The Overwhelming" },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", ayaCount: 30, revelationType: "Meccan", englishName: "The Dawn" },
  { number: 90, name: "Al-Balad", arabicName: "البلد", ayaCount: 20, revelationType: "Meccan", englishName: "The City" },
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", ayaCount: 15, revelationType: "Meccan", englishName: "The Sun" },
  { number: 92, name: "Al-Layl", arabicName: "الليل", ayaCount: 21, revelationType: "Meccan", englishName: "The Night" },
  { number: 93, name: "Ad-Duhaa", arabicName: "الضحى", ayaCount: 11, revelationType: "Meccan", englishName: "The Morning Hours" },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", ayaCount: 8, revelationType: "Meccan", englishName: "The Relief" },
  { number: 95, name: "At-Tin", arabicName: "التين", ayaCount: 8, revelationType: "Meccan", englishName: "The Fig" },
  { number: 96, name: "Al-'Alaq", arabicName: "العلق", ayaCount: 19, revelationType: "Meccan", englishName: "The Clot" },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", ayaCount: 5, revelationType: "Meccan", englishName: "The Power, Fate" },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", ayaCount: 8, revelationType: "Medinan", englishName: "The Evidence" },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", ayaCount: 8, revelationType: "Medinan", englishName: "The Earthquake" },
  { number: 100, name: "Al-'Adiyat", arabicName: "العاديات", ayaCount: 11, revelationType: "Meccan", englishName: "The Courser" },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", ayaCount: 11, revelationType: "Meccan", englishName: "The Calamity" },
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", ayaCount: 8, revelationType: "Meccan", englishName: "The Rivalry in world increase" },
  { number: 103, name: "Al-'Asr", arabicName: "العصر", ayaCount: 3, revelationType: "Meccan", englishName: "The Declining Day, Epoch" },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", ayaCount: 9, revelationType: "Meccan", englishName: "The Traducer" },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", ayaCount: 5, revelationType: "Meccan", englishName: "The Elephant" },
  { number: 106, name: "Quraysh", arabicName: "قريش", ayaCount: 4, revelationType: "Meccan", englishName: "Quraysh" },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", ayaCount: 7, revelationType: "Meccan", englishName: "The Small kindnesses" },
  { number: 108, name: "Al-Kawthar", arabicName: "الكوثر", ayaCount: 3, revelationType: "Meccan", englishName: "The Abundance" },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", ayaCount: 6, revelationType: "Meccan", englishName: "The Disbelievers" },
  { number: 110, name: "An-Nasr", arabicName: "النصر", ayaCount: 3, revelationType: "Medinan", englishName: "The Divine Support" },
  { number: 111, name: "Al-Masad", arabicName: "المسد", ayaCount: 5, revelationType: "Meccan", englishName: "The Palm Fibre" },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", ayaCount: 4, revelationType: "Meccan", englishName: "The Sincerity" },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", ayaCount: 5, revelationType: "Meccan", englishName: "The Dawn" },
  { number: 114, name: "An-Nas", arabicName: "الناس", ayaCount: 6, revelationType: "Meccan", englishName: "Mankind" }
];

// Popular/commonly read surahs
const POPULAR_SURAHS = [1, 2, 18, 36, 55, 67, 112, 113, 114];

// Recent surahs - in real app this would come from localStorage/API
const getRecentSurahs = (): number[] => {
  if (typeof window !== 'undefined') {
    const recent = localStorage.getItem('recent-surahs');
    return recent ? JSON.parse(recent) : [];
  }
  return [];
};

const addToRecentSurahs = (surahNumber: number) => {
  if (typeof window !== 'undefined') {
    const recent = getRecentSurahs();
    const updated = [surahNumber, ...recent.filter(s => s !== surahNumber)].slice(0, 10);
    localStorage.setItem('recent-surahs', JSON.stringify(updated));
  }
};

export default function SurahMiniNavigator({
  currentSurahNumber,
  trigger,
  showInline = false
}: SurahMiniNavigatorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSurahs, setFilteredSurahs] = useState<SurahInfo[]>([]);
  const [recentSurahs, setRecentSurahs] = useState<number[]>([]);
  const router = useRouter();

  const currentSurah = SURAH_DATA.find(s => s.number === currentSurahNumber);
  const previousSurah = SURAH_DATA.find(s => s.number === currentSurahNumber - 1);
  const nextSurah = SURAH_DATA.find(s => s.number === currentSurahNumber + 1);

  useEffect(() => {
    setRecentSurahs(getRecentSurahs());
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = SURAH_DATA.filter(surah =>
        surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.arabicName.includes(searchQuery) ||
        surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        surah.number.toString().includes(searchQuery)
      );
      setFilteredSurahs(filtered.slice(0, 10)); // Limit results
    } else {
      setFilteredSurahs([]);
    }
  }, [searchQuery]);

  const handleSurahClick = (surahNumber: number) => {
    addToRecentSurahs(surahNumber);
    router.push(`/surah/${surahNumber}`);
  };

  // Inline compact version
  if (showInline) {
    return (
      <div className="flex items-center gap-2">
        <Link href={previousSurah ? `/surah/${previousSurah.number}` : '#'}>
          <Button
            variant="outline"
            size="sm"
            disabled={!previousSurah}
            className="gap-1"
          >
            <ChevronLeft className="h-3 w-3" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
        </Link>

        <div className="text-center px-3">
          <Badge variant="outline">
            {currentSurahNumber} / 114
          </Badge>
        </div>

        <Link href={nextSurah ? `/surah/${nextSurah.number}` : '#'}>
          <Button
            variant="outline"
            size="sm"
            disabled={!nextSurah}
            className="gap-1"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    );
  }

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <BookOpen className="h-4 w-4" />
      Jump to Surah
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] sm:w-[400px] p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-3 border-b">
            <SheetTitle className="text-left">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-lg font-bold">Surah Navigator</div>
                  <div className="text-sm text-muted-foreground">
                    Browse all 114 surahs
                  </div>
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Current Surah Info */}
            <div className="p-4 border-b bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Currently Reading</span>
              </div>
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{currentSurah?.name}</div>
                      <div className="text-sm text-muted-foreground" dir="rtl">
                        {currentSurah?.arabicName}
                      </div>
                    </div>
                    <Badge variant="default">
                      {currentSurahNumber}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Controls */}
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => previousSurah && handleSurahClick(previousSurah.number)}
                  disabled={!previousSurah}
                  className="gap-2"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => nextSurah && handleSurahClick(nextSurah.number)}
                  disabled={!nextSurah}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              {(previousSurah || nextSurah) && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  {previousSurah && (
                    <span>← {previousSurah.name}</span>
                  )}
                  {previousSurah && nextSurah && (
                    <span className="mx-2">•</span>
                  )}
                  {nextSurah && (
                    <span>{nextSurah.name} →</span>
                  )}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search surahs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            {filteredSurahs.length > 0 && (
              <div className="p-4 border-b max-h-60 overflow-auto">
                <div className="text-sm font-medium mb-3">
                  Search Results ({filteredSurahs.length})
                </div>
                <div className="space-y-1">
                  {filteredSurahs.map(surah => (
                    <Card
                      key={surah.number}
                      className={`cursor-pointer hover:bg-muted/50 ${
                        surah.number === currentSurahNumber ? 'border-emerald-200 bg-emerald-50' : ''
                      }`}
                      onClick={() => handleSurahClick(surah.number)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{surah.name}</div>
                            <div className="text-xs text-muted-foreground" dir="rtl">
                              {surah.arabicName}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {surah.number}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Surahs */}
            {!searchQuery && recentSurahs.length > 0 && (
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recently Read</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {recentSurahs.slice(0, 9).map(surahNumber => {
                    const surah = SURAH_DATA.find(s => s.number === surahNumber);
                    if (!surah) return null;

                    return (
                      <Button
                        key={surahNumber}
                        variant={surahNumber === currentSurahNumber ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSurahClick(surahNumber)}
                        className="h-8 px-2 text-xs"
                        title={surah.name}
                      >
                        {surahNumber}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Surahs */}
            {!searchQuery && (
              <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Popular Surahs</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {POPULAR_SURAHS.map(surahNumber => {
                    const surah = SURAH_DATA.find(s => s.number === surahNumber);
                    if (!surah) return null;

                    return (
                      <Button
                        key={surahNumber}
                        variant={surahNumber === currentSurahNumber ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSurahClick(surahNumber)}
                        className="h-8 px-2 text-xs"
                        title={surah.name}
                      >
                        {surahNumber}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Number Access */}
            {!searchQuery && (
              <div className="flex-1 overflow-auto">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Quick Access</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 114 }, (_, i) => i + 1).map(surahNumber => (
                      <Button
                        key={surahNumber}
                        variant={surahNumber === currentSurahNumber ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleSurahClick(surahNumber)}
                        className="h-8 w-8 p-0 text-xs"
                        title={SURAH_DATA.find(s => s.number === surahNumber)?.name}
                      >
                        {surahNumber}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}