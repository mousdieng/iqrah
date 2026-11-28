import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Ayah, PlayerState, RepeatMode } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = 'http://localhost:8080/api/audio';
  private audio: HTMLAudioElement;
  private wakeLock: WakeLockSentinel | null = null;

  // State management (reciter, speed and volume are remembered between visits)
  private readonly saved = AudioService.loadSettings();
  private playerStateSubject = new BehaviorSubject<PlayerState>({
    isPlaying: false,
    currentReciter: this.saved.reciter ?? 'minshawi',
    currentTafsir: undefined,
    audioType: 'recitation',
    volume: this.saved.volume ?? 1,
    playbackRate: this.saved.playbackRate ?? 1,
    autoPlay: false,
    repeatMode: RepeatMode.NONE,
    playlist: [],
    currentIndex: 0
  });

  public playerState$ = this.playerStateSubject.asObservable();

  // Events
  public audioEnded$ = new Subject<void>();
  public audioError$ = new Subject<string>();
  public audioProgress$ = new Subject<number>();

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.setupAudioListeners();
    this.setupWakeLockListeners();
  }

  private setupAudioListeners(): void {
    this.audio.addEventListener('ended', () => {
      this.audioEnded$.next();
      this.updateState({ isPlaying: false });
      // Don't release wake lock here - repeat service might play next ayah
    });

    this.audio.addEventListener('error', () => {
      // Switching ayahs aborts the previous load: not a real failure
      const code = this.audio.error?.code;
      if (!this.audio.getAttribute('src') || code === MediaError.MEDIA_ERR_ABORTED) return;
      this.audioError$.next('Failed to load audio');
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.duration) {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.audioProgress$.next(progress);
      }
    });

    this.audio.addEventListener('loadeddata', () => {
      const state = this.playerStateSubject.value;
      if (state.autoPlay) {
        this.play();
      }
    });
  }

  /**
   * Setup wake lock listeners to re-acquire lock when page becomes visible
   */
  private setupWakeLockListeners(): void {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible' && this.playerStateSubject.value.isPlaying) {
        await this.requestWakeLock();
      }
    });
  }

  /**
   * Request screen wake lock to keep screen on during playback
   */
  private async requestWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake lock request failed:', err);
      }
    }
  }

  /**
   * Release screen wake lock
   */
  private async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.warn('Wake lock release failed:', err);
      }
    }
  }

  /**
   * Get the audio URL for a specific Ayah
   */
  getAudioUrl(ayah: Ayah, reciter?: string): string {
    const selectedReciter = reciter || this.playerStateSubject.value.currentReciter;
    return `${this.apiUrl}/reciter/${selectedReciter}/${ayah.surahId}/${ayah.numberInSurah}`;
  }

  /**
   * Get the tafsir audio URL
   */
  getTafsirUrl(ayah: Ayah, tafsir: string): string {
    return `${this.apiUrl}/tafsir/${tafsir}/${ayah.surahId}/${ayah.numberInSurah}`;
  }

  /**
   * Load an Ayah's audio
   */
  loadAyah(ayah: Ayah, reciter?: string, tafsir?: string): void {
    const state = this.playerStateSubject.value;
    const url = state.audioType === 'recitation'
      ? this.getAudioUrl(ayah, reciter)
      : this.getTafsirUrl(ayah, tafsir || state.currentTafsir || 'default');
    this.audio.src = url;
    this.audio.load();
    // Re-apply playback rate and volume after loading (browser resets these)
    this.audio.playbackRate = state.playbackRate;
    this.audio.volume = state.volume;
    this.updateState({ currentAyah: ayah });
  }

  /**
   * Play the current audio
   */
  play(): void {
    const promise = this.audio.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          this.updateState({ isPlaying: true });
          this.requestWakeLock();
        })
        .catch(error => {
          // AbortError: play() interrupted by loading the next ayah, expected when skipping
          if (error?.name === 'AbortError') return;
          console.error('Play error:', error);
          this.audioError$.next('Failed to play audio');
        });
    }
  }

  /**
   * Pause the current audio
   */
  pause(): void {
    this.audio.pause();
    this.updateState({ isPlaying: false });
    this.releaseWakeLock();
  }

  /**
   * Toggle play/pause
   */
  togglePlay(): void {
    if (this.playerStateSubject.value.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Stop the audio
   */
  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.updateState({ isPlaying: false });
    this.releaseWakeLock();
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.updateState({ volume: this.audio.volume });
    this.saveSettings();
  }

  /**
   * Set playback rate (0.5 to 2)
   */
  setPlaybackRate(rate: number): void {
    this.audio.playbackRate = Math.max(0.5, Math.min(2, rate));
    this.updateState({ playbackRate: this.audio.playbackRate });
    this.saveSettings();
  }

  /**
   * Set the current reciter
   */
  setReciter(reciter: string): void {
    this.updateState({ currentReciter: reciter });
    this.saveSettings();
  }

  /**
   * Set the audio type (recitation or tafsir)
   */
  setAudioType(type: 'recitation' | 'tafsir'): void {
    this.updateState({ audioType: type });
  }

  /**
   * Set the current tafsir
   */
  setTafsir(tafsir: string): void {
    this.updateState({ currentTafsir: tafsir });
  }

  /**
   * Set autoplay
   */
  setAutoPlay(autoPlay: boolean): void {
    this.updateState({ autoPlay });
  }

  /**
   * Set repeat mode
   */
  setRepeatMode(mode: RepeatMode): void {
    this.updateState({ repeatMode: mode });
  }

  /**
   * Load a playlist
   */
  loadPlaylist(ayahs: Ayah[], startIndex: number = 0): void {
    this.updateState({
      playlist: ayahs,
      currentIndex: startIndex
    });

    if (ayahs.length > 0 && startIndex < ayahs.length) {
      this.loadAyah(ayahs[startIndex]);
    }
  }

  /**
   * Play next in playlist
   */
  playNext(): void {
    const state = this.playerStateSubject.value;
    if (state.currentIndex < state.playlist.length - 1) {
      const nextIndex = state.currentIndex + 1;
      this.updateState({ currentIndex: nextIndex });
      this.loadAyah(state.playlist[nextIndex]);
      if (state.autoPlay) {
        this.play();
      }
    }
  }

  /**
   * Play previous in playlist
   */
  playPrevious(): void {
    const state = this.playerStateSubject.value;
    if (state.currentIndex > 0) {
      const prevIndex = state.currentIndex - 1;
      this.updateState({ currentIndex: prevIndex });
      this.loadAyah(state.playlist[prevIndex]);
      if (state.autoPlay) {
        this.play();
      }
    }
  }

  /**
   * Seek to a specific position (percentage 0-100)
   */
  seek(percentage: number): void {
    if (this.audio.duration) {
      this.audio.currentTime = (percentage / 100) * this.audio.duration;
    }
  }

  /**
   * Get current playback position (percentage)
   */
  getCurrentPosition(): number {
    if (this.audio.duration) {
      return (this.audio.currentTime / this.audio.duration) * 100;
    }
    return 0;
  }

  /** True when the loaded ayah has played to its end */
  isEnded(): boolean {
    return this.audio.ended;
  }

  /** Jump to a time in seconds within the current ayah */
  seekSeconds(seconds: number): void {
    if (this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
    }
  }

  /** Seeks now, or as soon as the newly loaded ayah knows its duration */
  seekWhenReady(seconds: number): void {
    if (seconds <= 0) return;
    if (this.audio.readyState >= 1 && this.audio.duration) {
      this.seekSeconds(seconds);
    } else {
      this.audio.addEventListener('loadedmetadata', () => this.seekSeconds(seconds), { once: true });
    }
  }

  /** Loads only the metadata of an ayah's audio to learn its length (seconds) */
  probeDuration(ayah: Ayah, reciter?: string): Promise<number> {
    return new Promise(resolve => {
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.addEventListener('loadedmetadata', () => { resolve(probe.duration); probe.src = ''; }, { once: true });
      probe.addEventListener('error', () => resolve(NaN), { once: true });
      probe.src = this.getAudioUrl(ayah, reciter);
    });
  }

  private static readonly SETTINGS_KEY = 'iqrah_audio_settings';

  private static loadSettings(): { reciter?: string; volume?: number; playbackRate?: number } {
    try {
      return JSON.parse(localStorage.getItem(AudioService.SETTINGS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private saveSettings(): void {
    const { currentReciter, volume, playbackRate } = this.playerStateSubject.value;
    try {
      localStorage.setItem(AudioService.SETTINGS_KEY, JSON.stringify({ reciter: currentReciter, volume, playbackRate }));
    } catch {
      // storage unavailable: settings simply aren't remembered
    }
  }

  /**
   * Get current time in seconds
   */
  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  /**
   * Get duration in seconds
   */
  getDuration(): number {
    return this.audio.duration || 0;
  }

  /**
   * Update player state
   */
  private updateState(updates: Partial<PlayerState>): void {
    const currentState = this.playerStateSubject.value;
    this.playerStateSubject.next({ ...currentState, ...updates });
  }

  /**
   * Get current player state
   */
  getState(): PlayerState {
    return this.playerStateSubject.value;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this.releaseWakeLock();
    this.audio.src = '';
    this.playerStateSubject.complete();
    this.audioEnded$.complete();
    this.audioError$.complete();
    this.audioProgress$.complete();
  }
}
