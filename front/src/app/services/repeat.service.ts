import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Ayah, RepeatConfig, RepeatMode, RepeatState } from '../models';
import { AudioService } from './audio.service';
import { QuranService } from './quran.service';

@Injectable({
  providedIn: 'root'
})
export class RepeatService {
  private repeatStateSubject = new BehaviorSubject<RepeatState>({
    mode: RepeatMode.NONE,
    isActive: false,
    currentIteration: 0,
    totalIterations: 1,
    pauseDuration: 0
  });

  public repeatState$ = this.repeatStateSubject.asObservable();

  private pauseSubscription?: Subscription;
  private currentAyahs: Ayah[] = [];
  private currentAyahIndex: number = 0;

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
    this.startRepeat(RepeatMode.AYAH, config, ayah.id);
  }

  /**
   * Start repeating a Surah
   */
  repeatSurah(surahNumber: number, config: RepeatConfig): void {
    this.quranService.getSurah(surahNumber).subscribe(surah => {
      if (surah && surah.ayahs) {
        this.currentAyahs = surah.ayahs;
        this.startRepeat(RepeatMode.SURAH, config, surahNumber);
      }
    });
  }

  /**
   * Start repeating a Page
   */
  repeatPage(pageNumber: number, config: RepeatConfig): void {
    this.quranService.getPage(pageNumber).subscribe(ayahs => {
      if (ayahs && ayahs.length > 0) {
        this.currentAyahs = ayahs;
        this.startRepeat(RepeatMode.PAGE, config, pageNumber);
      }
    });
  }

  /**
   * Start repeating a Juz
   */
  repeatJuz(juzNumber: number, config: RepeatConfig): void {
    this.quranService.getJuz(juzNumber).subscribe(ayahs => {
      if (ayahs && ayahs.length > 0) {
        this.currentAyahs = ayahs;
        this.startRepeat(RepeatMode.JUZ, config, juzNumber);
      }
    });
  }

  /**
   * Start repeating a range of Ayahs
   */
  repeatRange(from: number, to: number, config: RepeatConfig): void {
    this.quranService.getAyahRange(from, to).subscribe(ayahs => {
      if (ayahs && ayahs.length > 0) {
        this.currentAyahs = ayahs;
        this.updateState({
          ayahRange: { from, to }
        });
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

    // Update state
    this.updateState({
      mode,
      isActive: true,
      currentIteration: 0,
      totalIterations: config.count,
      pauseDuration: config.pauseDuration,
      targetId,
      currentAyah: this.currentAyahs[0]
    });

    // Configure audio service
    this.audioService.setAutoPlay(true);
    if (config.reciter) {
      this.audioService.setReciter(config.reciter);
    }

    // Start playing
    this.currentAyahIndex = 0;
    this.playCurrentAyah();
  }

  /**
   * Play the current ayah
   */
  private playCurrentAyah(): void {
    const state = this.repeatStateSubject.value;

    if (!state.isActive || this.currentAyahIndex >= this.currentAyahs.length) {
      return;
    }

    const ayah = this.currentAyahs[this.currentAyahIndex];
    this.updateState({ currentAyah: ayah });
    this.audioService.loadAyah(ayah);
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

    if (state.mode === RepeatMode.AYAH) {
      // For single ayah, just repeat the same ayah
      if (state.currentIteration < state.totalIterations - 1) {
        this.updateState({
          currentIteration: state.currentIteration + 1
        });
        this.playCurrentAyah();
      } else {
        this.stop();
      }
    } else {
      // For surah/page/juz/range, move to next ayah
      this.currentAyahIndex++;

      if (this.currentAyahIndex >= this.currentAyahs.length) {
        // Reached end of ayahs list
        if (state.currentIteration < state.totalIterations - 1) {
          // Start over with next iteration
          this.currentAyahIndex = 0;
          this.updateState({
            currentIteration: state.currentIteration + 1
          });
          this.playCurrentAyah();
        } else {
          // All iterations completed
          this.stop();
        }
      } else {
        // Play next ayah
        this.playCurrentAyah();
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
      isActive: false,
      currentIteration: 0,
      currentAyah: undefined
    });

    this.currentAyahs = [];
    this.currentAyahIndex = 0;
  }

  /**
   * Skip to next ayah
   */
  skipToNext(): void {
    if (this.currentAyahIndex < this.currentAyahs.length - 1) {
      this.audioService.stop();
      this.currentAyahIndex++;
      this.playCurrentAyah();
    }
  }

  /**
   * Skip to previous ayah
   */
  skipToPrevious(): void {
    if (this.currentAyahIndex > 0) {
      this.audioService.stop();
      this.currentAyahIndex--;
      this.playCurrentAyah();
    }
  }

  /**
   * Update repeat configuration
   */
  updateConfig(config: Partial<RepeatConfig>): void {
    const state = this.repeatStateSubject.value;

    if (config.count !== undefined) {
      this.updateState({ totalIterations: config.count });
    }

    if (config.pauseDuration !== undefined) {
      this.updateState({ pauseDuration: config.pauseDuration });
    }

    if (config.reciter) {
      this.audioService.setReciter(config.reciter);
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
    if (state.totalIterations === 0) return 0;

    const totalAyahs = this.currentAyahs.length * state.totalIterations;
    const completedAyahs = (state.currentIteration * this.currentAyahs.length) + this.currentAyahIndex;

    return (completedAyahs / totalAyahs) * 100;
  }

  /**
   * Clean up
   */
  destroy(): void {
    this.stop();
    this.repeatStateSubject.complete();
  }
}
