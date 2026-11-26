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
  private startRepeat(mode: RepeatMode, config: RepeatConfig, targetId?: number): void {
    if (this.currentAyahs.length === 0) {
      console.warn('No ayahs to repeat');
      return;
    }

    console.log('Starting repeat:', {
      mode,
      style: config.repeatStyle,
      count: config.count,
      ayahsCount: this.currentAyahs.length
    });

    // Update state
    this.updateState({
      mode,
      repeatStyle: config.repeatStyle,
      isActive: true,
      currentIteration: 0,
      totalIterations: config.count,
      currentAyahRepetition: 0,
      currentAyahIndex: 0,
      totalAyahs: this.currentAyahs.length,
      pauseDuration: config.pauseDuration,
      targetId,
      currentAyah: this.currentAyahs[0]
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
    this.updateState({ currentAyah: ayah });

    console.log('Playing ayah:', {
      index: state.currentAyahIndex,
      ayahNum: ayah.numberInSurah,
      iteration: state.currentIteration,
      ayahRepetition: state.currentAyahRepetition
    });

    // Load ayah with appropriate audio type
    if (this.currentConfig?.audioType === 'recitation') {
      this.audioService.loadAyah(ayah, this.currentConfig.reciter);
    } else {
      this.audioService.loadAyah(ayah, undefined, this.currentConfig?.tafsir);
    }

    this.audioService.play();
  }

  /**
   * Handle when audio ends
   */
  private handleAudioEnded(): void {
    const state = this.repeatStateSubject.value;

    if (!state.isActive) {
      return;
    }

    // If there's a pause duration, wait before continuing
    if (state.pauseDuration > 0) {
      this.pauseSubscription = interval(state.pauseDuration * 1000)
        .pipe(take(1))
        .subscribe(() => {
          this.continueRepeat();
        });
    } else {
      this.continueRepeat();
    }
  }

  /**
   * Continue with the next ayah or iteration
   */
  private continueRepeat(): void {
    const state = this.repeatStateSubject.value;

    console.log('Continue repeat:', {
      mode: state.mode,
      style: state.repeatStyle,
      currentAyahIndex: state.currentAyahIndex,
      currentAyahRepetition: state.currentAyahRepetition,
      currentIteration: state.currentIteration,
      totalIterations: state.totalIterations
    });

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
    } else if (state.mode === RepeatMode.SURAH || state.mode === RepeatMode.JUZ) {
      // Surah/Juz mode: navigate to next page
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
    if (state.mode === RepeatMode.SURAH || state.mode === RepeatMode.JUZ) {
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

  /**
   * Pause the repeat
   */
  pause(): void {
    this.audioService.pause();
    this.updateState({ isActive: false });
  }

  /**
   * Resume the repeat
   */
  resume(): void {
    const state = this.repeatStateSubject.value;
    if (state.mode !== RepeatMode.NONE) {
      this.updateState({ isActive: true });
      this.audioService.play();
    }
  }

  /**
   * Stop the repeat
   */
  stop(): void {
    this.audioService.stop();
    this.audioService.setAutoPlay(false);

    if (this.pauseSubscription) {
      this.pauseSubscription.unsubscribe();
    }

    this.updateState({
      mode: RepeatMode.NONE,
      repeatStyle: RepeatStyle.WHOLE,
      isActive: false,
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

  /**
   * Skip to next ayah
   */
  skipToNext(): void {
    const state = this.repeatStateSubject.value;
    if (state.currentAyahIndex < this.currentAyahs.length - 1) {
      this.audioService.stop();
      this.updateState({
        currentAyahIndex: state.currentAyahIndex + 1,
        currentAyahRepetition: 0
      });
      this.playCurrentAyah();
    }
  }

  /**
   * Skip to previous ayah
   */
  skipToPrevious(): void {
    const state = this.repeatStateSubject.value;
    if (state.currentAyahIndex > 0) {
      this.audioService.stop();
      this.updateState({
        currentAyahIndex: state.currentAyahIndex - 1,
        currentAyahRepetition: 0
      });
      this.playCurrentAyah();
    }
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
