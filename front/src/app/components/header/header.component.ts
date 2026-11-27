import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';

interface NavItem {
  label: string;
  icon: string;
  link: string;
  /** URL prefixes that belong to this section (e.g. the reader belongs to "Sourates") */
  matches: string[];
}

/** Top bar (all screens) and bottom tab bar (phones) with the four sections of the app */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, ThemeSwitcherComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private router = inject(Router);

  readonly navItems: NavItem[] = [
    { label: 'Accueil',   icon: 'pi pi-home',       link: '/',         matches: [] },
    { label: 'Sourates',  icon: 'pi pi-book',       link: '/surahs',   matches: ['/surahs', '/surah/'] },
    { label: 'Mémoriser', icon: 'pi pi-bookmark',   link: '/memorize', matches: ['/memorize'] },
    { label: 'Progrès',   icon: 'pi pi-chart-line', link: '/progress', matches: ['/progress'] }
  ];

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  /** The reader has its own audio bar at the bottom, so the phone tab bar steps aside there */
  readonly onReader = computed(() => this.url().startsWith('/surah/'));

  isActive(item: NavItem): boolean {
    const path = this.url().split(/[?#]/)[0];
    if (item.link === '/') return path === '/';
    return item.matches.some(prefix => path.startsWith(prefix));
  }
}
