import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Ayah } from '../../models';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-ayah-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './ayah-card.component.html',
  styleUrls: ['./ayah-card.component.css']
})
export class AyahCardComponent {
  @Input() ayah!: Ayah;
  @Input() showSurahInfo = true;
  @Input() isSelected = false;
  @Input() isMemorized = false;

  @Output() playAyah = new EventEmitter<Ayah>();
  @Output() repeatAyah = new EventEmitter<Ayah>();
  @Output() toggleFavorite = new EventEmitter<number>();
  @Output() toggleMemorized = new EventEmitter<number>();

  constructor(public storageService: StorageService) {}

  get isFavorite(): boolean {
    return this.storageService.isFavorite(this.ayah.id);
  }

  onPlayClick(): void {
    this.playAyah.emit(this.ayah);
  }

  onRepeatClick(): void {
    this.repeatAyah.emit(this.ayah);
  }

  onFavoriteClick(): void {
    this.toggleFavorite.emit(this.ayah.id);
  }

  onMemorizedClick(): void {
    this.toggleMemorized.emit(this.ayah.id);
  }
}
