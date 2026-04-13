import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { AudioService } from '../../services/audio.service';
import { RepeatService } from '../../services/repeat.service';
import { QuranService } from '../../services/quran.service';
import { PlayerState, RepeatState, RepeatMode } from '../../models';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SliderModule,
    SelectModule
  ],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  playerState: PlayerState | null = null;
  repeatState: RepeatState | null = null;
  progress = 0;
  currentTime = '0:00';
  duration = '0:00';

  reciters: string[] = [];
  selectedReciter = 'ar.alafasy';

  playbackRates = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: '1x', value: 1 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2 }
  ];

  RepeatMode = RepeatMode;

  constructor(
    public audioService: AudioService,
    public repeatService: RepeatService,
    private quranService: QuranService
  ) {}

  ngOnInit(): void {
    // Subscribe to player state
    this.audioService.playerState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.playerState = state;
        this.selectedReciter = state.currentReciter;
      });

    // Subscribe to repeat state
    this.repeatService.repeatState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.repeatState = state;
      });

    // Subscribe to audio progress
    this.audioService.audioProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => {
        this.progress = progress;
        this.updateTimeDisplay();
      });

    // Load reciters
    this.quranService.getReciters()
      .pipe(takeUntil(this.destroy$))
      .subscribe(reciters => {
        this.reciters = reciters;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePlay(): void {
    this.audioService.togglePlay();
  }

  skipPrevious(): void {
    if (this.repeatState?.isActive) {
      this.repeatService.skipToPrevious();
    } else {
      this.audioService.playPrevious();
    }
  }

  skipNext(): void {
    if (this.repeatState?.isActive) {
      this.repeatService.skipToNext();
    } else {
      this.audioService.playNext();
    }
  }

  onProgressChange(value: number): void {
    this.audioService.seek(value);
  }

  onVolumeChange(value: number): void {
    this.audioService.setVolume(value / 100);
  }

  onReciterChange(reciter: string): void {
    this.audioService.setReciter(reciter);
  }

  onPlaybackRateChange(rate: number): void {
    this.audioService.setPlaybackRate(rate);
  }

  stopRepeat(): void {
    this.repeatService.stop();
  }

  pauseRepeat(): void {
    this.repeatService.pause();
  }

  resumeRepeat(): void {
    this.repeatService.resume();
  }

  private updateTimeDisplay(): void {
    const current = this.audioService.getCurrentTime();
    const total = this.audioService.getDuration();

    this.currentTime = this.formatTime(current);
    this.duration = this.formatTime(total);
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) {
      return '0:00';
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get isPlaying(): boolean {
    return this.playerState?.isPlaying || false;
  }

  get volume(): number {
    return (this.playerState?.volume || 1) * 100;
  }

  get playbackRate(): number {
    return this.playerState?.playbackRate || 1;
  }

  get repeatProgress(): number {
    return this.repeatState?.isActive ? this.repeatService.getProgress() : 0;
  }

  getRepeatModeLabel(): string {
    if (!this.repeatState) return '';

    switch (this.repeatState.mode) {
      case RepeatMode.AYAH:
        return 'Répétition Ayah';
      case RepeatMode.SURAH:
        return 'Répétition Sourate';
      case RepeatMode.PAGE:
        return 'Répétition Page';
      case RepeatMode.JUZ:
        return 'Répétition Juz';
      case RepeatMode.RANGE:
        return 'Répétition Plage';
      default:
        return '';
    }
  }
}
