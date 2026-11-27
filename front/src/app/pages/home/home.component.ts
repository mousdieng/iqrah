import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { QuranService } from '../../services/quran.service';
import { StorageService } from '../../services/storage.service';
import { TranslationService } from '../../services/translation.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { ReadingHistoryService } from '../../services/reading-history.service';
import { Ayah } from '../../models';
import { ayahDisplayText, arabicNumber } from '../../shared/quran-text';

const TOTAL_AYAHS = 6236;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private quranService = inject(QuranService);
  private storage = inject(StorageService);
  private translationService = inject(TranslationService);
  private catalog = inject(SurahCatalogService);
  private history = inject(ReadingHistoryService);

  private readonly progress = toSignal(this.storage.progress$, { initialValue: this.storage.getProgress() });

  readonly memorizedCount = computed(() => this.progress().filter(p => p.memorized).length);
  readonly memorizedPercent = computed(() => (this.memorizedCount() / TOTAL_AYAHS) * 100);
  readonly dueCount = computed(() => {
    this.progress();
    return this.storage.getAyahsDueForReview().filter(p => p.memorized).length;
  });

  /** Where to resume: last read surah, or Al-Fatiha for a first visit */
  readonly resume = computed(() => {
    const last = this.history.lastRead();
    const surah = last ? this.catalog.get(last.surahId) : this.catalog.get(1);
    return {
      isFirstVisit: !last,
      surahId: last?.surahId ?? 1,
      page: last?.page ?? 1,
      englishName: surah?.englishName ?? (last ? `Sourate ${last.surahId}` : 'Al-Faatiha'),
      arabicName: surah?.name ?? '',
      meaning: surah?.englishNameTranslation ?? ''
    };
  });

  // Verse of the day
  readonly verse = signal<Ayah | null>(null);
  readonly verseTranslation = signal<string | null>(null);
  readonly verseSurah = computed(() => {
    const v = this.verse();
    return v ? this.catalog.get(v.surahId) : undefined;
  });

  constructor() {
    this.quranService.getRandomAyah().subscribe(ayah => {
      this.verse.set(ayah);
      if (ayah) {
        this.translationService.getAyahTranslation(ayah.id).subscribe(t => {
          this.verseTranslation.set(t?.translations?.['fr']?.text ?? null);
        });
      }
    });
  }

  newVerse(): void {
    this.verse.set(null);
    this.verseTranslation.set(null);
    this.quranService.getRandomAyah().subscribe(ayah => {
      this.verse.set(ayah);
      if (ayah) {
        this.translationService.getAyahTranslation(ayah.id).subscribe(t => {
          this.verseTranslation.set(t?.translations?.['fr']?.text ?? null);
        });
      }
    });
  }

  readonly arabicNumber = arabicNumber;
  readonly displayText = ayahDisplayText;
}
