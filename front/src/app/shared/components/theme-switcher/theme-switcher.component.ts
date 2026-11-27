import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { THEME_ICONS } from '../../../core/config/themes.config';

/** Button that opens a small menu to pick the Clair, Sombre or Sépia theme */
@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent {
  private themeService = inject(ThemeService);
  private host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);
  readonly themes = this.themeService.getThemes().map(t => ({ id: t.id, name: t.name, icon: THEME_ICONS[t.id] }));
  readonly currentId = computed(() => this.themeService.theme().id);
  readonly currentIcon = computed(() => THEME_ICONS[this.currentId()] ?? 'pi pi-sun');
  readonly currentName = computed(() => this.themeService.theme().name);

  toggle(): void {
    this.open.update(v => !v);
  }

  choose(id: string): void {
    this.themeService.setTheme(id);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
