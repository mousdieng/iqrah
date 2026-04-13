import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  mobileMenuOpen = false;

  menuItems: MenuItem[] = [
    {
      label: 'Accueil',
      icon: 'pi pi-home',
      routerLink: '/'
    },
    {
      label: 'Sourates',
      icon: 'pi pi-book',
      routerLink: '/surahs'
    },
    {
      label: 'Mémorisation',
      icon: 'pi pi-star',
      routerLink: '/memorization'
    },
    {
      label: 'Favoris',
      icon: 'pi pi-heart',
      routerLink: '/favorites'
    },
    {
      label: 'Progression',
      icon: 'pi pi-chart-line',
      routerLink: '/progress'
    }
  ];

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
