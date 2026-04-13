import { Component, OnInit } from '@angular/core';
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

  revelationTypes = [
    { label: 'Tous', value: null },
    { label: 'Mecquoise', value: 'Meccan' },
    { label: 'Médinoise', value: 'Medinan' }
  ];

  constructor(
    private quranService: QuranService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSurahs();
  }

  loadSurahs(): void {
    this.quranService.getAllSurahs().subscribe(surahs => {
      this.surahs = surahs;
      this.filteredSurahs = surahs;
    });
  }

  filterSurahs(): void {
    let filtered = this.surahs;

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(surah =>
        surah.name.toLowerCase().includes(query) ||
        surah.transliteratedName.toLowerCase().includes(query) ||
        surah.translatedName.toLowerCase().includes(query) ||
        surah.id.toString().includes(query)
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
