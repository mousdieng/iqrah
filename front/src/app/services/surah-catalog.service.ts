import { Injectable, computed, inject, signal } from '@angular/core';
import { QuranService } from './quran.service';
import { SurahDTO } from '../models';

/** The 114 surahs (names, ayah counts), loaded once and shared by every page */
@Injectable({ providedIn: 'root' })
export class SurahCatalogService {
  private quranService = inject(QuranService);

  readonly surahs = signal<SurahDTO[]>([]);
  readonly loading = signal(false);
  readonly loaded = computed(() => this.surahs().length > 0);

  /** Global id of the first ayah of each surah (index = surah number) */
  private readonly firstAyahIds = computed(() => {
    const starts: number[] = [0];
    let next = 1;
    for (const s of this.surahs()) {
      starts[s.number] = next;
      next += s.numberOfAyahs;
    }
    return starts;
  });

  constructor() {
    this.load();
  }

  load(): void {
    if (this.loaded() || this.loading()) return;
    this.loading.set(true);
    this.quranService.getAllSurahs().subscribe(list => {
      this.surahs.set([...list].sort((a, b) => a.number - b.number));
      this.loading.set(false);
    });
  }

  /** Global id of the first ayah of a surah (null until the catalog is loaded) */
  firstAyahId(surahNumber: number): number | null {
    return this.firstAyahIds()[surahNumber] || null;
  }

  get(surahNumber: number): SurahDTO | undefined {
    return this.surahs()[surahNumber - 1];
  }

  /** Ayah number inside its surah, from the global ayah id (1–6236) */
  numberInSurah(ayahId: number, surahNumber: number): number | null {
    const start = this.firstAyahIds()[surahNumber];
    return start ? ayahId - start + 1 : null;
  }

  /** Surah and verse number of a global ayah id (1–6236), once the catalog is loaded */
  locate(ayahId: number): { surah: SurahDTO; numberInSurah: number } | null {
    const starts = this.firstAyahIds();
    for (let n = 114; n >= 1; n--) {
      if (starts[n] && ayahId >= starts[n]) {
        const surah = this.get(n);
        return surah ? { surah, numberInSurah: ayahId - starts[n] + 1 } : null;
      }
    }
    return null;
  }
}
