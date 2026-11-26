import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { QuranService } from '../../services/quran.service';
import { AudioService } from '../../services/audio.service';
import { StorageService } from '../../services/storage.service';
import { SurahDTO, Ayah, PlayerState } from '../../models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    DialogModule,
    TextareaModule,
    ProgressBarModule,
    TooltipModule
  ],
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css']
})
export class StudyComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  surahs: SurahDTO[] = [];
  selectedSurah: SurahDTO | null = null;
  currentAyahs: Ayah[] = [];

  // State
  loading = true;
  loadingAyahs = false;

  // Surah selection
  surahId: number | null = null;
  surahOptions: { label: string; value: number }[] = [];

  // Audio state
  currentlyPlayingAyahId: number | null = null;
  playerState: PlayerState | null = null;

  // Notes dialog
  showNotesDialog = false;
  notesAyah: Ayah | null = null;
  notesText = '';

  // Settings
  showTranslation = false; // Placeholder for future translation feature
  autoAdvance = false;
  fontSize: 'small' | 'medium' | 'large' = 'medium';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quranService: QuranService,
    private audioService: AudioService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Load surahs list
    this.loadSurahs();

    // Check for surah ID in route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['surahId']) {
        this.surahId = +params['surahId'];
        this.loadSurahAyahs();
      }
    });

    // Subscribe to player state
    this.audioService.playerState$.pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.playerState = state;
      this.currentlyPlayingAyahId = state.currentAyah?.id ?? null;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.audioService.stop();
  }

  loadSurahs(): void {
    this.quranService.getAllSurahs().subscribe({
      next: (surahs) => {
        this.surahs = surahs;
        this.surahOptions = surahs.map(s => ({
          label: `${s.number}. ${s.name}`,
          value: s.number
        }));
        this.loading = false;

        // If surahId was set from route, find the surah
        if (this.surahId) {
          this.selectedSurah = surahs.find(s => s.number === this.surahId) || null;
          this.loadSurahAyahs();
        }
      },
      error: (error) => {
        console.error('Error loading surahs:', error);
        this.loading = false;
      }
    });
  }

  onSurahChange(surahId: number): void {
    this.surahId = surahId;
    this.selectedSurah = this.surahs.find(s => s.number === surahId) || null;
    this.router.navigate(['/study', surahId], { replaceUrl: true });
    this.loadSurahAyahs();
  }

  loadSurahAyahs(): void {
    if (!this.surahId) return;

    this.loadingAyahs = true;
    this.quranService.getSurah(this.surahId).subscribe({
      next: (surah) => {
        this.selectedSurah = surah;
        this.currentAyahs = surah?.ayahs || [];
        this.loadingAyahs = false;
      },
      error: (error) => {
        console.error('Error loading ayahs:', error);
        this.loadingAyahs = false;
      }
    });
  }

  // Audio controls
  playAyah(ayah: Ayah): void {
    this.audioService.loadAyah(ayah);
    this.audioService.play();
  }

  togglePlayAyah(ayah: Ayah): void {
    if (this.isAyahPlaying(ayah.id)) {
      this.audioService.pause();
    } else {
      this.playAyah(ayah);
    }
  }

  isAyahPlaying(ayahId: number): boolean {
    return this.currentlyPlayingAyahId === ayahId && (this.playerState?.isPlaying ?? false);
  }

  isCurrentAyah(ayahId: number): boolean {
    return this.currentlyPlayingAyahId === ayahId;
  }

  // Memorization
  toggleMemorized(ayah: Ayah, event: Event): void {
    event.stopPropagation();
    const progress = this.storageService.getAyahProgress(ayah.id);
    if (progress?.memorized) {
      this.storageService.updateProgress({
        ayahId: ayah.id,
        surahId: ayah.surahId,
        memorized: false
      });
    } else {
      this.storageService.markAsMemorized(ayah.id, ayah.surahId);
    }
  }

  isAyahMemorized(ayahId: number): boolean {
    const progress = this.storageService.getAyahProgress(ayahId);
    return progress?.memorized || false;
  }

  get memorizedCount(): number {
    return this.currentAyahs.filter(a => this.isAyahMemorized(a.id)).length;
  }

  get memorizedPercentage(): number {
    if (!this.currentAyahs.length) return 0;
    return (this.memorizedCount / this.currentAyahs.length) * 100;
  }

  // Notes
  openNotesDialog(ayah: Ayah, event: Event): void {
    event.stopPropagation();
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

  // Utility
  convertToArabicNumber(num: number): string {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
  }

  getFontSizeClass(): string {
    switch (this.fontSize) {
      case 'small': return 'text-2xl';
      case 'large': return 'text-5xl';
      default: return 'text-3xl';
    }
  }
}
