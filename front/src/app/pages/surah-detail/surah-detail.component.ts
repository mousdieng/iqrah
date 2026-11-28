import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, HostBinding, HostListener, inject } from '@angular/core';
import { MemorizeService } from '../../services/memorize.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { ayahWords, firstLetterHint, isMark } from '../../shared/quran-text';
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
import { ReadingHistoryService } from '../../services/reading-history.service';
import { SurahDTO, Ayah, RepeatConfig, RepeatMode, RepeatStyle, PlayerState, AyahTranslation } from '../../models';
import { AudioPlayerComponent } from "../../components/audio-player/audio-player.component";
import { combineLatest, take, Subject, takeUntil } from 'rxjs';

/** 'mushaf': the printed page as in the Quran; 'study': ayah cards with every translation detail */
export type ViewMode = 'mushaf' | 'study';
type Lang = 'en' | 'fr' | 'de';

/** A run of consecutive ayahs of one surah on a Mushaf page */
interface PageBlock {
  surahId: number;
  surah?: SurahDTO;
  startsSurah: boolean;   // the surah's first ayah is on this page → draw its title banner
  showBasmala: boolean;   // Basmala line above ayah 1 (not for Al-Fatiha, where it is ayah 1, nor At-Tawbah)
  ayahs: Ayah[];
}

const VIEW_MODE_KEY = 'surahViewMode';
const TEXT_SCALE_KEY = 'iqrah_text_scale';
const MEMO_READER_KEY = 'iqrah_memo_reader';

/** Hide-text mode: hidden words as blank bars, or only their first letter */
type MemoStyle = 'hide' | 'letters';
const TEXT_SCALE_MIN = 0.8;
const TEXT_SCALE_MAX = 2;
const TEXT_SCALE_STEP = 0.1;
const STUDY_SETTINGS_KEY = 'studyViewSettings';

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
    AudioPlayerComponent
  ],
  templateUrl: './surah-detail.component.html',
  styleUrls: ['./surah-detail.component.css', './surah-detail.views.css']
})
export class SurahDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild(AudioPlayerComponent) private audioPlayer?: AudioPlayerComponent;
  readonly memorize = inject(MemorizeService);
  private catalog = inject(SurahCatalogService);

  // ─── Hide-text (memorization) mode ─────────────────────────────────────────
  memoMode = false;
  memoStyle: MemoStyle = 'hide';
  /** Words revealed so far per ayah (Infinity = whole ayah) */
  private revealedWords = new Map<number, number>();
  private wordsCache = new Map<number, { text: string; words: string[] }>();

  // Marking many verses at once
  bulkOpen = false;
  bulkFrom = 1;
  bulkTo = 1;
  bulkMessage = '';

  /** Reading text size (Arabic, translations, tafsir), 1 = default; drives --text-scale in the CSS */
  textScale = SurahDetailComponent.loadTextScale();
  @HostBinding('style.--text-scale') get textScaleVar(): number { return this.textScale; }
  readonly textScaleMin = TEXT_SCALE_MIN;
  readonly textScaleMax = TEXT_SCALE_MAX;

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

  // View mode
  viewMode: ViewMode = 'mushaf';

  /** Ayah to highlight and scroll to, from ?ayah= (global ayah id) */
  focusAyahId: number | null = null;

  // Mushaf page: every ayah printed on the current page, across surahs
  pageAyahs: Ayah[] = [];
  pageBlocks: PageBlock[] = [];
  private quarterStartIds = new Set<number>();   // ayahs that open a new hizb quarter (۞)
  private surahIndex = new Map<number, SurahDTO>();
  private pageRequest = 0;                        // ignores late responses after fast page changes

  // Study mode: translation data and which sections are shown
  translations = new Map<number, AyahTranslation>();
  selectedLanguage: Lang = 'fr';
  showTranslations = true;
  showWordMeanings = true;
  showTafsir = true;
  showAyahInfo = true;
  readonly languages: { code: Lang; label: string }[] = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quranService: QuranService,
    private audioService: AudioService,
    private repeatService: RepeatService,
    private storageService: StorageService,
    private translationService: TranslationService,
    private readingHistory: ReadingHistoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Read surahId + optional ?page= together so we never miss the query param
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(take(1))
      .subscribe(([params, queryParams]) => {
        this.surahId = +params['id'];
        this.savedPageFromUrl = queryParams['page'] ? +queryParams['page'] : null;
        this.focusAyahId = queryParams['ayah'] ? +queryParams['ayah'] : null;
        const memo = this.loadMemoSettings();
        this.memoStyle = memo.style;
        this.memoMode = queryParams['memo'] === '1' ? true : memo.on;
        const urlMode = queryParams['mode'];
        const storedMode = localStorage.getItem(VIEW_MODE_KEY);
        this.viewMode = this.isViewMode(urlMode) ? urlMode
          : this.isViewMode(storedMode) ? storedMode
          : 'mushaf';
        this.loadSurah();
      });

    // Surah names and details for the title banners of every surah that appears on a page
    this.quranService.getAllSurahs().pipe(takeUntil(this.destroy$)).subscribe(surahs => {
      surahs.forEach(s => this.surahIndex.set(s.number, s));
      this.buildPageBlocks();
      this.cdr.detectChanges();
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
      const previousId = this.currentlyPlayingAyahId;
      this.playerState = state;
      this.currentlyPlayingAyahId = state.currentAyah?.id ?? null;
      this.cdr.detectChanges();
      if (this.currentlyPlayingAyahId && this.currentlyPlayingAyahId !== previousId) {
        this.scrollToPlayingAyah(this.currentlyPlayingAyahId);
      }
    });

    // Load bookmarks
    this.loadBookmarks();

    // Load study view settings
    this.loadStudySettings();
  }

  ngOnDestroy(): void {
    this.repeatService.stop();
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

        // Opened on a specific ayah (e.g. from Mémoriser) without a page: find the page that holds it first
        if (this.focusAyahId && !restored) {
          this.quranService.getAyah(this.focusAyahId).subscribe(ayah => {
            if (ayah?.page && ayah.page >= start && ayah.page <= end) this.currentPage = ayah.page;
            this.loadPage(this.currentPage);
          });
        } else {
          this.loadPage(this.currentPage);
        }
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
    const request = ++this.pageRequest;

    // The whole Mushaf page: it can end the previous surah or start the next one
    this.quranService.getPage(pageNumber).subscribe({
      next: (pageAyahs) => {
        if (request !== this.pageRequest) return;

        const sorted = [...pageAyahs].sort((a, b) => a.id - b.id);
        const surahAyahs = sorted.filter(a => a.surahId === this.surahId);

        // Ayah 1 of most surahs starts with the Basmala; it is shown on its own line instead
        this.pageAyahs = sorted.map(a => this.startsWithBasmala(a)
          ? { ...a, text: this.removeBismillah(a.text) }
          : a);
        this.currentAyahs = this.pageAyahs.filter(a => a.surahId === this.surahId);
        this.buildPageBlocks();
        this.loadQuarterMarks(request);

        this.loading      = false;
        this.loadingPage  = false;

        // Persist current page in the URL (replaceUrl keeps history clean) and for "Reprendre la lecture"
        this.updatePageUrl();
        this.readingHistory.record(this.surahId, pageNumber);
        this.scrollToFocusedAyah();

        // Listening/repeat that turns pages on its own: hand it the new page's ayahs
        if (this.repeatService.isAwaitingPage()) {
          if (surahAyahs.length) {
            this.repeatService.updatePageAyahs(this.currentAyahs);
          } else {
            this.repeatService.stop();
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        if (request !== this.pageRequest) return;
        console.error(`Error loading page ${pageNumber}:`, error);
        this.loading      = false;
        this.loadingPage  = false;

        // Page failed to load during repeat → stop gracefully
        if (this.repeatService.isAwaitingPage()) {
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
      // End of surah reached — stop the listening/repeat session that asked for the page
      if (this.repeatService.isAwaitingPage()) {
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
      queryParams:         { page: this.currentPage, mode: this.viewMode },
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

  /** Ayah 1 of every surah except Al-Fatiha (where it is the ayah itself) and At-Tawbah (none) */
  private startsWithBasmala(ayah: Ayah): boolean {
    return ayah.numberInSurah === 1 && ayah.surahId !== 1 && ayah.surahId !== 9;
  }

  // ─── Text size ─────────────────────────────────────────────────────────────

  private static loadTextScale(): number {
    const stored = parseFloat(localStorage.getItem(TEXT_SCALE_KEY) ?? '');
    return isFinite(stored) ? Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, stored)) : 1;
  }

  changeTextScale(direction: 1 | -1): void {
    this.setTextScale(this.textScale + direction * TEXT_SCALE_STEP);
  }

  resetTextScale(): void {
    this.setTextScale(1);
  }

  private setTextScale(value: number): void {
    const next = Math.round(Math.min(TEXT_SCALE_MAX, Math.max(TEXT_SCALE_MIN, value)) * 10) / 10;
    if (next === this.textScale) return;
    this.textScale = next;
    localStorage.setItem(TEXT_SCALE_KEY, String(next));
    this.cdr.markForCheck();
  }

  get textScalePercent(): number {
    return Math.round(this.textScale * 100);
  }

  /** "+" / "-" enlarge or reduce the text (not while typing) */
  @HostListener('document:keydown', ['$event'])
  onTextSizeKey(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); this.changeTextScale(1); }
    else if (event.key === '-' || event.key === '_') { event.preventDefault(); this.changeTextScale(-1); }
  }

  // ─── View mode ─────────────────────────────────────────────────────────────

  private isViewMode(value: unknown): value is ViewMode {
    return value === 'mushaf' || value === 'study';
  }

  setViewMode(mode: ViewMode): void {
    if (mode === this.viewMode) return;
    this.viewMode = mode;
    localStorage.setItem(VIEW_MODE_KEY, mode);
    this.updatePageUrl();
  }

  // ─── Mushaf page layout ────────────────────────────────────────────────────

  /** Groups the page's ayahs by surah so each new surah gets its title banner and Basmala */
  private buildPageBlocks(): void {
    const blocks: PageBlock[] = [];
    for (const ayah of this.pageAyahs) {
      let block = blocks[blocks.length - 1];
      if (!block || block.surahId !== ayah.surahId) {
        const startsSurah = ayah.numberInSurah === 1;
        block = {
          surahId: ayah.surahId,
          surah: this.surahIndex.get(ayah.surahId),
          startsSurah,
          showBasmala: startsSurah && this.startsWithBasmala(ayah),
          ayahs: []
        };
        blocks.push(block);
      }
      block.ayahs.push(ayah);
    }
    this.pageBlocks = blocks;
  }

  /**
   * Marks the ayahs that open a new hizb quarter (shown with ۞).
   * The first ayah of the page is compared with the ayah just before it, on the previous page.
   */
  private loadQuarterMarks(request: number): void {
    const first = this.pageAyahs[0];
    if (!first) { this.quarterStartIds = new Set(); return; }

    const mark = (previousQuarter: number | null) => {
      const ids = new Set<number>();
      let last = previousQuarter ?? first.hizbQuarter;
      for (const ayah of this.pageAyahs) {
        if (ayah.hizbQuarter !== last) ids.add(ayah.id);
        last = ayah.hizbQuarter;
      }
      this.quarterStartIds = ids;
    };

    mark(null);
    if (first.id > 1) {
      this.quranService.getAyah(first.id - 1).subscribe(prev => {
        if (request !== this.pageRequest || !prev) return;
        mark(prev.hizbQuarter);
        this.cdr.detectChanges();
      });
    }
  }

  /** Brings the ?ayah= ayah into view once its page is rendered */
  private scrollToFocusedAyah(): void {
    const id = this.focusAyahId;
    if (!id || !this.pageAyahs.some(a => a.id === id)) return;
    this.cdr.detectChanges();
    requestAnimationFrame(() => {
      document.querySelector(`[data-ayah-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  isQuarterStart(ayahId: number): boolean {
    return this.quarterStartIds.has(ayahId);
  }

  /** Juz printed in the page header (the juz the page opens in) */
  get pageJuz(): number | null {
    return this.pageAyahs[0]?.juz ?? null;
  }

  /** Names of the surahs printed on the page, for the page header */
  get pageSurahNames(): string {
    return this.pageBlocks
      .map(b => b.surah?.name ?? '')
      .filter(name => !!name)
      .join(' - ');
  }

  hizbLabel(hizbQuarter: number): string {
    const hizb = Math.ceil(hizbQuarter / 4);
    const part = ['', '¼', '½', '¾'][(hizbQuarter - 1) % 4];
    return part ? `${hizb} ${part}` : `${hizb}`;
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

  /** Uses the ayah itself (the surah endpoint does not return its ayahs, so they can't be looked up there) */
  onToggleMemorized(ayah: Ayah): void {
    if (this.memorize.isMemorized(ayah.id)) {
      this.memorize.unmarkMemorized([ayah.id]);
    } else {
      this.memorize.markMemorized([{ ayahId: ayah.id, surahId: ayah.surahId }]);
    }
  }

  isAyahMemorized(ayahId: number): boolean {
    return this.memorize.isMemorized(ayahId);
  }

  /** Verses of this surah marked as memorized */
  get surahMemorizedCount(): number {
    const first = this.catalog.firstAyahId(this.surahId);
    if (!first || !this.surah) return 0;
    const last = first + this.surah.numberOfAyahs - 1;
    let count = 0;
    for (const id of this.memorize.memorizedIds()) if (id >= first && id <= last) count++;
    return count;
  }

  // ─── Hide-text mode ────────────────────────────────────────────────────────

  toggleMemoMode(): void {
    this.memoMode = !this.memoMode;
    this.revealedWords.clear();
    this.bulkOpen = false;
    this.saveMemoSettings();
  }

  setMemoStyle(style: MemoStyle): void {
    this.memoStyle = style;
    this.saveMemoSettings();
  }

  /** Words of the ayah, each hidden, shown as its first letter, or revealed */
  memoWords(ayah: Ayah): { text: string; hidden: boolean; hint: boolean }[] {
    let cached = this.wordsCache.get(ayah.id);
    if (!cached || cached.text !== ayah.text) {
      cached = { text: ayah.text, words: ayahWords(ayah.text) };
      this.wordsCache.set(ayah.id, cached);
    }
    const shown = this.revealedWords.get(ayah.id) ?? 0;
    let wordIndex = 0;
    return cached.words.map(word => {
      if (isMark(word)) return { text: word, hidden: false, hint: false };
      const visible = wordIndex++ < shown;
      if (visible) return { text: word, hidden: false, hint: false };
      return this.memoStyle === 'letters'
        ? { text: firstLetterHint(word), hidden: false, hint: true }
        : { text: word, hidden: true, hint: false };
    });
  }

  isAyahRevealed(ayahId: number): boolean {
    return (this.revealedWords.get(ayahId) ?? 0) === Infinity;
  }

  /** Tap: one more word; once the whole verse is shown, hides it again */
  private revealNextWord(ayah: Ayah): void {
    const total = this.memoWords(ayah).filter(w => w.hidden || w.hint).length;
    const shown = this.revealedWords.get(ayah.id) ?? 0;
    if (shown === Infinity || total === 0) {
      this.revealedWords.delete(ayah.id);
    } else {
      this.revealedWords.set(ayah.id, total <= 1 ? Infinity : shown + 1);
    }
  }

  onAyahDblClick(ayah: Ayah): void {
    if (!this.memoMode || this.isSelectionMode) return;
    this.revealedWords.set(ayah.id, Infinity);
  }

  revealAll(): void {
    for (const a of this.pageAyahs) this.revealedWords.set(a.id, Infinity);
  }

  hideAll(): void {
    this.revealedWords.clear();
  }

  private loadMemoSettings(): { on: boolean; style: MemoStyle } {
    try {
      const s = JSON.parse(localStorage.getItem(MEMO_READER_KEY) || '{}');
      return { on: !!s.on, style: s.style === 'letters' ? 'letters' : 'hide' };
    } catch {
      return { on: false, style: 'hide' };
    }
  }

  private saveMemoSettings(): void {
    localStorage.setItem(MEMO_READER_KEY, JSON.stringify({ on: this.memoMode, style: this.memoStyle }));
  }

  // ─── Mark many verses ──────────────────────────────────────────────────────

  openBulk(): void {
    this.bulkOpen = !this.bulkOpen;
    this.bulkMessage = '';
    if (this.bulkOpen) this.bulkThisPage();
  }

  bulkThisPage(): void {
    if (!this.currentAyahs.length) return;
    this.bulkFrom = this.currentAyahs[0].numberInSurah;
    this.bulkTo = this.currentAyahs[this.currentAyahs.length - 1].numberInSurah;
  }

  bulkWholeSurah(): void {
    this.bulkFrom = 1;
    this.bulkTo = this.surah?.numberOfAyahs ?? 1;
  }

  /** Marks (or unmarks) verses bulkFrom..bulkTo of this surah */
  applyBulk(memorized: boolean): void {
    const first = this.catalog.firstAyahId(this.surahId);
    const total = this.surah?.numberOfAyahs ?? 0;
    if (!first || !total) return;
    const from = Math.max(1, Math.min(total, Math.round(Math.min(this.bulkFrom, this.bulkTo))));
    const to = Math.max(1, Math.min(total, Math.round(Math.max(this.bulkFrom, this.bulkTo))));
    const items = [];
    for (let n = from; n <= to; n++) items.push({ ayahId: first + n - 1, surahId: this.surahId });
    const range = from === to ? `Verset ${from}` : `Versets ${from} à ${to}`;
    if (memorized) {
      const added = this.memorize.markMemorized(items);
      this.bulkMessage = added ? `${range} : ${added} marqué${added > 1 ? 's' : ''} comme mémorisé${added > 1 ? 's' : ''}.` : `${range} : déjà mémorisé${items.length > 1 ? 's' : ''}.`;
    } else {
      this.memorize.unmarkMemorized(items.map(i => i.ayahId));
      this.bulkMessage = `${range} : retiré${items.length > 1 ? 's' : ''} des mémorisés.`;
    }
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

    // Hide-text mode: a tap reveals the next word instead of playing
    if (this.memoMode) {
      this.revealNextWord(ayah);
      return;
    }

    // Tap-to-play: load and play this ayah
    this.playAyah(ayah);
  }

  /** Plays the tapped ayah with the player's "Ce verset" settings (times, pause), then stops */
  playAyah(ayah: Ayah): void {
    this.audioPlayer?.playVerse(ayah);
  }

  /** Keeps the verse being recited visible above the player bar */
  private scrollToPlayingAyah(id: number): void {
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-ayah-id="${id}"]`) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const playerHeight = (document.querySelector('app-audio-player .player') as HTMLElement | null)?.offsetHeight ?? 0;
      const visibleBottom = window.innerHeight - playerHeight;
      if (rect.top < 80 || rect.bottom > visibleBottom) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
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
        label: 'Écouter / répéter',
        icon: 'pi pi-play',
        command: () => this.playAyah(ayah)
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
        command: () => this.onToggleMemorized(ayah)
      }
    ];
  }

  repeatSingleAyah(ayah: Ayah): void {
    this.audioPlayer?.playVerse(ayah);
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

  /** True when the surah has translation data (it is only available for some surahs so far) */
  get hasTranslationData(): boolean {
    return this.translations.size > 0;
  }

  /** All languages of an ayah, the chosen language first */
  orderedTranslations(ayahId: number): { code: Lang; label: string; text: string; translator?: string }[] {
    const data = this.getTranslation(ayahId)?.translations;
    if (!data) return [];
    const order = [this.selectedLanguage, ...this.languages.map(l => l.code).filter(c => c !== this.selectedLanguage)];
    return order
      .filter(code => data[code]?.text)
      .map(code => ({
        code,
        label: this.languages.find(l => l.code === code)?.label ?? code,
        text: data[code].text,
        translator: data[code].translator
      }));
  }

  onLanguageChange(lang: Lang): void {
    this.selectedLanguage = lang;
    this.saveStudySettings();
  }

  toggleSection(section: 'translations' | 'wordMeanings' | 'tafsir' | 'ayahInfo'): void {
    switch (section) {
      case 'translations': this.showTranslations = !this.showTranslations; break;
      case 'wordMeanings': this.showWordMeanings = !this.showWordMeanings; break;
      case 'tafsir':       this.showTafsir       = !this.showTafsir;       break;
      case 'ayahInfo':     this.showAyahInfo     = !this.showAyahInfo;     break;
    }
    this.saveStudySettings();
  }

  private loadStudySettings(): void {
    const settings = localStorage.getItem(STUDY_SETTINGS_KEY);
    if (!settings) return;
    try {
      const parsed = JSON.parse(settings);
      if (['en', 'fr', 'de'].includes(parsed.language)) this.selectedLanguage = parsed.language;
      this.showTranslations = parsed.showTranslations ?? true;
      this.showWordMeanings = parsed.showWordMeanings ?? true;
      this.showTafsir       = parsed.showTafsir ?? true;
      this.showAyahInfo     = parsed.showAyahInfo ?? true;
    } catch (e) {
      console.error('Error parsing study view settings:', e);
    }
  }

  private saveStudySettings(): void {
    localStorage.setItem(STUDY_SETTINGS_KEY, JSON.stringify({
      language:         this.selectedLanguage,
      showTranslations: this.showTranslations,
      showWordMeanings: this.showWordMeanings,
      showTafsir:       this.showTafsir,
      showAyahInfo:     this.showAyahInfo
    }));
  }
}
