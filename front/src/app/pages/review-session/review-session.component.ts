import { Component, HostListener, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuranService } from '../../services/quran.service';
import { AudioService } from '../../services/audio.service';
import { MemorizeService, ReviewRating } from '../../services/memorize.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { Ayah } from '../../models';
import { arabicNumber, ayahDisplayText, ayahWords, firstLetterHint, isMark } from '../../shared/quran-text';

interface Card {
  ayahId: number;
  ayah?: Ayah;
  previous?: Ayah;   // the verse before it, shown as a cue
}

type Hint = 0 | 1 | 2;   // none, first word, first letters

/**
 * Guided review of the verses that are due: recite from memory, use hints if needed,
 * reveal, then rate how it went so the next review is scheduled accordingly.
 */
@Component({
  selector: 'app-review-session',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './review-session.component.html',
  styleUrls: ['./review-session.component.css']
})
export class ReviewSessionComponent implements OnDestroy {
  private quran = inject(QuranService);
  private audio = inject(AudioService);
  private catalog = inject(SurahCatalogService);
  readonly memorize = inject(MemorizeService);
  private route = inject(ActivatedRoute);

  /** ?ids=1,2,3 reviews chosen verses (e.g. the hardest ones) even if they are not due */
  private readonly chosenIds = (this.route.snapshot.queryParamMap.get('ids') ?? '')
    .split(',').map(Number).filter(id => id > 0 && id <= 6236);

  /** The verses due when the session started (rating one does not reshuffle the rest) */
  readonly cards = signal<Card[]>(
    (this.chosenIds.length ? this.chosenIds : this.memorize.due().map(p => p.ayahId)).map(ayahId => ({ ayahId }))
  );
  readonly index = signal(0);
  readonly revealed = signal(false);
  readonly hint = signal<Hint>(0);
  readonly results = signal<Record<ReviewRating, number>>({ hard: 0, good: 0, easy: 0 });

  readonly total = computed(() => this.cards().length);
  readonly done = computed(() => this.index() >= this.total());
  readonly card = computed(() => this.cards()[this.index()]);
  readonly percent = computed(() => this.total() ? Math.round((this.index() / this.total()) * 100) : 0);

  readonly label = computed(() => {
    const c = this.card();
    if (!c) return null;
    const where = this.catalog.locate(c.ayahId);
    return where ? { name: where.surah.englishName, arabic: where.surah.name, ref: `${where.surah.number}:${where.numberInSurah}`, surahId: where.surah.number }
                 : { name: '', arabic: '', ref: `#${c.ayahId}`, surahId: null };
  });

  /** Words of the current verse, with what each one shows given the hint level */
  readonly words = computed(() => {
    const ayah = this.card()?.ayah;
    if (!ayah) return [];
    const revealed = this.revealed();
    const hint = this.hint();
    let firstWordShown = false;
    return ayahWords(ayahDisplayText(ayah)).map(word => {
      if (revealed || isMark(word)) return { text: word, hidden: false };
      if (hint === 1 && !firstWordShown) { firstWordShown = true; return { text: word, hidden: false }; }
      if (hint === 2) return { text: firstLetterHint(word), hidden: false, hint: true };
      return { text: word, hidden: true };
    });
  });

  readonly intervals = computed(() => {
    const c = this.card();
    const p = c ? this.memorize.progress().find(x => x.ayahId === c.ayahId) : undefined;
    return {
      hard: this.memorize.intervalLabel(this.memorize.nextInterval(p, 'hard')),
      good: this.memorize.intervalLabel(this.memorize.nextInterval(p, 'good')),
      easy: this.memorize.intervalLabel(this.memorize.nextInterval(p, 'easy'))
    };
  });

  readonly arabicNumber = arabicNumber;
  readonly displayText = ayahDisplayText;

  constructor() {
    this.loadCard(0);
    this.loadCard(1);
  }

  ngOnDestroy(): void {
    this.audio.stop();
  }

  showHint(): void {
    this.hint.update(h => (h < 2 ? h + 1 : h) as Hint);
  }

  reveal(): void {
    this.revealed.set(true);
  }

  listen(): void {
    const ayah = this.card()?.ayah;
    if (!ayah) return;
    this.audio.loadAyah(ayah);
    this.audio.play();
  }

  rate(rating: ReviewRating): void {
    const c = this.card();
    if (!c || !this.revealed()) return;
    this.memorize.review(c.ayahId, rating);
    this.results.update(r => ({ ...r, [rating]: r[rating] + 1 }));
    this.audio.stop();
    this.next();
  }

  /** Leaves this verse for later in the session */
  skip(): void {
    const c = this.card();
    if (!c) return;
    this.audio.stop();
    this.cards.update(list => {
      const copy = [...list];
      copy.splice(this.index(), 1);
      copy.push(c);
      return copy;
    });
    this.resetCard();
    this.loadCard(this.index());
    this.loadCard(this.index() + 1);
  }

  /** Verses that became due during the session (or none were): start again with what is due now */
  restart(): void {
    this.cards.set(this.memorize.due().map(p => ({ ayahId: p.ayahId })));
    this.index.set(0);
    this.results.set({ hard: 0, good: 0, easy: 0 });
    this.resetCard();
    this.loadCard(0);
    this.loadCard(1);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey || this.done()) return;
    if ((event.target as HTMLElement | null)?.closest('input, textarea, select')) return;
    if (!this.revealed()) {
      if (event.code === 'Space' || event.key === 'Enter') { event.preventDefault(); this.reveal(); }
      else if (event.key === 'h' || event.key === 'i') this.showHint();
      else if (event.key === 'l') this.listen();
      return;
    }
    if (event.key === '1') this.rate('hard');
    else if (event.key === '2' || event.code === 'Space' || event.key === 'Enter') { event.preventDefault(); this.rate('good'); }
    else if (event.key === '3') this.rate('easy');
  }

  private next(): void {
    this.index.update(i => i + 1);
    this.resetCard();
    this.loadCard(this.index() + 1);   // prefetch
  }

  private resetCard(): void {
    this.revealed.set(false);
    this.hint.set(0);
  }

  private loadCard(i: number): void {
    const c = this.cards()[i];
    if (!c || c.ayah) return;
    this.quran.getAyah(c.ayahId).subscribe(ayah => {
      if (!ayah) return;
      this.patch(c.ayahId, { ayah });
      if (ayah.numberInSurah > 1) {
        this.quran.getAyah(ayah.id - 1).subscribe(prev => { if (prev) this.patch(c.ayahId, { previous: prev }); });
      }
    });
  }

  private patch(ayahId: number, changes: Partial<Card>): void {
    this.cards.update(list => list.map(c => c.ayahId === ayahId ? { ...c, ...changes } : c));
  }
}
