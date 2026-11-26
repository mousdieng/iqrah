import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SurahsComponent } from './pages/surahs/surahs.component';
import { SurahDetailComponent } from './pages/surah-detail/surah-detail.component';
import { MemorizationComponent } from './pages/memorization/memorization.component';
import { StudyComponent } from './pages/study/study.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { QuizSessionComponent } from './pages/quiz-session/quiz-session.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

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
    path: 'study',
    component: StudyComponent,
    title: 'Mode Étude - Iqrah'
  },
  {
    path: 'study/:surahId',
    component: StudyComponent,
    title: 'Mode Étude - Iqrah'
  },
  {
    path: 'quiz',
    component: QuizComponent,
    title: 'Quiz - Iqrah'
  },
  {
    path: 'quiz/session',
    component: QuizSessionComponent,
    title: 'Session Quiz - Iqrah'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Tableau de Bord - Iqrah'
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
