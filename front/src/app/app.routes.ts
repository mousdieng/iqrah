import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SurahsComponent } from './pages/surahs/surahs.component';
import { SurahDetailComponent } from './pages/surah-detail/surah-detail.component';
import { MemorizationComponent } from './pages/memorization/memorization.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Accueil - Iqrah'
  },
  {
    path: 'surahs',
    component: SurahsComponent,
    title: 'Liste des Sourates - Iqrah'
  },
  {
    path: 'surah/:id',
    component: SurahDetailComponent,
    title: 'Sourate - Iqrah'
  },
  {
    path: 'memorization',
    component: MemorizationComponent,
    title: 'Mémorisation - Iqrah'
  },
  {
    path: 'favorites',
    redirectTo: 'memorization',
    pathMatch: 'full'
  },
  {
    path: 'progress',
    redirectTo: 'memorization',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
