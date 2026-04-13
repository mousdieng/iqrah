import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { StorageService } from '../../services/storage.service';
import { QuranService } from '../../services/quran.service';
import { UserProgress, Ayah } from '../../models';

@Component({
  selector: 'app-memorization',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    ProgressBarModule
  ],
  templateUrl: './memorization.component.html',
  styleUrls: ['./memorization.component.css']
})
export class MemorizationComponent implements OnInit {
  memorizedAyahs: UserProgress[] = [];
  dueForReview: UserProgress[] = [];
  ayahsMap = new Map<number, Ayah>();

  totalAyahs = 6236;
  activeTab = 0;

  constructor(
    private storageService: StorageService,
    private quranService: QuranService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMemorizationData();
  }

  loadMemorizationData(): void {
    this.memorizedAyahs = this.storageService.getMemorizedAyahs();
    this.dueForReview = this.storageService.getAyahsDueForReview();

    // Load ayah details for memorized ayahs
    this.memorizedAyahs.forEach(progress => {
      this.quranService.getAyah(progress.ayahId).subscribe(ayah => {
        if (ayah) {
          this.ayahsMap.set(ayah.id, ayah);
        }
      });
    });

    // Load ayah details for review ayahs
    this.dueForReview.forEach(progress => {
      this.quranService.getAyah(progress.ayahId).subscribe(ayah => {
        if (ayah) {
          this.ayahsMap.set(ayah.id, ayah);
        }
      });
    });
  }

  getAyah(ayahId: number): Ayah | undefined {
    return this.ayahsMap.get(ayahId);
  }

  goToAyah(ayahId: number): void {
    const ayah = this.getAyah(ayahId);
    if (ayah) {
      this.router.navigate(['/surah', ayah.surahId]);
    }
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch (difficulty) {
      case 'EASY':
        return 'Facile';
      case 'MEDIUM':
        return 'Moyen';
      case 'HARD':
        return 'Difficile';
      default:
        return difficulty;
    }
  }

  get memorizedPercentage(): number {
    return (this.memorizedAyahs.length / this.totalAyahs) * 100;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'Jamais';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }
}
