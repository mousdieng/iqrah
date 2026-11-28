import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SurahsComponent } from './pages/surahs/surahs.component';
import { SurahDetailComponent } from './pages/surah-detail/surah-detail.component';
import { MemorizationComponent } from './pages/memorization/memorization.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { QuizSessionComponent } from './pages/quiz-session/quiz-session.component';
import { ReviewSessionComponent } from './pages/review-session/review-session.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

/**
 * Four sections: Accueil, Sourates (list + reader), Mémoriser (reviews, bookmarks, quiz), Progrès.
 * Older URLs redirect to their new place so existing links keep working.
 */
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Accueil · Iqrah' },

  { path: 'surahs', component: SurahsComponent, title: 'Sourates · Iqrah' },
  { path: 'surah/:id', component: SurahDetailComponent, title: 'Lecture · Iqrah' },

  { path: 'memorize', component: MemorizationComponent, title: 'Mémoriser · Iqrah' },
  { path: 'memorize/review', component: ReviewSessionComponent, title: 'Révision · Iqrah' },
  { path: 'memorize/quiz', component: QuizComponent, title: 'Quiz · Iqrah' },
  { path: 'memorize/quiz/session', component: QuizSessionComponent, title: 'Quiz · Iqrah' },

  { path: 'progress', component: DashboardComponent, title: 'Progrès · Iqrah' },

  // Former URLs
  { path: 'memorization', redirectTo: 'memorize', pathMatch: 'full' },
  { path: 'favorites', redirectTo: () => '/memorize?tab=bookmarks', pathMatch: 'full' },
  { path: 'quiz', redirectTo: 'memorize/quiz', pathMatch: 'full' },
  { path: 'quiz/session', redirectTo: 'memorize/quiz/session', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'progress', pathMatch: 'full' },
  { path: 'study', redirectTo: 'surahs', pathMatch: 'full' },
  { path: 'study/:surahId', redirectTo: ({ params }) => `/surah/${params['surahId']}?mode=study`, pathMatch: 'full' },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];
