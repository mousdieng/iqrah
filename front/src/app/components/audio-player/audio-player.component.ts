import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AudioService } from '../../services/audio.service';
import { RepeatService } from '../../services/repeat.service';
import { QuranService } from '../../services/quran.service';
import { SurahCatalogService } from '../../services/surah-catalog.service';
import { Ayah, RepeatConfig, RepeatMode, RepeatStyle, SurahDTO } from '../../models';

type RepeatTarget = 'ayah' | 'page' | 'selection' | 'surah';

interface RepeatSettings {
  target: RepeatTarget;
  count: number;
  pause: number;
  style: RepeatStyle;
}

const REPEAT_SETTINGS_KEY = 'iqrah_repeat_settings';
const RECITER_NAMES: Record<string, string> = {
  husary: 'Mahmoud Khalil Al-Husary',
  maher_al_muaiqly: 'Maher Al-Muaiqly',
  minshawi: 'Mohamed Siddiq El-Minshawi',
  sudais: 'Abdurrahman As-Sudais'
};

/**
 * Bottom player of the reader: continuous listening, seek, speed, volume,
 * repeat settings, keyboard shortcuts (Space, ←, →) and lock-screen/headphone controls.
 */
@Component({
  selector: 'app-audio-player',
  standalone: true,
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css']
})
export class AudioPlayerComponent implements OnDestroy {
  private audio = inject(AudioService);
  private repeat = inject(RepeatService);
  private quran = inject(QuranService);
  private catalog = inject(SurahCatalogService);

  // ─── Context from the reader ───────────────────────────────────────────────
  private readonly pageAyahs = signal<Ayah[]>([]);
  @Input() set currentAyahs(value: Ayah[]) { this.pageAyahs.set(value ?? []); }
  @Input() surah: SurahDTO | null = null;
  private readonly selection = signal<Ayah[]>([]);
  @Input() set selectedAyahs(value: Ayah[]) { this.selection.set([...(value ?? [])]); }

  /** Asks the reader to let the user tap ayahs to select them */
  @Output() selectionModeChange = new EventEmitter<boolean>();

  // ─── Live state ────────────────────────────────────────────────────────────
  readonly player = toSignal(this.audio.playerState$, { initialValue: this.audio.getState() });
  readonly session = toSignal(this.repeat.repeatState$, { initialValue: this.repeat.getState() });
  readonly progress = toSignal(this.audio.audioProgress$, { initialValue: 0 });

  readonly isActive = computed(() => this.session().isActive);
  readonly isPlaying = computed(() => this.player().isPlaying);
  readonly currentAyah = computed(() => this.session().currentAyah ?? this.player().currentAyah ?? null);

  readonly currentLabel = computed(() => {
    const ayah = this.currentAyah();
    if (!ayah) return null;
    const name = this.catalog.get(ayah.surahId)?.englishName ?? `Sourate ${ayah.surahId}`;
    return { name, ref: `${ayah.surahId}:${ayah.numberInSurah}` };
  });

  /** What the session is doing, in words */
  readonly sessionLabel = computed(() => {
    const s = this.session();
    if (!s.isActive) return null;
    if (s.mode === RepeatMode.CONTINUOUS) return 'Lecture continue';
    const what: Partial<Record<RepeatMode, string>> = {
      [RepeatMode.AYAH]: 'Répétition du verset',
      [RepeatMode.PAGE]: 'Répétition de la page',
      [RepeatMode.SELECTED]: 'Répétition de la sélection',
      [RepeatMode.SURAH]: 'Répétition de la sourate',
      [RepeatMode.JUZ]: 'Répétition du juz'
    };
    const round = s.repeatStyle === RepeatStyle.PER_AYAH ? s.currentAyahRepetition + 1 : s.currentIteration + 1;
    return `${what[s.mode] ?? 'Répétition'} · ${round}/${s.totalIterations}`;
  });

  /** Position in the ayah being played (seconds) */
  private readonly time = signal(0);
  private readonly duration = signal(0);
  /** Known ayah lengths in seconds, by "reciter:ayahId" */
  private readonly durations = signal<Record<string, number>>({});
  private probing = new Set<string>();

  /**
   * One timeline for the whole repetition (verse xN, page, selection): every playback of an ayah is a slot.
   * Null for plain listening and page-turning modes, where the bar follows the current ayah.
   */
  readonly timeline = computed(() => {
    const s = this.session();
    if (!s.isActive || !this.repeat.hasFixedLength(s.mode)) return null;
    const reciter = this.player().currentReciter;
    const known = this.durations();
    const slots = s.totalAyahs * s.totalIterations;
    const current = this.repeat.currentSlot(s);
    const lengths: number[] = [];
    for (let k = 0; k < slots; k++) {
      const ayah = this.repeat.slotAyah(k, s);
      lengths.push(ayah ? known[`${reciter}:${ayah.id}`] ?? NaN : NaN);
    }
    // The ayah playing now: its length is known from the player even before the probe answers
    if (isNaN(lengths[current]) && this.duration()) lengths[current] = this.duration();
    const allKnown = lengths.every(l => !isNaN(l));
    return { slots, current, lengths, allKnown };
  });

  /** 0-100 position of the bar */
  readonly position = computed(() => {
    const t = this.timeline();
    const time = this.time();
    if (!t) return this.duration() ? (time / this.duration()) * 100 : 0;
    if (t.allKnown) {
      const total = t.lengths.reduce((a, b) => a + b, 0);
      const before = t.lengths.slice(0, t.current).reduce((a, b) => a + b, 0);
      return total ? ((before + time) / total) * 100 : 0;
    }
    const fraction = this.duration() ? time / this.duration() : 0;
    return ((t.current + fraction) / t.slots) * 100;
  });

  readonly elapsed = computed(() => {
    const t = this.timeline();
    if (!t || !t.allKnown) return this.format(this.time());
    return this.format(t.lengths.slice(0, t.current).reduce((a, b) => a + b, 0) + this.time());
  });

  readonly total = computed(() => {
    const t = this.timeline();
    if (!t) return this.format(this.duration());
    return t.allKnown ? this.format(t.lengths.reduce((a, b) => a + b, 0)) : '-:--';
  });

  // ─── Settings ──────────────────────────────────────────────────────────────
  readonly panelOpen = signal(false);
  readonly reciters = signal<{ value: string; label: string }[]>([]);
  readonly speeds = [0.75, 1, 1.25, 1.5];
  readonly repeatSettings = signal<RepeatSettings>(this.loadRepeatSettings());
  readonly repeatTargets: { value: RepeatTarget; label: string }[] = [
    { value: 'ayah', label: 'Ce verset' },
    { value: 'page', label: 'Cette page' },
    { value: 'selection', label: 'Sélection' },
    { value: 'surah', label: 'Sourate' }
  ];
  readonly pauses = [0, 2, 5];
  readonly selectionCount = computed(() => this.selection().length);

  /** Verse chosen for "Ce verset" (defaults to the one playing, else the first of the page) */
  private readonly pickedAyahId = signal<number | null>(null);
  readonly pageVerses = computed(() => this.pageAyahs());
  readonly repeatAyah = computed(() => {
    const ayahs = this.pageAyahs();
    const picked = ayahs.find(a => a.id === this.pickedAyahId());
    const playing = this.currentAyah();
    return picked ?? ayahs.find(a => a.id === playing?.id) ?? ayahs[0] ?? null;
  });
  readonly choosingSelection = signal(false);

  // Short message when an ayah's audio can't be played
  readonly error = signal<string | null>(null);
  private errorTimer?: ReturnType<typeof setTimeout>;

  readonly RepeatStyle = RepeatStyle;

  constructor() {
    this.quran.getReciters().subscribe(list => {
      this.reciters.set(list.map(r => ({ value: r, label: RECITER_NAMES[r] ?? r })));
      // A remembered reciter that no longer exists falls back to the first available one
      if (list.length && !list.includes(this.player().currentReciter)) {
        this.audio.setReciter(list[0]);
      }
    });

    this.audio.audioProgress$.subscribe(() => {
      this.time.set(this.audio.getCurrentTime());
      const d = this.audio.getDuration();
      this.duration.set(isFinite(d) ? d : 0);
    });

    // Learn the length of every ayah of a repetition so the bar can span all of it
    effect(() => {
      const s = this.session();
      if (!s.isActive || !this.repeat.hasFixedLength(s.mode)) return;
      const reciter = this.player().currentReciter;
      for (const ayah of this.repeat.getSessionAyahs()) {
        const key = `${reciter}:${ayah.id}`;
        if (this.probing.has(key)) continue;
        this.probing.add(key);
        this.audio.probeDuration(ayah, reciter).then(seconds => {
          if (!isNaN(seconds) && isFinite(seconds)) this.durations.update(d => ({ ...d, [key]: seconds }));
        });
      }
    });

    this.audio.audioError$.subscribe(() => {
      this.error.set('Audio indisponible pour ce verset.');
      clearTimeout(this.errorTimer);
      this.errorTimer = setTimeout(() => this.error.set(null), 4000);
    });

    this.setupMediaSession();

    // Lock screen / notification info follows the current ayah
    effect(() => {
      const label = this.currentLabel();
      const reciter = RECITER_NAMES[this.player().currentReciter] ?? this.player().currentReciter;
      if (!('mediaSession' in navigator) || !label) return;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${label.name} · verset ${label.ref.split(':')[1]}`,
        artist: reciter,
        album: 'Iqrah'
      });
    });

    effect(() => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = this.isPlaying() ? 'playing' : (this.isActive() ? 'paused' : 'none');
      }
    });
  }

  ngOnDestroy(): void {
    // Leaving the reader stops playback: the controls live only here
    this.repeat.stop();
    clearTimeout(this.errorTimer);
    if ('mediaSession' in navigator) {
      for (const action of ['play', 'pause', 'previoustrack', 'nexttrack', 'seekto', 'stop'] as MediaSessionAction[]) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* unsupported action */ }
      }
      navigator.mediaSession.metadata = null;
    }
  }

  // ─── Transport ─────────────────────────────────────────────────────────────

  /** Play / pause; when nothing is running, starts listening from the current or first ayah of the page */
  togglePlay(): void {
    const s = this.session();
    if (s.isActive) {
      s.paused || !this.isPlaying() ? this.repeat.resume() : this.repeat.pause();
      return;
    }
    const ayahs = this.pageAyahs();
    if (!ayahs.length) return;
    const current = this.player().currentAyah;
    const start = current ? ayahs.findIndex(a => a.id === current.id) : -1;
    this.repeat.playContinuous(ayahs, Math.max(0, start), this.baseConfig());
  }

  next(): void {
    if (this.isActive()) this.repeat.skipToNext();
  }

  previous(): void {
    if (this.isActive()) this.repeat.skipToPrevious();
  }

  stop(): void {
    this.repeat.stop();
  }

  onSeek(event: Event): void {
    const percent = +(event.target as HTMLInputElement).value;
    const t = this.timeline();
    if (!t) {
      this.audio.seek(percent);
      return;
    }
    if (t.allKnown) {
      // Find the playback (slot) that contains this point of the whole repetition
      let target = (percent / 100) * t.lengths.reduce((a, b) => a + b, 0);
      let slot = 0;
      while (slot < t.slots - 1 && target >= t.lengths[slot]) {
        target -= t.lengths[slot];
        slot++;
      }
      this.time.set(target);
      this.repeat.jumpToSlot(slot, target);
    } else {
      const exact = (percent / 100) * t.slots;
      const slot = Math.min(t.slots - 1, Math.floor(exact));
      const length = t.lengths[slot];
      this.repeat.jumpToSlot(slot, isNaN(length) ? 0 : (exact - slot) * length);
    }
  }

  onVolume(event: Event): void {
    this.audio.setVolume(+(event.target as HTMLInputElement).value / 100);
  }

  cycleSpeed(): void {
    const i = this.speeds.indexOf(this.player().playbackRate);
    this.audio.setPlaybackRate(this.speeds[(i + 1) % this.speeds.length]);
  }

  setSpeed(rate: number): void {
    this.audio.setPlaybackRate(rate);
  }

  setReciter(event: Event): void {
    this.audio.setReciter((event.target as HTMLSelectElement).value);
  }

  // ─── Repeat ────────────────────────────────────────────────────────────────

  updateRepeat(changes: Partial<RepeatSettings>): void {
    this.repeatSettings.update(s => ({ ...s, ...changes }));
    localStorage.setItem(REPEAT_SETTINGS_KEY, JSON.stringify(this.repeatSettings()));
    if (changes.target !== undefined && changes.target !== 'selection' && this.choosingSelection()) {
      this.cancelSelection();
    }
  }

  changeCount(delta: number): void {
    this.updateRepeat({ count: Math.max(1, Math.min(50, this.repeatSettings().count + delta)) });
  }

  startRepeat(): void {
    const s = this.repeatSettings();
    const config: RepeatConfig = { ...this.baseConfig(), count: s.count, pauseDuration: s.pause, repeatStyle: s.style };
    const ayahs = this.pageAyahs();

    switch (s.target) {
      case 'ayah': {
        const ayah = this.repeatAyah();
        if (ayah) this.repeat.repeatAyah(ayah, config);
        break;
      }
      case 'page':
        if (ayahs.length) this.repeat.repeatPage(ayahs, config);
        break;
      case 'surah':
        if (ayahs.length) this.repeat.repeatSurah(ayahs, config);
        break;
      case 'selection':
        if (!this.selection().length) {
          this.choosingSelection.set(true);
          this.selectionModeChange.emit(true);
          this.panelOpen.set(false);
          return;
        }
        this.repeat.repeatSelected(this.selection(), config);
        this.choosingSelection.set(false);
        this.selectionModeChange.emit(false);
        break;
    }
    this.panelOpen.set(false);
  }

  /**
   * A verse tapped in the reader: plays it with the "Ce verset" settings
   * (number of times, pause), then stops.
   */
  playVerse(ayah: Ayah): void {
    const s = this.repeatSettings();
    this.pickedAyahId.set(ayah.id);
    this.cancelSelection();
    this.repeat.repeatAyah(ayah, {
      ...this.baseConfig(),
      count: s.count,
      pauseDuration: s.pause,
      repeatStyle: RepeatStyle.PER_AYAH
    });
  }

  pickAyah(event: Event): void {
    this.pickedAyahId.set(+(event.target as HTMLSelectElement).value);
  }

  cancelSelection(): void {
    this.choosingSelection.set(false);
    this.selectionModeChange.emit(false);
  }

  // ─── Keyboard: Space play/pause, ← previous, → next ────────────────────────

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"]')) return;

    if (event.code === 'Space' || event.key === 'k') {
      event.preventDefault();
      this.togglePlay();
    } else if (event.key === 'ArrowRight' && this.isActive()) {
      event.preventDefault();
      this.next();
    } else if (event.key === 'ArrowLeft' && this.isActive()) {
      event.preventDefault();
      this.previous();
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  reciterName(id: string): string {
    return RECITER_NAMES[id] ?? id;
  }

  private baseConfig(): Omit<RepeatConfig, 'count' | 'repeatStyle'> {
    return { pauseDuration: 0, audioType: 'recitation', reciter: this.player().currentReciter };
  }

  private setupMediaSession(): void {
    if (!('mediaSession' in navigator)) return;
    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => this.togglePlay()],
      ['pause', () => this.togglePlay()],
      ['previoustrack', () => this.previous()],
      ['nexttrack', () => this.next()],
      ['stop', () => this.stop()],
      ['seekto', details => { if (details.seekTime != null) this.audio.seekSeconds(details.seekTime); }]
    ];
    for (const [action, handler] of handlers) {
      try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* unsupported action */ }
    }
  }

  private loadRepeatSettings(): RepeatSettings {
    const defaults: RepeatSettings = { target: 'ayah', count: 3, pause: 0, style: RepeatStyle.PER_AYAH };
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(REPEAT_SETTINGS_KEY) || '{}') };
    } catch {
      return defaults;
    }
  }

  private format(seconds: number): string {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
