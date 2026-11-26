import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { QuranService } from '../../services/quran.service';
import { AudioService } from '../../services/audio.service';
import { RepeatService } from '../../services/repeat.service';
import { StorageService } from '../../services/storage.service';
import { TranslationService } from '../../services/translation.service';
import { SurahDTO, Ayah, RepeatConfig, RepeatMode, RepeatStyle, PlayerState, AyahTranslation } from '../../models';
import { RepeatControlsComponent } from '../../components/repeat-controls/repeat-controls.component';
import { AudioPlayerComponent } from "../../components/audio-player/audio-player.component";
import { combineLatest, take, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-surah-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    ProgressBarModule,
    SelectModule,
    MenuModule,
    DialogModule,
    TextareaModule,
    AudioPlayerComponent,
    RepeatControlsComponent
  ],
  templateUrl: './surah-detail.component.html',
  styleUrls: ['./surah-detail.component.css']
})
export class SurahDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild('repeatControls') repeatControls!: RepeatControlsComponent;

  surah: SurahDTO | null = null;
  surahId: number = 0;
  loading = true;
  selectedAyahId: number | null = null;

  private savedPageFromUrl: number | null = null;

  currentPage: number = 0;
  currentAyahs: Ayah[] = [];
  loadingPage = false;

  // Selection mode for ayah repeat
  selectedAyahs: Set<number> = new Set();
  isSelectionMode: boolean = false;

  // Add to existing properties:
  selectedAyahsList: Ayah[] = [];   // ordered list passed to AudioPlayer

  reciters: string[] = [];
  selectedReciter: string = 'minshawi';
  reciterOptions: { label: string; value: string }[] = [];
  availableReciters = ['minshawi', 'maher_al_muaiqly']; // Only reciters with actual audio files

  RepeatMode = RepeatMode;

  // Currently playing ayah tracking
  currentlyPlayingAyahId: number | null = null;
  playerState: PlayerState | null = null;

  // Context menu for ayah interactions
  contextMenuAyah: Ayah | null = null;
  contextMenuItems: any[] = [];

  // Notes dialog
  showNotesDialog = false;
  notesAyah: Ayah | null = null;
  notesText = '';

  // Bookmark state
  bookmarkedAyahs: Set<number> = new Set();

  // Translation state
  translations = new Map<number, AyahTranslation>();
  selectedLanguage: 'en' | 'fr' | 'de' = 'fr';
  showTranslations: boolean = true;
  showWordMeanings: boolean = false;
  showTafsir: boolean = false;
  expandedTafsirAyahId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quranService: QuranService,
    private audioService: AudioService,
    private repeatService: RepeatService,
    private storageService: StorageService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Read surahId + optional ?page= together so we never miss the query param
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(take(1))
      .subscribe(([params, queryParams]) => {
        this.surahId = +params['id'];
        this.savedPageFromUrl = queryParams['page'] ? +queryParams['page'] : null;
        this.loadSurah();
      });

    // Still react to surah navigation (prev/next surah links)
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const newId = +params['id'];
      if (newId !== this.surahId) {
        this.surahId = newId;
        this.savedPageFromUrl = null;
        this.loadSurah();
      }
    });

    // Auto-navigation driven by RepeatService (surah repeat mode)
    this.repeatService.pageNavigation$.pipe(takeUntil(this.destroy$)).subscribe(direction => {
      if (direction === 'next') this.goToNextPage();
      if (direction === 'prev') this.goToPreviousPage();
    });

    // Subscribe to player state to track currently playing ayah
    this.audioService.playerState$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.playerState = state;
      this.currentlyPlayingAyahId = state.currentAyah?.id ?? null;
      this.cdr.detectChanges();
    });

    // Load bookmarks
    this.loadBookmarks();

    // Load translation settings
    this.loadTranslationSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── REPLACE loadSurah ───────────────────────────────────────────────────────
  loadSurah(): void {
    this.loading = true;
    this.quranService.getSurah(this.surahId).subscribe({
      next: (surah) => {
        if (!surah) { this.loading = false; return; }
        this.surah = surah;
        const start  = surah.startingPage ?? 1;
        const end    = surah.endingPage   ?? 604;

        // Restore from URL if valid for this surah, else use surah's first page
        const restored = this.savedPageFromUrl;
        this.currentPage = (restored && restored >= start && restored <= end)
          ? restored
          : start;

        this.loadPage(this.currentPage);
        this.loadSurahTranslations();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading surah:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ── REPLACE loadPage ────────────────────────────────────────────────────────
  loadPage(pageNumber: number): void {
    this.loadingPage = true;
    this.quranService.getSurahPage(this.surahId, pageNumber).subscribe({
      next: (ayahs) => {
        this.currentAyahs = ayahs.sort((a, b) => a.id - b.id);

        if (this.shouldShowBismillah()) {
          this.currentAyahs[0] = {
            ...this.currentAyahs[0],
            text: this.removeBismillah(this.currentAyahs[0].text)
          };
        }

        this.loading      = false;
        this.loadingPage  = false;

        // Persist current page in the URL (replaceUrl keeps history clean)
        this.updatePageUrl();

        // Hand new ayahs to RepeatService if it is waiting for them
        if (this.repeatService.getState().mode === RepeatMode.SURAH) {
          this.repeatService.updatePageAyahs(ayahs);
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(`Error loading page ${pageNumber}:`, error);
        this.loading      = false;
        this.loadingPage  = false;

        // Page failed to load during repeat → stop gracefully
        if (this.repeatService.getState().mode === RepeatMode.SURAH) {
          this.repeatService.stop();
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ── REPLACE goToNextPage ────────────────────────────────────────────────────
  goToNextPage(): void {
    if (this.surah && this.currentPage < (this.surah.endingPage ?? 0)) {
      this.currentPage++;
      this.loadPage(this.currentPage);
    } else {
      // End of surah reached — stop repeat if running
      if (this.repeatService.getState().mode === RepeatMode.SURAH) {
        this.repeatService.stop();
      }
    }
  }

  goToPreviousPage(): void {
    if (this.surah && this.currentPage > (this.surah.startingPage || 0)) {
      this.currentPage--;
      this.loadPage(this.currentPage);
    }
  }

  // ── ADD private helper ──────────────────────────────────────────────────────
  private updatePageUrl(): void {
    this.router.navigate([], {
      relativeTo:          this.route,
      queryParams:         { page: this.currentPage },
      queryParamsHandling: 'merge',
      replaceUrl:          true        // no extra entries in browser history
    });
  }

  canGoToNextPage(): boolean {
    return this.surah ? this.currentPage < (this.surah.endingPage || 0) : false;
  }

  canGoToPreviousPage(): boolean {
    return this.surah ? this.currentPage > (this.surah.startingPage || 0) : false;
  }

  // Called by AudioPlayer's (selectionModeChange) output
  onSelectionModeChange(active: boolean): void {
    this.isSelectionMode = active;
    if (!active) {
      this.selectedAyahs.clear();
      this.selectedAyahsList = [];
    }
  }

  shouldShowBismillah(): boolean {
    if (!this.surah || !this.currentAyahs.length) return false;

    // Don't show Bismillah for Al-Fatiha (1) on first page or At-Tawbah (9)
    if (this.surahId === 1 || this.surahId === 9) return false;

    // Show Bismillah only on the first page of the Surah
    return this.currentPage === this.surah.startingPage;
  }

  private removeBismillah(text: string): string {
    // Bismillah arabe avec variantes Unicode possibles
    const bismillahRegex =
      /^بِسۡمِ\s*ٱللَّهِ\s*ٱلرَّحۡمَـٰنِ\s*ٱلرَّحِیمِ\s*/u;

    return text.replace(bismillahRegex, '');
  }

  convertToArabicNumber(num: number): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
  }

  // Update toggleAyahSelection to also maintain the ordered list:
  toggleAyahSelection(ayahId: number): void {
    if (!this.isSelectionMode) return;

    if (this.selectedAyahs.has(ayahId)) {
      this.selectedAyahs.delete(ayahId);
      this.selectedAyahsList = this.selectedAyahsList.filter(a => a.id !== ayahId);
    } else {
      this.selectedAyahs.add(ayahId);
      const ayah = this.currentAyahs.find(a => a.id === ayahId);
      if (ayah) this.selectedAyahsList.push(ayah);
    }
  }

  isAyahSelected(ayahId: number): boolean {
    return this.selectedAyahs.has(ayahId);
  }

  onToggleFavorite(ayahId: number): void {
    this.storageService.toggleFavorite(ayahId);
  }

  onToggleMemorized(ayahId: number): void {
    const ayah = this.surah?.ayahs.find(a => a.id === ayahId);
    if (ayah) {
      const progress = this.storageService.getAyahProgress(ayahId);
      if (progress?.memorized) {
        // Already memorized, unmark it
        this.storageService.updateProgress({
          ayahId,
          surahId: ayah.surahId,
          memorized: false
        });
      } else {
        // Mark as memorized
        this.storageService.markAsMemorized(ayahId, ayah.surahId);
      }
    }
  }

  isAyahMemorized(ayahId: number): boolean {
    const progress = this.storageService.getAyahProgress(ayahId);
    return progress?.memorized || false;
  }

  navigateToSurah(direction: 'prev' | 'next'): void {
    const newId = direction === 'prev' ? this.surahId - 1 : this.surahId + 1;
    if (newId >= 1 && newId <= 114) {
      this.router.navigate(['/surah', newId]);
    }
  }

  get memorizedPercentage(): number {
    if (!this.surah) return 0;
    return (this.memorizedCount / this.surah.numberOfAyahs) * 100;
  }

  get memorizedCount(): number {
    if (!this.currentAyahs.length) return 0;

    return this.currentAyahs.filter(ayah =>
      this.isAyahMemorized(ayah.id)
    ).length;
  }

  jumpToPage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const page = +input.value;

    const start = this.surah?.startingPage ?? 1;
    const end   = this.surah?.endingPage   ?? 604;

    if (!page || page < start || page > end) {
      input.value = String(this.currentPage);
      return;
    }

    if (page === this.currentPage) return;

    this.currentPage = page;
    this.loadPage(page);
  }

  // ─── Ayah Interactions ─────────────────────────────────────────────────────

  onAyahClick(ayah: Ayah, event: MouseEvent): void {
    if (this.isSelectionMode) {
      this.toggleAyahSelection(ayah.id);
      return;
    }

    // Tap-to-play: load and play this ayah
    this.playAyah(ayah);
  }

  playAyah(ayah: Ayah): void {
    this.audioService.loadAyah(ayah);
    this.audioService.play();
  }

  isAyahPlaying(ayahId: number): boolean {
    return this.currentlyPlayingAyahId === ayahId && (this.playerState?.isPlaying ?? false);
  }

  isCurrentAyah(ayahId: number): boolean {
    return this.currentlyPlayingAyahId === ayahId;
  }

  // ─── Context Menu (long-press / right-click) ───────────────────────────────

  onAyahContextMenu(ayah: Ayah, event: MouseEvent): void {
    event.preventDefault();
    this.contextMenuAyah = ayah;
    this.buildContextMenu(ayah);
  }

  private buildContextMenu(ayah: Ayah): void {
    const isBookmarked = this.isAyahBookmarked(ayah.id);
    const isMemorized = this.isAyahMemorized(ayah.id);

    this.contextMenuItems = [
      {
        label: 'Écouter',
        icon: 'pi pi-play',
        command: () => this.playAyah(ayah)
      },
      {
        label: 'Répéter cette ayah',
        icon: 'pi pi-sync',
        command: () => this.repeatSingleAyah(ayah)
      },
      { separator: true },
      {
        label: isBookmarked ? 'Retirer le signet' : 'Ajouter un signet',
        icon: isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark',
        command: () => this.toggleBookmark(ayah.id)
      },
      {
        label: 'Ajouter une note',
        icon: 'pi pi-pencil',
        command: () => this.openNotesDialog(ayah)
      },
      { separator: true },
      {
        label: isMemorized ? 'Retirer mémorisé' : 'Marquer comme mémorisé',
        icon: isMemorized ? 'pi pi-star-fill' : 'pi pi-star',
        command: () => this.onToggleMemorized(ayah.id)
      }
    ];
  }

  repeatSingleAyah(ayah: Ayah): void {
    const config: RepeatConfig = {
      count: 3,
      pauseDuration: 2,
      audioType: 'recitation',
      reciter: 'minshawi',
      repeatStyle: RepeatStyle.PER_AYAH
    };
    this.repeatService.repeatAyah(ayah, config);
  }

  // ─── Bookmarks ─────────────────────────────────────────────────────────────

  loadBookmarks(): void {
    const bookmarks = this.storageService.getBookmarks();
    this.bookmarkedAyahs = new Set(bookmarks.map(b => b.ayahId));
  }

  toggleBookmark(ayahId: number): void {
    if (this.bookmarkedAyahs.has(ayahId)) {
      this.storageService.removeBookmark(ayahId);
      this.bookmarkedAyahs.delete(ayahId);
    } else {
      this.storageService.addBookmark(ayahId);
      this.bookmarkedAyahs.add(ayahId);
    }
  }

  isAyahBookmarked(ayahId: number): boolean {
    return this.bookmarkedAyahs.has(ayahId);
  }

  // ─── Notes Dialog ──────────────────────────────────────────────────────────

  openNotesDialog(ayah: Ayah): void {
    this.notesAyah = ayah;
    const existingNote = this.storageService.getNote(ayah.id);
    this.notesText = existingNote || '';
    this.showNotesDialog = true;
  }

  saveNote(): void {
    if (this.notesAyah) {
      if (this.notesText.trim()) {
        this.storageService.saveNote(this.notesAyah.id, this.notesText.trim());
      } else {
        this.storageService.removeNote(this.notesAyah.id);
      }
    }
    this.closeNotesDialog();
  }

  closeNotesDialog(): void {
    this.showNotesDialog = false;
    this.notesAyah = null;
    this.notesText = '';
  }

  hasNote(ayahId: number): boolean {
    return !!this.storageService.getNote(ayahId);
  }

  // ─── Translation Methods ────────────────────────────────────────────────────

  loadSurahTranslations(): void {
    this.translationService.getSurahTranslations(this.surahId).subscribe({
      next: (translations) => {
        this.translations = translations;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading translations:', error);
      }
    });
  }

  getTranslation(ayahId: number): AyahTranslation | undefined {
    return this.translations.get(ayahId);
  }

  onLanguageChange(lang: 'en' | 'fr' | 'de'): void {
    this.selectedLanguage = lang;
    this.saveTranslationSettings();
  }

  toggleTranslations(): void {
    this.showTranslations = !this.showTranslations;
    this.saveTranslationSettings();
  }

  toggleWordMeanings(): void {
    this.showWordMeanings = !this.showWordMeanings;
    this.saveTranslationSettings();
  }

  toggleTafsir(): void {
    this.showTafsir = !this.showTafsir;
    this.saveTranslationSettings();
  }

  expandTafsir(ayahId: number): void {
    this.expandedTafsirAyahId = this.expandedTafsirAyahId === ayahId ? null : ayahId;
  }

  private loadTranslationSettings(): void {
    const settings = localStorage.getItem('translationSettings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.selectedLanguage = parsed.primaryLanguage || 'fr';
        this.showTranslations = parsed.showTranslation ?? true;
        this.showWordMeanings = parsed.showWordMeanings ?? false;
        this.showTafsir = parsed.showTafsir ?? false;
      } catch (e) {
        console.error('Error parsing translation settings:', e);
      }
    }
  }

  private saveTranslationSettings(): void {
    const settings = {
      primaryLanguage: this.selectedLanguage,
      showTranslation: this.showTranslations,
      showWordMeanings: this.showWordMeanings,
      showTafsir: this.showTafsir
    };
    localStorage.setItem('translationSettings', JSON.stringify(settings));
  }
}
