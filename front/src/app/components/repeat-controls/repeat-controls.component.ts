import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RepeatConfig, RepeatMode, RepeatStyle, Ayah, SurahDTO } from '../../models';
import { QuranService } from '../../services/quran.service';
import { AudioService } from '../../services/audio.service';
import { RepeatService } from '../../services/repeat.service';

@Component({
  selector: 'app-repeat-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
    RadioButtonModule
  ],
  templateUrl: './repeat-controls.component.html',
  styleUrls: ['./repeat-controls.component.css']
})
export class RepeatControlsComponent implements OnInit {
  @Input() mode: RepeatMode = RepeatMode.AYAH;
  @Input() currentAyahs: Ayah[] = [];
  @Input() selectedAyahsList: Ayah[] = [];
  @Input() surah: SurahDTO | null = null;
  @Input() currentPage: number = 0;
  @Input() targetAyah: Ayah | null = null;

  @Output() repeatStarted = new EventEmitter<void>();

  visible = false;

  repeatCount = 3;
  pauseDuration = 2;

  audioType: 'recitation' | 'tafsir' = 'recitation';
  selectedReciter: string = 'minshawi';
  selectedTafsir: string = 'hady';

  reciterOptions: { label: string; value: string }[] = [];
  tafsirOptions: { label: string; value: string }[] = [];

  constructor(private quranService: QuranService,
            private audioService: AudioService,
            private repeatService: RepeatService) {}

  ngOnInit(): void {
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

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  onStart(): void {
    const config: RepeatConfig = {
      count: this.repeatCount,
      pauseDuration: this.pauseDuration,
      audioType: this.audioType,
      reciter: this.audioType === 'recitation' ? this.selectedReciter : undefined,
      tafsir: this.audioType === 'tafsir' ? this.selectedTafsir : undefined,
      repeatStyle: RepeatStyle.PER_AYAH
    };

    switch (this.mode) {
      case RepeatMode.AYAH:
        if (this.targetAyah) {
          this.repeatService.repeatAyah(this.targetAyah, config);
        }
        break;

      case RepeatMode.PAGE:
        if (this.currentAyahs.length > 0) {
          this.repeatService.repeatPage(this.currentAyahs, config);
        }
        break;

      case RepeatMode.SURAH:
        if (this.currentAyahs.length > 0) {
          this.repeatService.repeatSurah(this.currentAyahs, config);
        }
        break;

      case RepeatMode.SELECTED:
        if (this.selectedAyahsList.length > 0) {
          this.repeatService.repeatSelected(this.selectedAyahsList, config);
        }
        break;

      case RepeatMode.JUZ:
        if (this.currentAyahs.length > 0) {
          const juzNumber = this.currentAyahs[0].juz;
          this.repeatService.repeatJuz(juzNumber, config);
        }
        break;

      default:
        console.warn('Unknown repeat mode:', this.mode);
    }

    this.repeatStarted.emit();
    this.hide();
  }

  getModeLabel(): string {
    switch (this.mode) {
      case RepeatMode.AYAH:
        return 'Répéter cette Ayah';
      case RepeatMode.SURAH:
        return 'Répéter cette Sourate';
      case RepeatMode.PAGE:
        return 'Répéter cette Page';
      case RepeatMode.JUZ:
        return 'Répéter ce Juz';
      case RepeatMode.RANGE:
        return 'Répéter cette plage';
      case RepeatMode.SELECTED:
        return 'Répéter les Ayahs sélectionnés';
      default:
        return 'Configurer la répétition';
    }
  }

  showForAyah(ayah: Ayah): void {
    this.mode = RepeatMode.AYAH;
    this.targetAyah = ayah;
    this.show();
  }

  showForPage(): void {
    this.mode = RepeatMode.PAGE;
    this.show();
  }

  showForSurah(): void {
    this.mode = RepeatMode.SURAH;
    this.show();
  }

  showForSelected(): void {
    if (this.selectedAyahsList.length === 0) {
      return;
    }
    this.mode = RepeatMode.SELECTED;
    this.show();
  }
}
