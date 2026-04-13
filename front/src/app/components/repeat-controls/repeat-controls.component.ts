import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { RepeatConfig, RepeatMode } from '../../models';

@Component({
  selector: 'app-repeat-controls',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputNumberModule,
    SelectModule,
    DialogModule
  ],
  templateUrl: './repeat-controls.component.html',
  styleUrls: ['./repeat-controls.component.css']
})
export class RepeatControlsComponent {
  @Input() mode: RepeatMode = RepeatMode.AYAH;
  @Output() startRepeat = new EventEmitter<RepeatConfig>();

  visible = false;

  repeatCount = 3;
  pauseDuration = 2;
  selectedReciter: string = 'ar.alafasy';

  reciters = [
    { label: 'Abdul Basit', value: 'ar.abdulbasitmurattal' },
    { label: 'Mishary Rashid Alafasy', value: 'ar.alafasy' },
    { label: 'Ahmed Al Ajamy', value: 'ar.ahmedajamy' },
    { label: 'Saad Al Ghamdi', value: 'ar.saadalghamadi' },
    { label: 'Saud Al Shuraim', value: 'ar.shaatree' }
  ];

  show(): void {
    this.visible = true;
  }

  hide(): void {
    this.visible = false;
  }

  onStart(): void {
    const config: RepeatConfig = {
      count: this.repeatCount,
      reciter: this.selectedReciter,
      pauseDuration: this.pauseDuration
    };

    this.startRepeat.emit(config);
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
      default:
        return 'Configurer la répétition';
    }
  }
}
