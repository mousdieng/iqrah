import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { QuranService } from '../../services/quran.service';
import { SurahDTO } from '../../models';

@Component({
  selector: 'app-surahs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './surahs.component.html',
  styleUrls: ['./surahs.component.css']
})
export class SurahsComponent implements OnInit {
  surahs: SurahDTO[] = [];
  filteredSurahs: SurahDTO[] = [];
  searchQuery = '';
  selectedType: string | null = null;
  loading = true;

  revelationTypes = [
    { label: 'Tous', value: null },
    { label: 'Mecquoise', value: 'Meccan' },
    { label: 'Médinoise', value: 'Medinan' }
  ];

  constructor(
    private quranService: QuranService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSurahs();
  }

  loadSurahs(): void {
    this.loading = true;
    this.quranService.getAllSurahs().subscribe({
      next: (surahs) => {
        this.surahs = surahs;
        this.filteredSurahs = surahs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading surahs:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterSurahs(): void {
    let filtered = this.surahs;

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(surah =>
        surah.name.toLowerCase().includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.englishNameTranslation.toLowerCase().includes(query) ||
        surah.number.toString().includes(query)
      );
    }

    // Filter by revelation type
    if (this.selectedType) {
      filtered = filtered.filter(surah =>
        surah.revelationType === this.selectedType
      );
    }

    this.filteredSurahs = filtered;
  }

  openSurah(surahId: number): void {
    this.router.navigate(['/surah', surahId]);
  }

  getRevelationBadgeClass(type: string): string {
    return type === 'Meccan'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  }
}
