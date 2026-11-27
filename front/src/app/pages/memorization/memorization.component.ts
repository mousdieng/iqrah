import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { QuranService } from '../../services/quran.service';
import { StorageService } from '../../services/storage.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { Ayah } from '../../models';
import { ayahDisplayText, arabicNumber } from '../../shared/quran-text';

type Tab = 'due' | 'memorized' | 'bookmarks' | 'notes';

interface Row {
  ayahId: number;
  surahId: number | null;
  surahName: string;
  numberInSurah: number | null;
  note?: string;
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
  private catalog = inject(SurahCatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'due',       label: 'À réviser',  icon: 'pi pi-refresh' },
    { id: 'memorized', label: 'Mémorisés',  icon: 'pi pi-check-circle' },
    { id: 'bookmarks', label: 'Signets',    icon: 'pi pi-bookmark' },
    { id: 'notes',     label: 'Notes',      icon: 'pi pi-pencil' }
  ];

  readonly tab = signal<Tab>(this.tabFromUrl());
  readonly shown = signal(PAGE_SIZE);

  private readonly progress = toSignal(this.storage.progress$, { initialValue: this.storage.getProgress() });
  /** Bookmarks and notes are not observable in StorageService: bump this to re-read them */
  private readonly localVersion = signal(0);

  private readonly lists = computed(() => {
    this.localVersion();
    const progress = this.progress();
    this.catalog.surahs();   // re-run once surah names arrive

    const memorized = progress.filter(p => p.memorized).sort((a, b) => a.ayahId - b.ayahId);
    const due = this.storage.getAyahsDueForReview().filter(p => p.memorized).sort((a, b) => a.ayahId - b.ayahId);
    const bookmarkIds = new Set([
      ...this.storage.getBookmarks().map(b => b.ayahId),
      ...this.storage.getFavorites().map(f => f.ayahId)
    ]);
    const notes = this.storage.getAllNotes().sort((a, b) => a.ayahId - b.ayahId);

    return {
      due: due.map(p => this.row(p.ayahId)),
      memorized: memorized.map(p => this.row(p.ayahId)),
      bookmarks: [...bookmarkIds].sort((a, b) => a - b).map(id => this.row(id)),
      notes: notes.map(n => ({ ...this.row(n.ayahId), note: n.text }))
    };
  });

  readonly counts = computed(() => {
    const l = this.lists();
    return { due: l.due.length, memorized: l.memorized.length, bookmarks: l.bookmarks.length, notes: l.notes.length };
  });

  readonly rows = computed(() => this.lists()[this.tab()]);
  readonly visibleRows = computed(() => this.rows().slice(0, this.shown()));

  /** Arabic text of the ayahs on screen, fetched as rows appear */
  readonly texts = signal(new Map<number, Ayah>());
  private requested = new Set<number>();

  constructor() {
    effect(() => {
      for (const row of this.visibleRows()) {
        if (this.requested.has(row.ayahId)) continue;
        this.requested.add(row.ayahId);
        this.quranService.getAyah(row.ayahId).subscribe(ayah => {
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

  emptyFor(tab: Tab): { icon: string; title: string; text: string } {
    switch (tab) {
      case 'due':
        return this.counts().memorized
          ? { icon: 'pi pi-check', title: 'Tout est révisé', text: 'Aucun verset à revoir aujourd\'hui. Revenez demain, ou testez-vous avec un quiz.' }
          : { icon: 'pi pi-refresh', title: 'Rien à réviser', text: 'Les versets que vous mémorisez reviennent ici au bon moment pour être révisés.' };
      case 'memorized':
        return { icon: 'pi pi-check-circle', title: 'Aucun verset mémorisé', text: 'Pendant la lecture, ouvrez le menu d\'un verset (clic droit, appui long ou ⋮) puis « Marquer comme mémorisé ».' };
      case 'bookmarks':
        return { icon: 'pi pi-bookmark', title: 'Aucun signet', text: 'Ajoutez un signet depuis le menu d\'un verset pour le retrouver ici.' };
      case 'notes':
        return { icon: 'pi pi-pencil', title: 'Aucune note', text: 'Écrivez vos réflexions sur un verset depuis son menu, « Ajouter une note ».' };
    }
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  /** Counts as one more review: the verse comes back later, spaced further apart */
  markReviewed(row: Row): void {
    const existing = this.storage.getAyahProgress(row.ayahId);
    this.storage.updateProgress({
      ayahId: row.ayahId,
      surahId: row.surahId ?? existing?.surahId ?? 0,
      reviewCount: (existing?.reviewCount ?? 0) + 1
    });
  }

  unmarkMemorized(row: Row): void {
    this.storage.updateProgress({ ayahId: row.ayahId, memorized: false });
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

  readonly arabicNumber = arabicNumber;
  readonly displayText = ayahDisplayText;

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
    return t === 'memorized' || t === 'bookmarks' || t === 'notes' ? t : 'due';
  }
}
