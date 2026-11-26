import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ThemeService } from '../../../core/services/theme.service';

interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  category: string;
}

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent implements OnInit {
  private themeService = inject(ThemeService);

  themeOptions: ThemeOption[] = [];
  selectedTheme: ThemeOption | null = null;

  ngOnInit(): void {
    this.loadThemes();
    this.initializeSelectedTheme();
  }

  private loadThemes(): void {
    const themes = this.themeService.getThemes();

    // Convert all themes to options - flat list with separator labels
    this.themeOptions = themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      primaryColor: theme.colors.primary,
      accentColor: theme.colors.accent,
      category: theme.category
    }));
  }

  private initializeSelectedTheme(): void {
    const currentTheme = this.themeService.getTheme();
    this.selectedTheme = this.themeOptions.find(o => o.id === currentTheme.id) || null;
  }

  onThemeChange(event: any): void {
    if (event.value) {
      this.themeService.setTheme(event.value.id);
    }
  }
}
