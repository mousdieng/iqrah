import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Ayah, PlayerState, RepeatMode } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = 'http://localhost:8080/api/audio';
  private audio: HTMLAudioElement;

  // State management
  private playerStateSubject = new BehaviorSubject<PlayerState>({
    isPlaying: false,
    currentReciter: 'ar.alafasy',
    volume: 1,
    playbackRate: 1,
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
    this.setupAudioListeners();
  }

  private setupAudioListeners(): void {
    this.audio.addEventListener('ended', () => {
      this.audioEnded$.next();
      this.updateState({ isPlaying: false });
    });

    this.audio.addEventListener('error', (error) => {
      console.error('Audio error:', error);
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
  loadAyah(ayah: Ayah, reciter?: string): void {
    const url = this.getAudioUrl(ayah, reciter);
    this.audio.src = url;
    this.audio.load();
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
        })
        .catch(error => {
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
  }

  /**
   * Set volume (0 to 1)
   */
  setVolume(volume: number): void {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.updateState({ volume: this.audio.volume });
  }

  /**
   * Set playback rate (0.5 to 2)
   */
  setPlaybackRate(rate: number): void {
    this.audio.playbackRate = Math.max(0.5, Math.min(2, rate));
    this.updateState({ playbackRate: this.audio.playbackRate });
  }

  /**
   * Set the current reciter
   */
  setReciter(reciter: string): void {
    this.updateState({ currentReciter: reciter });
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
    this.audio.src = '';
    this.playerStateSubject.complete();
    this.audioEnded$.complete();
    this.audioError$.complete();
    this.audioProgress$.complete();
  }
}
