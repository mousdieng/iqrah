import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { QuranService } from '../../services/quran.service';
import { StorageService } from '../../services/storage.service';
import { Ayah, UserProgress } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  randomAyah: Ayah | null = null;
  memorizedCount = 0;
  totalAyahs = 6236;
  dueForReview: UserProgress[] = [];

  quickLinks = [
    {
      title: 'Liste des Sourates',
      description: 'Parcourir toutes les sourates du Coran',
      icon: 'pi pi-book',
      route: '/surahs',
      color: 'bg-blue-500'
    },
    {
      title: 'Mémorisation',
      description: 'Commencer votre parcours de mémorisation',
      icon: 'pi pi-star',
      route: '/memorization',
      color: 'bg-green-500'
    },
    {
      title: 'Favoris',
      description: 'Vos ayahs favorites sauvegardées',
      icon: 'pi pi-heart',
      route: '/favorites',
      color: 'bg-red-500'
    },
    {
      title: 'Progression',
      description: 'Suivre votre progression de mémorisation',
      icon: 'pi pi-chart-line',
      route: '/progress',
      color: 'bg-purple-500'
    }
  ];

  constructor(
    private quranService: QuranService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRandomAyah();
    this.loadStats();
  }

  loadRandomAyah(): void {
    this.quranService.getRandomAyah().subscribe(ayah => {
      this.randomAyah = ayah;
    });
  }

  loadStats(): void {
    const memorized = this.storageService.getMemorizedAyahs();
    this.memorizedCount = memorized.length;

    this.dueForReview = this.storageService.getAyahsDueForReview();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  get progressPercentage(): number {
    return (this.memorizedCount / this.totalAyahs) * 100;
  }
}
