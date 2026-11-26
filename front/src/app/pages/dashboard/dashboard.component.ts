import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { StorageService } from '../../services/storage.service';
import { QuranService } from '../../services/quran.service';
import { DashboardStats, StreakInfo, SurahDTO } from '../../models';

interface SurahProgress {
  surahId: number;
  surahName: string;
  totalAyahs: number;
  memorized: number;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    ProgressBarModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = true;

  // Stats
  stats: DashboardStats = {
    totalAyahs: 6236,
    memorized: 0,
    memorizedPercentage: 0,
    dueForReview: 0,
    totalQuizzes: 0,
    averageQuizScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    todayReviewed: 0,
    todayMemorized: 0,
    todayQuizzes: 0,
    todayStudyMinutes: 0
  };

  // Progress by surah
  surahProgress: SurahProgress[] = [];

  // Activity calendar (last 30 days)
  activityDays: { date: Date; hasActivity: boolean; count: number }[] = [];

  // Recent activity
  recentActivity: { type: string; description: string; date: Date }[] = [];

  constructor(
    private storageService: StorageService,
    private quranService: QuranService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load all progress from storage
    const allProgress = this.storageService.getAllProgress();
    const memorizedEntries = Object.entries(allProgress).filter(
      ([_, p]: [string, any]) => p.memorized
    );

    // Calculate stats
    this.stats.memorized = memorizedEntries.length;
    this.stats.memorizedPercentage = Math.round(
      (this.stats.memorized / this.stats.totalAyahs) * 100 * 10
    ) / 10;

    // Calculate due for review (simplified - in real app would use backend)
    const now = new Date();
    this.stats.dueForReview = memorizedEntries.filter(([_, p]: [string, any]) => {
      if (!p.nextReviewDate) return true;
      return new Date(p.nextReviewDate) <= now;
    }).length;

    // Load surahs for progress breakdown
    this.quranService.getAllSurahs().subscribe({
      next: (surahs: SurahDTO[]) => {
        this.calculateSurahProgress(surahs, allProgress);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    // Generate activity calendar
    this.generateActivityCalendar(allProgress);

    // Generate recent activity
    this.generateRecentActivity(allProgress);

    // Calculate streak (simplified)
    this.calculateStreak(allProgress);
  }

  calculateSurahProgress(surahs: SurahDTO[], allProgress: any): void {
    this.surahProgress = surahs
      .map(surah => {
        const surahAyahProgress = Object.entries(allProgress)
          .filter(([_, p]: [string, any]) => p.surahId === surah.number && p.memorized);

        const memorized = surahAyahProgress.length;
        const total = surah.numberOfAyahs;

        return {
          surahId: surah.number,
          surahName: surah.name,
          totalAyahs: total,
          memorized,
          percentage: total > 0 ? Math.round((memorized / total) * 100) : 0
        };
      })
      .filter(s => s.memorized > 0)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 10); // Top 10
  }

  generateActivityCalendar(allProgress: any): void {
    const days: { date: Date; hasActivity: boolean; count: number }[] = [];
    const today = new Date();

    // Last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Count activity for this day
      const count = Object.values(allProgress).filter((p: any) => {
        if (!p.lastReviewDate) return false;
        const reviewDate = new Date(p.lastReviewDate);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === date.getTime();
      }).length;

      days.push({
        date,
        hasActivity: count > 0,
        count
      });
    }

    this.activityDays = days;
  }

  generateRecentActivity(allProgress: any): void {
    const activities: { type: string; description: string; date: Date }[] = [];

    // Get recent memorizations
    const recentMemorized = Object.entries(allProgress)
      .filter(([_, p]: [string, any]) => p.memorized && p.lastReviewDate)
      .map(([id, p]: [string, any]) => ({
        ayahId: parseInt(id),
        date: new Date(p.lastReviewDate)
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    recentMemorized.forEach(item => {
      activities.push({
        type: 'memorization',
        description: `Verset ${item.ayahId} mémorisé`,
        date: item.date
      });
    });

    // Sort by date
    this.recentActivity = activities.sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    ).slice(0, 5);
  }

  calculateStreak(allProgress: any): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    // Check consecutive days
    while (true) {
      const hasActivity = Object.values(allProgress).some((p: any) => {
        if (!p.lastReviewDate) return false;
        const reviewDate = new Date(p.lastReviewDate);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate.getTime() === checkDate.getTime();
      });

      if (hasActivity) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (streak === 0) {
        // Check yesterday if no activity today
        checkDate.setDate(checkDate.getDate() - 1);
        const hadYesterday = Object.values(allProgress).some((p: any) => {
          if (!p.lastReviewDate) return false;
          const reviewDate = new Date(p.lastReviewDate);
          reviewDate.setHours(0, 0, 0, 0);
          return reviewDate.getTime() === checkDate.getTime();
        });
        if (!hadYesterday) break;
      } else {
        break;
      }
    }

    this.stats.currentStreak = streak;
    this.stats.longestStreak = Math.max(streak, this.stats.longestStreak);
  }

  getActivityLevel(count: number): string {
    if (count === 0) return 'none';
    if (count < 5) return 'low';
    if (count < 10) return 'medium';
    return 'high';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    return `Il y a ${diffDays} jours`;
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' }).charAt(0).toUpperCase();
  }
}
