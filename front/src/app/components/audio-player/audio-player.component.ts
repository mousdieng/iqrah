import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { SelectModule } from 'primeng/select';
import { AudioService } from '../../services/audio.service';
import { RepeatService } from '../../services/repeat.service';
import { QuranService } from '../../services/quran.service';
import { PlayerState, RepeatState, RepeatMode, RepeatStyle, SurahDTO, Ayah, RepeatConfig } from '../../models';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SliderModule,
    SelectModule,
    RadioButtonModule
  ],
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ─── Context from parent ───────────────────────────────────────────────────
  @Input() currentAyahs: Ayah[] = [];          // ayahs of the visible page
  @Input() surah: SurahDTO | null = null;
  @Input() selectedAyahs: Ayah[] = [];         // set by parent in selection mode

  // ─── Tell parent when selection UI is needed ───────────────────────────────
  @Output() selectionModeChange = new EventEmitter<boolean>();

  // repeat config knobs (exposed in template)
  repeatCount: number = 3;
  pauseDuration: number = 2;            // seconds

  // ─── existing state ────────────────────────────────────────────────────────
  playerState: PlayerState | null = null;
  repeatState: RepeatState | null = null;
  progress = 0;
  currentTime = '0:00';
  duration = '0:00';

  showSettings = false;

  repeatModeOptions = [
    { label: 'Ayah', value: RepeatMode.AYAH },
    { label: 'Sourate', value: RepeatMode.SURAH },
    { label: 'Page', value: RepeatMode.PAGE },
    { label: 'Juz', value: RepeatMode.JUZ },
    { label: 'Sélection',  value: RepeatMode.SELECTED }
  ];
  selectedRepeatMode: RepeatMode = RepeatMode.AYAH;

  repeatStyleOptions = [
    { label: 'Tout répéter', value: RepeatStyle.WHOLE, description: 'Jouer tout, puis répéter X fois' },
    { label: 'Par Ayah', value: RepeatStyle.PER_AYAH, description: 'Répéter chaque ayah X fois' }
  ];
  selectedRepeatStyle: RepeatStyle = RepeatStyle.PER_AYAH;

  selectedPlaybackRate: number = 1;

  RepeatStyle = RepeatStyle;

  audioOptions: "recitation" | "tafsir" = 'recitation';
  selectedReciter: string = 'minshawi';
  selectedTafsir: string = 'hady';
  reciterOptions: { label: string; value: string }[] = [];
  tafsirOptions: { label: string; value: string }[] = [];

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
        this.selectedPlaybackRate = state.playbackRate;
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

    // Load available reciters
    this.quranService.getReciters().subscribe(reciters => {
      this.reciterOptions = reciters.map(r => ({
        label: this.getReciterName(r),
        value: r
      }));
      if (reciters.length > 0) {
        this.selectedReciter = reciters[0];
      }
    });

    // Load available tafsirs/translators
    this.quranService.getTranslators().subscribe(tafsirs => {
      this.tafsirOptions = tafsirs.map(t => ({
        label: this.getTafsirName(t),
        value: t
      }));
      if (tafsirs.length > 0) {
        this.selectedTafsir = tafsirs[0];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getReciterName(reciter: string): string {
    const reciterNames: { [key: string]: string } = {
      'husary': 'Mahmoud Khalil Al-Husary',
      'maher_al_muaiqly': 'Maher Al Muaiqly',
      'minshawi': 'Mohamed Siddiq El-Minshawi',
      'sudais': 'Abdurrahman As-Sudais'
    };
    return reciterNames[reciter] || reciter;
  }

  getTafsirName(tafsir: string): string {
    const tafsirNames: { [key: string]: string } = {
      'hady': 'Hady Niass',
    };
    return tafsirNames[tafsir] || tafsir;
  }

  onAudioOptionChange(option: 'recitation' | 'tafsir'): void {
    this.audioOptions = option;
    option === 'recitation'
      ? this.audioService.setReciter(this.selectedReciter)
      : this.audioService.setTafsir(this.selectedTafsir);
  }

  // ─── Repeat mode change ────────────────────────────────────────────────────
  onRepeatModeChange(mode: RepeatMode): void {
    this.selectedRepeatMode = mode;

    // Tell parent to show/hide ayah selection UI
    const needsSelection = mode === RepeatMode.RANGE || mode === RepeatMode.SELECTED;
    this.selectionModeChange.emit(needsSelection);
  }

   // ─── Main action: start repeat ─────────────────────────────────────────────
  startRepeat(): void {
    const config: RepeatConfig = {
      count:         this.repeatCount,
      pauseDuration: this.pauseDuration,
      audioType:     this.audioOptions,
      reciter:       this.audioOptions === 'recitation' ? this.selectedReciter : undefined,
      tafsir:        this.audioOptions === 'tafsir'     ? this.selectedTafsir  : undefined,
      repeatStyle:   this.selectedRepeatStyle
    };

    switch (this.selectedRepeatMode) {
      case RepeatMode.PAGE: {
        if (!this.currentAyahs.length) return;
        this.repeatService.repeatPage(this.currentAyahs, config);
        break;
      }
      case RepeatMode.SURAH: {
        if (!this.currentAyahs.length) return;
        this.repeatService.repeatSurah(this.currentAyahs, config);
        break;
      }
      case RepeatMode.AYAH: {
        const ayah = this.playerState?.currentAyah ?? this.currentAyahs[0];
        if (!ayah) return;
        this.repeatService.repeatAyah(ayah, config);
        break;
      }
      case RepeatMode.JUZ: {
        const juzAyah = this.playerState?.currentAyah ?? this.currentAyahs[0];
        if (!juzAyah || !this.currentAyahs.length) return;
        // Pass current page ayahs for page-by-page repeat
        this.repeatService.repeatJuz(juzAyah.juz, config, this.currentAyahs);
        break;
      }
      case RepeatMode.SELECTED: {
        if (this.selectedAyahs.length === 0) {
          this.selectionModeChange.emit(true);   // activate selection UI on page
          return;
        }
        this.repeatService.repeatSelected(this.selectedAyahs, config);
        this.selectionModeChange.emit(false);    // close selection UI once started
        break;
      }
    }
  }

  // Check if repeat style selector should be shown (not for single AYAH mode)
  get showRepeatStyleSelector(): boolean {
    return this.selectedRepeatMode !== RepeatMode.AYAH;
  }

  togglePlay(): void { this.audioService.togglePlay();}

  skipPrevious(): void {
    this.repeatState?.isActive
      ? this.repeatService.skipToPrevious()
      : this.audioService.playPrevious();
  }

  skipNext(): void {
    this.repeatState?.isActive
      ? this.repeatService.skipToNext()
      : this.audioService.playNext();
  }

  onProgressChange(value: number): void  { this.audioService.seek(value); }
  onVolumeChange(value: number): void    { this.audioService.setVolume(value / 100); }
  onReciterChange(reciter: string): void { this.audioService.setReciter(reciter); }
  onTafsirChange(tafsir: string): void   { this.audioService.setTafsir(tafsir); }
  onPlaybackRateChange(rate: number): void {
    this.selectedPlaybackRate = rate;
    this.audioService.setPlaybackRate(rate);
  }
  stopRepeat():   void { this.repeatService.stop(); }
  pauseRepeat():  void { this.repeatService.pause(); }
  resumeRepeat(): void { this.repeatService.resume(); }
  get isInSelectionMode(): boolean {return this.selectedRepeatMode === RepeatMode.SELECTED;}
  cancelSelection(): void {
    this.selectedRepeatMode = RepeatMode.AYAH;
    this.selectionModeChange.emit(false);
  }
  private updateTimeDisplay(): void {
    this.currentTime = this.formatTime(this.audioService.getCurrentTime());
    this.duration    = this.formatTime(this.audioService.getDuration());
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get isPlaying():      boolean { return this.playerState?.isPlaying || false; }
  get volume():         number  { return (this.playerState?.volume || 1) * 100; }
  get playbackRate():   number  { return this.playerState?.playbackRate || 1; }
  get repeatProgress(): number  {
    return this.repeatState?.isActive ? this.repeatService.getProgress() : 0;
  }

  getRepeatModeLabel(mode: RepeatMode): string {
    const labels: Record<string, string> = {
      [RepeatMode.AYAH]:  'Répétition Ayah',
      [RepeatMode.SURAH]: 'Répétition Sourate',
      [RepeatMode.PAGE]:  'Répétition Page',
      [RepeatMode.JUZ]:   'Répétition Juz',
      [RepeatMode.RANGE]: 'Répétition Plage'
    };
    return labels[mode] || '';
  }

  getCurrentRepeatModeLabel(): string {
    return this.repeatState ? this.getRepeatModeLabel(this.repeatState.mode) : '';
  }

  get canStartRepeat(): boolean {
    if (this.repeatState?.isActive) return false;
    if (this.selectedRepeatMode === RepeatMode.SURAH   && !this.currentAyahs.length) return false;
    if (this.selectedRepeatMode === RepeatMode.PAGE    && !this.currentAyahs.length) return false;
    if (this.selectedRepeatMode === RepeatMode.AYAH    &&
        !this.playerState?.currentAyah && !this.currentAyahs.length) return false;
    // SELECTED with 0 ayahs is allowed — clicking opens selection mode on the page
    return true;
  }

  // ─── Add these methods ─────────────────────────────────────────────────────────

  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  /** Native range input handler — fixes the slider update loop caused by p-slider + subscription */
  onProgressInput(event: Event): void {
    this.audioService.seek(+(event.target as HTMLInputElement).value);
  }

  onVolumeInput(event: Event): void {
    this.audioService.setVolume(+(event.target as HTMLInputElement).value / 100);
  }

  /** Single smart action button: Lancer → pause → resume */
  onMainButtonClick(): void {
    if (this.repeatState?.isActive) {
      this.isPlaying ? this.pauseRepeat() : this.resumeRepeat();
    } else {
      this.startRepeat();
    }
  }

  get mainButtonIcon(): string {
    if (this.repeatState?.isActive) {
      return this.isPlaying ? 'pi pi-pause' : 'pi pi-play';
    }
    return 'pi pi-play';
  }

  get mainButtonLabel(): string {
    if (this.repeatState?.isActive) return '';   // icon-only during active repeat
    return 'Lancer';
  }

  get mainButtonSeverity(): string {
    if (this.repeatState?.isActive && this.isPlaying) return 'warn';
    return 'success';
  }

  get mainButtonDisabled(): boolean {
    if (this.repeatState?.isActive) return false;  // can always pause/resume
    return !this.canStartRepeat;
  }
}
