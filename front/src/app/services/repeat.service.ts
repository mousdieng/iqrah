import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Ayah, RepeatConfig, RepeatMode, RepeatState, RepeatStyle } from '../models';
import { AudioService } from './audio.service';
import { QuranService } from './quran.service';

@Injectable({
  providedIn: 'root'
})
export class RepeatService {
  private repeatStateSubject = new BehaviorSubject<RepeatState>({
    mode: RepeatMode.NONE,
    repeatStyle: RepeatStyle.WHOLE,
    isActive: false,
    currentIteration: 0,
    totalIterations: 1,
    currentAyahRepetition: 0,
    currentAyahIndex: 0,
    totalAyahs: 0,
    pauseDuration: 0
  });

  public repeatState$ = this.repeatStateSubject.asObservable();

  private pageNavigationSubject = new Subject<'next' | 'prev'>();
  public pageNavigation$ = this.pageNavigationSubject.asObservable();

  private pauseSubscription?: Subscription;
  private currentAyahs: Ayah[] = [];
  private currentConfig?: RepeatConfig;
  private awaitingPageLoad = false;

  constructor(
    private audioService: AudioService,
    private quranService: QuranService
  ) {
    // Listen to audio ended events to handle repeat logic
    this.audioService.audioEnded$.subscribe(() => {
      this.handleAudioEnded();
    });
  }

  /** Modes that move to the next page on their own when the page is finished */
  private turnsPages(mode: RepeatMode): boolean {
    return mode === RepeatMode.SURAH || mode === RepeatMode.JUZ || mode === RepeatMode.CONTINUOUS;
  }

  /**
   * Plain listening: play each ayah once, starting at `startIndex` of the page,
   * then continue page after page until the end of the surah.
   */
  playContinuous(pageAyahs: Ayah[], startIndex: number, config: Omit<RepeatConfig, 'count' | 'repeatStyle'>): void {
    if (!pageAyahs.length) return;
    this.cancelPendingNext();
    this.currentAyahs = [...pageAyahs];
    this.currentConfig = { ...config, count: 1, repeatStyle: RepeatStyle.PER_AYAH };
    this.startRepeat(RepeatMode.CONTINUOUS, this.currentConfig, undefined, Math.max(0, Math.min(startIndex, pageAyahs.length - 1)));
  }

  /** Ayahs of the running session (the page's ayahs for page-turning modes) */
  getSessionAyahs(): Ayah[] {
    return this.currentAyahs;
  }

  /** Modes whose whole length is known up front (no page turns): the player can show one timeline for them */
  hasFixedLength(mode: RepeatMode): boolean {
    return mode === RepeatMode.AYAH || mode === RepeatMode.PAGE || mode === RepeatMode.SELECTED || mode === RepeatMode.RANGE;
  }

  /**
   * Position in the session as a "play slot": every single playback of an ayah is one slot.
   * PER_AYAH: a1 a1 a1 a2 a2 a2 …   WHOLE: a1 a2 a3 a1 a2 a3 …
   */
  currentSlot(state: RepeatState = this.repeatStateSubject.value): number {
    return state.repeatStyle === RepeatStyle.PER_AYAH
      ? state.currentAyahIndex * state.totalIterations + state.currentAyahRepetition
      : state.currentIteration * this.currentAyahs.length + state.currentAyahIndex;
  }

  /** The ayah played in a given slot */
  slotAyah(slot: number, state: RepeatState = this.repeatStateSubject.value): Ayah | undefined {
    const n = this.currentAyahs.length;
    if (!n) return undefined;
    return state.repeatStyle === RepeatStyle.PER_AYAH
      ? this.currentAyahs[Math.floor(slot / state.totalIterations)]
      : this.currentAyahs[slot % n];
  }

  /** Jumps to a play slot of the session, `seconds` into that ayah */
  jumpToSlot(slot: number, seconds: number): void {
    const state = this.repeatStateSubject.value;
    if (!state.isActive) return;
    const n = this.currentAyahs.length;
    const total = n * state.totalIterations;
    slot = Math.max(0, Math.min(total - 1, slot));

    if (slot === this.currentSlot(state) && !this.waitingForNext && !this.audioService.isEnded()) {
      this.audioService.seekWhenReady(seconds);
      if (state.paused) this.resume();
      return;
    }

    this.cancelPendingNext();
    this.waitingForNext = false;
    this.audioService.stop();
    const position = state.repeatStyle === RepeatStyle.PER_AYAH
      ? { currentAyahIndex: Math.floor(slot / state.totalIterations), currentAyahRepetition: slot % state.totalIterations }
      : { currentIteration: Math.floor(slot / n), currentAyahIndex: slot % n };
    this.updateState(position);
    this.playCurrentAyah();
    this.audioService.seekWhenReady(seconds);
  }

  /** True while a page change requested by the engine is waiting for the reader to load the new page */
  isAwaitingPage(): boolean {
    return this.awaitingPageLoad;
  }

  /**
   * Start repeating a single Ayah
   */
  repeatAyah(ayah: Ayah, config: RepeatConfig): void {
    this.currentAyahs = [ayah];
    this.currentConfig = { ...config, repeatStyle: RepeatStyle.PER_AYAH }; // Single ayah always per-ayah
    this.startRepeat(RepeatMode.AYAH, this.currentConfig, ayah.id);
  }

  /**
   * Start repeating a Surah
   */
  repeatSurah(pageAyahs: Ayah[], config: RepeatConfig): void {
    if (!pageAyahs.length) return;
    this.currentAyahs = [...pageAyahs];
    this.currentConfig = config;
    this.startRepeat(RepeatMode.SURAH, config);
  }

  /**
   * Update page ayahs when navigating during surah repeat
   */
  updatePageAyahs(ayahs: Ayah[]): void {
    if (!this.awaitingPageLoad) return;
    this.currentAyahs = [...ayahs];
    this.awaitingPageLoad = false;

    this.updateState({
      currentAyahIndex: 0,
      currentAyahRepetition: 0,
      totalAyahs: ayahs.length,
      currentAyah: ayahs[0]
    });

    this.playCurrentAyah();
  }

  /**
   * Start repeating selected Ayahs
   */
  repeatSelected(selectedAyahs: Ayah[], config: RepeatConfig): void {
    if (selectedAyahs && selectedAyahs.length > 0) {
      this.currentAyahs = [...selectedAyahs];
      this.currentConfig = config;
      this.startRepeat(RepeatMode.SELECTED, config);
    }
  }

  /**
   * Start repeating a Page
   */
  repeatPage(pageAyahs: Ayah[], config: RepeatConfig): void {
    if (pageAyahs && pageAyahs.length > 0) {
      this.currentAyahs = [...pageAyahs];
      this.currentConfig = config;
      this.startRepeat(RepeatMode.PAGE, config, pageAyahs[0].page);
    }
  }

  /**
   * Start repeating a Juz (page by page like Surah mode)
   */
  repeatJuz(juzNumber: number, config: RepeatConfig, pageAyahs?: Ayah[]): void {
    this.currentConfig = config;

    if (pageAyahs && pageAyahs.length > 0) {
      // Use provided page ayahs (for page-by-page repeat)
      this.currentAyahs = [...pageAyahs];
      this.startRepeat(RepeatMode.JUZ, config, juzNumber);
    } else {
      // Fallback: load first page of juz
      this.quranService.getJuz(juzNumber).subscribe(ayahs => {
        if (ayahs && ayahs.length > 0) {
          // Get only the first page's ayahs
          const firstPage = ayahs[0].page;
          const firstPageAyahs = ayahs.filter(a => a.page === firstPage);
          this.currentAyahs = [...firstPageAyahs];
          this.startRepeat(RepeatMode.JUZ, config, juzNumber);
        }
      });
    }
  }

  /**
   * Start repeating a range of Ayahs
   */
  repeatRange(from: number, to: number, config: RepeatConfig): void {
    this.currentConfig = config;
    this.quranService.getAyahRange(from, to).subscribe(ayahs => {
      if (ayahs && ayahs.length > 0) {
        this.currentAyahs = [...ayahs];
        this.updateState({ ayahRange: { from, to } });
        this.startRepeat(RepeatMode.RANGE, config);
      }
    });
  }

  /**
   * Start the repeat process
   */
  private startRepeat(mode: RepeatMode, config: RepeatConfig, targetId?: number, startIndex = 0): void {
    if (this.currentAyahs.length === 0) {
      console.warn('No ayahs to repeat');
      return;
    }

    this.cancelPendingNext();
    this.awaitingPageLoad = false;

    // Update state
    this.updateState({
      mode,
      repeatStyle: config.repeatStyle,
      isActive: true,
      paused: false,
      currentIteration: 0,
      totalIterations: config.count,
      currentAyahRepetition: 0,
      currentAyahIndex: startIndex,
      totalAyahs: this.currentAyahs.length,
      pauseDuration: config.pauseDuration,
      targetId,
      currentAyah: this.currentAyahs[startIndex]
    });

    // Configure audio service
    this.audioService.setAutoPlay(false); // We handle auto-play ourselves
    this.audioService.setAudioType(config.audioType);

    if (config.audioType === 'recitation' && config.reciter) {
      this.audioService.setReciter(config.reciter);
    } else if (config.audioType === 'tafsir' && config.tafsir) {
      this.audioService.setTafsir(config.tafsir);
    }

    // Start playing
    this.playCurrentAyah();
  }

  /**
   * Play the current ayah
   */
  private playCurrentAyah(): void {
    const state = this.repeatStateSubject.value;

    if (!state.isActive || state.currentAyahIndex >= this.currentAyahs.length) {
      return;
    }

    const ayah = this.currentAyahs[state.currentAyahIndex];
    this.updateState({ currentAyah: ayah, paused: false });

    // Load ayah with appropriate audio type
    if (this.currentConfig?.audioType === 'recitation') {
      this.audioService.loadAyah(ayah, this.currentConfig.reciter);
    } else {
      this.audioService.loadAyah(ayah, undefined, this.currentConfig?.tafsir);
    }

    this.audioService.play();

    // Get the next ayah ready while this one plays
    if (this.currentConfig?.audioType === 'recitation') {
      const next = this.currentAyahs[state.currentAyahIndex + 1];
      if (next && next.id !== ayah.id) this.audioService.prefetch(next, this.currentConfig.reciter);
    }
  }

  /**
   * Handle when audio ends
   */
  private handleAudioEnded(): void {
    const state = this.repeatStateSubject.value;

    if (!state.isActive || state.paused) {
      return;
    }

    // If there's a pause duration, wait before continuing
    if (state.pauseDuration > 0) {
      this.waitingForNext = true;
      this.pauseSubscription = interval(state.pauseDuration * 1000)
        .pipe(take(1))
        .subscribe(() => {
          this.waitingForNext = false;
          this.continueRepeat();
        });
    } else {
      this.continueRepeat();
    }
  }

  /** True between the end of an ayah and the next one (pause between ayahs) */
  private waitingForNext = false;

  private cancelPendingNext(): void {
    this.pauseSubscription?.unsubscribe();
    this.pauseSubscription = undefined;
  }

  /**
   * Continue with the next ayah or iteration
   */
  private continueRepeat(): void {
    const state = this.repeatStateSubject.value;

    if (state.repeatStyle === RepeatStyle.PER_AYAH) {
      this.continuePerAyahRepeat(state);
    } else {
      this.continueWholeRepeat(state);
    }
  }

  /**
   * Continue repeat in PER_AYAH style: repeat each ayah X times before moving to next
   */
  private continuePerAyahRepeat(state: RepeatState): void {
    const nextAyahRepetition = state.currentAyahRepetition + 1;

    // Check if we need more repetitions of current ayah
    if (nextAyahRepetition < state.totalIterations) {
      this.updateState({ currentAyahRepetition: nextAyahRepetition });
      this.playCurrentAyah();
      return;
    }

    // Current ayah repetitions complete, move to next ayah
    const nextAyahIndex = state.currentAyahIndex + 1;

    if (nextAyahIndex < this.currentAyahs.length) {
      // More ayahs to play
      this.updateState({
        currentAyahIndex: nextAyahIndex,
        currentAyahRepetition: 0
      });
      this.playCurrentAyah();
    } else if (this.turnsPages(state.mode)) {
      // Surah/Juz/continuous: navigate to next page
      this.awaitingPageLoad = true;
      this.updateState({
        currentAyahIndex: 0,
        currentAyahRepetition: 0
      });
      this.pageNavigationSubject.next('next');
    } else {
      // All ayahs complete
      this.stop();
    }
  }

  /**
   * Continue repeat in WHOLE style: play all ayahs, then repeat the whole set
   */
  private continueWholeRepeat(state: RepeatState): void {
    const nextAyahIndex = state.currentAyahIndex + 1;

    if (nextAyahIndex < this.currentAyahs.length) {
      // More ayahs to play in current iteration
      this.updateState({ currentAyahIndex: nextAyahIndex });
      this.playCurrentAyah();
      return;
    }

    // Reached end of ayahs list
    if (this.turnsPages(state.mode)) {
      // Surah/Juz mode: repeat this page X times, then move to next page
      const nextIteration = state.currentIteration + 1;

      if (nextIteration < state.totalIterations) {
        // Repeat this page again
        this.updateState({
          currentAyahIndex: 0,
          currentIteration: nextIteration
        });
        this.playCurrentAyah();
      } else {
        // Page iterations complete, move to next page
        this.awaitingPageLoad = true;
        this.updateState({
          currentAyahIndex: 0,
          currentIteration: 0
        });
        this.pageNavigationSubject.next('next');
      }
    } else {
      // Page/Selected/Range mode - repeat the whole set X times
      const nextIteration = state.currentIteration + 1;

      if (nextIteration < state.totalIterations) {
        // Start over with next iteration
        this.updateState({
          currentAyahIndex: 0,
          currentIteration: nextIteration
        });
        this.playCurrentAyah();
      } else {
        // All iterations completed
        this.stop();
      }
    }
  }

  /** Pause the session; it keeps its place and can be resumed */
  pause(): void {
    const state = this.repeatStateSubject.value;
    if (!state.isActive) return;
    this.audioService.pause();
    // A pending "next ayah" timer is cancelled; resume() continues from there
    if (this.waitingForNext) this.cancelPendingNext();
    this.updateState({ paused: true });
  }

  /** Resume a paused session */
  resume(): void {
    const state = this.repeatStateSubject.value;
    if (!state.isActive) return;
    this.updateState({ paused: false });
    if (this.waitingForNext || this.audioService.isEnded()) {
      this.waitingForNext = false;
      this.continueRepeat();
    } else {
      this.audioService.play();
    }
  }

  /** Stop the session completely */
  stop(): void {
    this.audioService.stop();
    this.audioService.setAutoPlay(false);
    this.cancelPendingNext();
    this.waitingForNext = false;

    this.updateState({
      mode: RepeatMode.NONE,
      repeatStyle: RepeatStyle.WHOLE,
      isActive: false,
      paused: false,
      currentIteration: 0,
      currentAyahRepetition: 0,
      currentAyahIndex: 0,
      totalAyahs: 0,
      currentAyah: undefined
    });

    this.currentAyahs = [];
    this.currentConfig = undefined;
    this.awaitingPageLoad = false;
  }

  /** Next ayah; at the end of the page, page-turning modes move to the next page */
  skipToNext(): void {
    const state = this.repeatStateSubject.value;
    if (!state.isActive) return;
    this.cancelPendingNext();
    this.waitingForNext = false;

    if (state.currentAyahIndex < this.currentAyahs.length - 1) {
      this.audioService.stop();
      this.updateState({ currentAyahIndex: state.currentAyahIndex + 1, currentAyahRepetition: 0 });
      this.playCurrentAyah();
    } else if (this.turnsPages(state.mode)) {
      this.audioService.stop();
      this.awaitingPageLoad = true;
      this.updateState({ currentAyahIndex: 0, currentAyahRepetition: 0, currentIteration: 0 });
      this.pageNavigationSubject.next('next');
    }
  }

  /** Previous ayah; on the first ayah, starts it again */
  skipToPrevious(): void {
    const state = this.repeatStateSubject.value;
    if (!state.isActive) return;
    this.cancelPendingNext();
    this.waitingForNext = false;
    this.audioService.stop();

    if (state.currentAyahIndex > 0) {
      this.updateState({ currentAyahIndex: state.currentAyahIndex - 1, currentAyahRepetition: 0 });
    }
    this.playCurrentAyah();
  }

  /**
   * Update repeat configuration
   */
  updateConfig(config: Partial<RepeatConfig>): void {
    if (config.count !== undefined) {
      this.updateState({ totalIterations: config.count });
    }

    if (config.pauseDuration !== undefined) {
      this.updateState({ pauseDuration: config.pauseDuration });
    }

    if (config.repeatStyle !== undefined) {
      this.updateState({ repeatStyle: config.repeatStyle });
    }

    if (config.audioType) {
      this.audioService.setAudioType(config.audioType);
    }

    if (config.reciter) {
      this.audioService.setReciter(config.reciter);
    }

    if (config.tafsir) {
      this.audioService.setTafsir(config.tafsir);
    }

    if (this.currentConfig) {
      this.currentConfig = { ...this.currentConfig, ...config };
    }
  }

  /**
   * Get current repeat state
   */
  getState(): RepeatState {
    return this.repeatStateSubject.value;
  }

  /**
   * Update repeat state
   */
  private updateState(updates: Partial<RepeatState>): void {
    const currentState = this.repeatStateSubject.value;
    this.repeatStateSubject.next({ ...currentState, ...updates });
  }

  /**
   * Get progress percentage
   */
  getProgress(): number {
    const state = this.repeatStateSubject.value;
    if (state.totalIterations === 0 || state.totalAyahs === 0) return 0;

    if (state.repeatStyle === RepeatStyle.PER_AYAH) {
      // For per-ayah: (completed ayahs * iterations + current ayah repetitions) / (total ayahs * iterations)
      const totalUnits = state.totalAyahs * state.totalIterations;
      const completedUnits = (state.currentAyahIndex * state.totalIterations) + state.currentAyahRepetition;
      return (completedUnits / totalUnits) * 100;
    } else {
      // For whole: (completed iterations * ayahs + current ayah index) / (total iterations * ayahs)
      const totalUnits = state.totalIterations * state.totalAyahs;
      const completedUnits = (state.currentIteration * state.totalAyahs) + state.currentAyahIndex;
      return (completedUnits / totalUnits) * 100;
    }
  }

  /**
   * Get human-readable progress text
   */
  getProgressText(): string {
    const state = this.repeatStateSubject.value;

    if (state.repeatStyle === RepeatStyle.PER_AYAH) {
      return `Ayah ${state.currentAyahIndex + 1}/${state.totalAyahs} - Rép. ${state.currentAyahRepetition + 1}/${state.totalIterations}`;
    } else {
      return `Ayah ${state.currentAyahIndex + 1}/${state.totalAyahs} - Tour ${state.currentIteration + 1}/${state.totalIterations}`;
    }
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.stop();
    this.repeatStateSubject.complete();
  }
}
