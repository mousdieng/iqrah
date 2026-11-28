import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuranService } from '../../services/quran.service';
import { StorageService } from '../../services/storage.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { MemorizeService } from '../../services/memorize.service';
import { Ayah } from '../../models';
import { ayahDisplayText, arabicNumber } from '../../shared/quran-text';

type Tab = 'due' | 'memorized' | 'surahs' | 'bookmarks' | 'notes';

interface Row {
  ayahId: number;
  surahId: number | null;
  surahName: string;
  numberInSurah: number | null;
  note?: string;
  due?: string;
}

const PAGE_SIZE = 30;

@Component({
  selector: 'app-memorization',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './memorization.component.html',
  styleUrls: ['./memorization.component.css']
})
export class MemorizationComponent {
  private storage = inject(StorageService);
  private quranService = inject(QuranService);
  readonly catalog = inject(SurahCatalogService);
  readonly memorize = inject(MemorizeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'due',       label: 'À réviser',   icon: 'pi pi-refresh' },
    { id: 'memorized', label: 'Mémorisés',   icon: 'pi pi-check-circle' },
    { id: 'surahs',    label: 'Par sourate', icon: 'pi pi-list' },
    { id: 'bookmarks', label: 'Signets',     icon: 'pi pi-bookmark' },
    { id: 'notes',     label: 'Notes',       icon: 'pi pi-pencil' }
  ];

  readonly tab = signal<Tab>(this.tabFromUrl());
  readonly shown = signal(PAGE_SIZE);
  readonly editingGoal = signal(false);

  /** Bookmarks and notes are not observable in StorageService: bump this to re-read them */
  private readonly localVersion = signal(0);

  private readonly lists = computed(() => {
    this.localVersion();
    const progress = this.memorize.progress();
    this.catalog.surahs();   // re-run once surah names arrive

    const memorized = progress.filter(p => p.memorized).sort((a, b) => a.ayahId - b.ayahId);
    const due = this.memorize.due();
    const bookmarkIds = new Set([
      ...this.storage.getBookmarks().map(b => b.ayahId),
      ...this.storage.getFavorites().map(f => f.ayahId)
    ]);
    const notes = this.storage.getAllNotes().sort((a, b) => a.ayahId - b.ayahId);

    return {
      due: due.map(p => this.row(p.ayahId)),
      memorized: memorized.map(p => ({ ...this.row(p.ayahId), due: this.dueLabel(this.storage.dueDate(p)) })),
      surahs: [] as Row[],
      bookmarks: [...bookmarkIds].sort((a, b) => a - b).map(id => this.row(id)),
      notes: notes.map(n => ({ ...this.row(n.ayahId), note: n.text }))
    };
  });

  readonly counts = computed(() => {
    const l = this.lists();
    return {
      due: l.due.length, memorized: l.memorized.length, surahs: this.memorize.surahProgress().length,
      bookmarks: l.bookmarks.length, notes: l.notes.length
    };
  });

  readonly rows = computed(() => this.lists()[this.tab()]);
  readonly visibleRows = computed(() => this.rows().slice(0, this.shown()));

  // ─── Today ─────────────────────────────────────────────────────────────────

  readonly goalPercent = computed(() => Math.min(100, Math.round((this.memorize.today().learned / this.memorize.goal()) * 100)));
  readonly goalReached = computed(() => this.memorize.today().learned >= this.memorize.goal());
  readonly weekMax = computed(() => Math.max(1, ...this.memorize.week().map(d => d.learned + d.reviewed)));

  readonly currentSurahInfo = computed(() => {
    const s = this.catalog.get(this.memorize.currentSurah());
    if (!s) return null;
    const first = this.catalog.firstAyahId(s.number) ?? 0;
    const known = this.memorize.memorizedIds();
    let memorized = 0;
    for (let id = first; id < first + s.numberOfAyahs; id++) if (known.has(id)) memorized++;
    return { surah: s, memorized, percent: Math.round((memorized / s.numberOfAyahs) * 100) };
  });

  readonly nextRows = computed(() => this.memorize.nextToLearn().map(n => this.row(n.ayahId)));

  /** Arabic text of the ayahs on screen, fetched as rows appear */
  readonly texts = signal(new Map<number, Ayah>());
  private requested = new Set<number>();

  readonly arabicNumber = arabicNumber;
  readonly displayText = ayahDisplayText;

  constructor() {
    effect(() => {
      const ids = [...this.visibleRows().map(r => r.ayahId), ...this.nextRows().map(r => r.ayahId)];
      for (const id of ids) {
        if (this.requested.has(id)) continue;
        this.requested.add(id);
        this.quranService.getAyah(id).subscribe(ayah => {
          if (!ayah) return;
          this.texts.update(map => new Map(map).set(ayah.id, ayah));
        });
      }
    });
  }

  selectTab(tab: Tab): void {
    this.tab.set(tab);
    this.shown.set(PAGE_SIZE);
    this.router.navigate([], { relativeTo: this.route, queryParams: { tab }, replaceUrl: true });
  }

  showMore(): void {
    this.shown.update(n => n + PAGE_SIZE);
  }

  changeGoal(delta: number): void {
    this.memorize.setGoal(this.memorize.goal() + delta);
  }

  onFocusSurah(event: Event): void {
    this.memorize.setFocusSurah(+(event.target as HTMLSelectElement).value);
  }

  /** Opens the reader on the first verse to learn, with the text hidden for reciting */
  learnInReader(): void {
    const first = this.memorize.nextToLearn()[0];
    if (!first) return;
    this.router.navigate(['/surah', first.surahId], { queryParams: { ayah: first.ayahId, memo: 1, mode: 'mushaf' } });
  }

  markLearned(row: Row): void {
    if (row.surahId) this.memorize.markMemorized([{ ayahId: row.ayahId, surahId: row.surahId }]);
  }

  markAllLearned(): void {
    this.memorize.markMemorized(this.memorize.nextToLearn().map(n => ({ ayahId: n.ayahId, surahId: n.surahId })));
  }

  emptyFor(tab: Tab): { icon: string; title: string; text: string } {
    switch (tab) {
      case 'due':
        return this.counts().memorized
          ? { icon: 'pi pi-check', title: 'Tout est révisé', text: 'Aucun verset à revoir aujourd\'hui. Revenez demain, ou testez-vous avec un quiz.' }
          : { icon: 'pi pi-refresh', title: 'Rien à réviser', text: 'Les versets que vous mémorisez reviennent ici au bon moment pour être révisés.' };
      case 'memorized':
      case 'surahs':
        return { icon: 'pi pi-check-circle', title: 'Aucun verset mémorisé', text: 'Marquez les versets que vous connaissez depuis « À apprendre » ci-dessus, ou dans le lecteur avec « Réciter » puis « Marquer… ».' };
      case 'bookmarks':
        return { icon: 'pi pi-bookmark', title: 'Aucun signet', text: 'Ajoutez un signet depuis le menu d\'un verset pour le retrouver ici.' };
      case 'notes':
        return { icon: 'pi pi-pencil', title: 'Aucune note', text: 'Écrivez vos réflexions sur un verset depuis son menu, « Ajouter une note ».' };
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  unmarkMemorized(row: Row): void {
    this.memorize.unmarkMemorized([row.ayahId]);
  }

  removeBookmark(row: Row): void {
    this.storage.removeBookmark(row.ayahId);
    if (this.storage.isFavorite(row.ayahId)) this.storage.removeFavorite(row.ayahId);
    this.localVersion.update(v => v + 1);
  }

  removeNote(row: Row): void {
    this.storage.removeNote(row.ayahId);
    this.localVersion.update(v => v + 1);
  }

  private dueLabel(date: Date): string {
    const days = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
    if (days <= 0) return 'à réviser';
    if (days === 1) return 'révision demain';
    return `révision dans ${days} j`;
  }

  private row(ayahId: number): Row {
    const where = this.catalog.locate(ayahId);
    return {
      ayahId,
      surahId: where?.surah.number ?? null,
      surahName: where?.surah.englishName ?? '',
      numberInSurah: where?.numberInSurah ?? null
    };
  }

  private tabFromUrl(): Tab {
    const t = this.route.snapshot.queryParamMap.get('tab');
    return t === 'memorized' || t === 'surahs' || t === 'bookmarks' || t === 'notes' ? t : 'due';
  }
}
