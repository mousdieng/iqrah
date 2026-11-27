import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { StorageService } from '../../services/storage.service';

type Revelation = 'all' | 'Meccan' | 'Medinan';

@Component({
  selector: 'app-surahs',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './surahs.component.html',
  styleUrls: ['./surahs.component.css']
})
export class SurahsComponent {
  private catalog = inject(SurahCatalogService);
  private storage = inject(StorageService);

  readonly query = signal('');
  readonly revelation = signal<Revelation>('all');
  readonly loading = this.catalog.loading;

  readonly filters: { value: Revelation; label: string }[] = [
    { value: 'all', label: 'Toutes' },
    { value: 'Meccan', label: 'Mecquoises' },
    { value: 'Medinan', label: 'Médinoises' }
  ];

  private readonly progress = toSignal(this.storage.progress$, { initialValue: this.storage.getProgress() });

  /** Memorized ayahs per surah */
  private readonly memorizedBySurah = computed(() => {
    const counts = new Map<number, number>();
    for (const p of this.progress()) {
      if (p.memorized) counts.set(p.surahId, (counts.get(p.surahId) ?? 0) + 1);
    }
    return counts;
  });

  readonly surahs = computed(() => {
    const raw = this.query().trim();
    const q = this.normalize(raw);
    const rev = this.revelation();
    const memorized = this.memorizedBySurah();
    return this.catalog.surahs()
      .filter(s => rev === 'all' || s.revelationType === rev)
      .filter(s => !raw
        || String(s.number) === raw
        || (!!q && this.normalize(s.englishName).includes(q))
        || (!!q && this.normalize(s.englishNameTranslation).includes(q))
        || s.name.includes(raw))
      .map(s => {
        const done = memorized.get(s.number) ?? 0;
        return { ...s, memorized: done, percent: Math.round((done / s.numberOfAyahs) * 100) };
      });
  });

  onSearch(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.query.set('');
  }

  /**
   * Lowercase, no accents, no punctuation, common transliteration variants folded
   * (ee→i, oo→u, doubled letters) — so "yasin" finds "Yaseen" and "al fatiha" finds "Al-Faatiha"
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/ee/g, 'i')
      .replace(/oo/g, 'u')
      .replace(/(.)\1+/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
