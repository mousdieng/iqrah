import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { QuranService } from '../../services/quran.service';
import { AudioService } from '../../services/audio.service';
import { RepeatService } from '../../services/repeat.service';
import { StorageService } from '../../services/storage.service';
import { SurahDTO, Ayah, RepeatConfig, RepeatMode } from '../../models';
import { AyahCardComponent } from '../../components/ayah-card/ayah-card.component';
import { RepeatControlsComponent } from '../../components/repeat-controls/repeat-controls.component';

@Component({
  selector: 'app-surah-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ProgressBarModule,
    AyahCardComponent,
    RepeatControlsComponent
  ],
  templateUrl: './surah-detail.component.html',
  styleUrls: ['./surah-detail.component.css']
})
export class SurahDetailComponent implements OnInit {
  @ViewChild('repeatControls') repeatControls!: RepeatControlsComponent;

  surah: SurahDTO | null = null;
  surahId: number = 0;
  loading = true;
  selectedAyahId: number | null = null;

  RepeatMode = RepeatMode;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quranService: QuranService,
    private audioService: AudioService,
    private repeatService: RepeatService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.surahId = +params['id'];
      this.loadSurah();
    });
  }

  loadSurah(): void {
    this.loading = true;
    this.quranService.getSurah(this.surahId).subscribe({
      next: (surah) => {
        this.surah = surah;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading surah:', error);
        this.loading = false;
      }
    });
  }

  onPlayAyah(ayah: Ayah): void {
    this.selectedAyahId = ayah.id;
    this.audioService.loadAyah(ayah);
    this.audioService.play();
  }

  onRepeatAyah(ayah: Ayah): void {
    this.selectedAyahId = ayah.id;
    if (this.repeatControls) {
      this.repeatControls.mode = RepeatMode.AYAH;
      this.repeatControls.show();

      // Store the ayah for later use
      (this.repeatControls as any).currentAyah = ayah;
    }
  }

  onStartRepeat(config: RepeatConfig): void {
    const ayah = (this.repeatControls as any).currentAyah;
    if (ayah) {
      this.repeatService.repeatAyah(ayah, config);
    }
  }

  onToggleFavorite(ayahId: number): void {
    this.storageService.toggleFavorite(ayahId);
  }

  onToggleMemorized(ayahId: number): void {
    const ayah = this.surah?.ayahs.find(a => a.id === ayahId);
    if (ayah) {
      const progress = this.storageService.getAyahProgress(ayahId);
      if (progress?.memorized) {
        // Already memorized, unmark it
        this.storageService.updateProgress({
          ayahId,
          surahId: ayah.surahId,
          memorized: false
        });
      } else {
        // Mark as memorized
        this.storageService.markAsMemorized(ayahId, ayah.surahId);
      }
    }
  }

  isAyahMemorized(ayahId: number): boolean {
    const progress = this.storageService.getAyahProgress(ayahId);
    return progress?.memorized || false;
  }

  playSurah(): void {
    if (this.surah && this.surah.ayahs.length > 0) {
      this.audioService.loadPlaylist(this.surah.ayahs, 0);
      this.audioService.setAutoPlay(true);
      this.audioService.play();
    }
  }

  repeatSurah(): void {
    if (this.repeatControls && this.surah) {
      this.repeatControls.mode = RepeatMode.SURAH;
      this.repeatControls.show();
      (this.repeatControls as any).currentSurahId = this.surah.id;
    }
  }

  onStartSurahRepeat(config: RepeatConfig): void {
    const surahId = (this.repeatControls as any).currentSurahId;
    if (surahId) {
      this.repeatService.repeatSurah(surahId, config);
    }
  }

  navigateToSurah(direction: 'prev' | 'next'): void {
    const newId = direction === 'prev' ? this.surahId - 1 : this.surahId + 1;
    if (newId >= 1 && newId <= 114) {
      this.router.navigate(['/surah', newId]);
    }
  }

  get memorizedPercentage(): number {
    if (!this.surah || !this.surah.ayahs) return 0;

    const memorizedCount = this.surah.ayahs.filter(ayah =>
      this.isAyahMemorized(ayah.id)
    ).length;

    return (memorizedCount / this.surah.ayahs.length) * 100;
  }

  get memorizedCount(): number {
    if (!this.surah || !this.surah.ayahs) return 0;

    return this.surah.ayahs.filter(ayah =>
      this.isAyahMemorized(ayah.id)
    ).length;
  }
}
