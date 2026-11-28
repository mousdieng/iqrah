import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StorageService } from './storage.service';
import { SurahCatalogService } from './surah-catalog.service';
import { UserProgress } from '../models';

export type ReviewRating = 'hard' | 'good' | 'easy';

/** What was done on one day */
export interface DayLog {
  learned: number;
  reviewed: number;
}

const LOG_KEY = 'iqrah_memo_log';
const GOAL_KEY = 'iqrah_memo_goal';
const FOCUS_KEY = 'iqrah_memo_focus';
const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;

/** Local calendar day, e.g. 2026-11-28 */
export function dayKey(date = new Date()): string {
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/**
 * Memorization: which verses are known, when to review them (spaced repetition),
 * marking many verses at once, the daily goal, the streak and what to learn next.
 * Progress itself is stored by StorageService.
 */
@Injectable({ providedIn: 'root' })
export class MemorizeService {
  private storage = inject(StorageService);
  private catalog = inject(SurahCatalogService);

  readonly progress = toSignal(this.storage.progress$, { initialValue: this.storage.getProgress() });

  readonly memorizedIds = computed(() => new Set(this.progress().filter(p => p.memorized).map(p => p.ayahId)));

  /** Memorized verses whose review date has come, oldest due first */
  readonly due = computed(() => {
    const now = Date.now();
    return this.progress()
      .filter(p => p.memorized && this.storage.dueDate(p).getTime() <= now)
      .sort((a, b) => this.storage.dueDate(a).getTime() - this.storage.dueDate(b).getTime() || a.ayahId - b.ayahId);
  });

  // ─── Daily goal, log and streak ────────────────────────────────────────────

  readonly goal = signal<number>(this.loadNumber(GOAL_KEY, 5));
  readonly log = signal<Record<string, DayLog>>(this.loadLog());

  readonly today = computed<DayLog>(() => this.log()[dayKey()] ?? { learned: 0, reviewed: 0 });

  /** Days in a row with some memorization work, ending today (or yesterday if today is still empty) */
  readonly streak = computed(() => {
    const log = this.log();
    const active = (d: Date) => {
      const day = log[dayKey(d)];
      return !!day && (day.learned > 0 || day.reviewed > 0);
    };
    const cursor = new Date();
    if (!active(cursor)) cursor.setDate(cursor.getDate() - 1);
    let count = 0;
    while (active(cursor)) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  });

  /** The last 7 days, oldest first, for a small activity chart */
  readonly week = computed(() => {
    const log = this.log();
    const days: { key: string; label: string; learned: number; reviewed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const entry = log[dayKey(d)] ?? { learned: 0, reviewed: 0 };
      days.push({
        key: dayKey(d),
        label: d.toLocaleDateString('fr-FR', { weekday: 'narrow' }),
        ...entry
      });
    }
    return days;
  });

  /** Longest run of active days ever */
  readonly bestStreak = computed(() => {
    const days = Object.entries(this.log())
      .filter(([, d]) => d.learned > 0 || d.reviewed > 0)
      .map(([key]) => key)
      .sort();
    let best = 0;
    let run = 0;
    let previous: Date | null = null;
    for (const key of days) {
      const date = new Date(`${key}T12:00:00`);
      run = previous && Math.round((date.getTime() - previous.getTime()) / 86_400_000) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      previous = date;
    }
    return Math.max(best, this.streak());
  });

  /** Verses learned over the last `days` days (for the pace estimate) */
  learnedInLast(days: number): number {
    const log = this.log();
    let total = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      total += log[dayKey(d)]?.learned ?? 0;
    }
    return total;
  }

  /**
   * How well each memorized verse is held, from its review interval:
   * new (never reviewed), learning (< 7 days), solid (7-30 days), mastered (> 30 days).
   */
  readonly strength = computed(() => {
    const buckets = { fresh: 0, learning: 0, solid: 0, mastered: 0 };
    for (const p of this.progress()) {
      if (!p.memorized) continue;
      const interval = p.intervalDays ?? 0;
      if (!p.reviewCount) buckets.fresh++;
      else if (interval < 7) buckets.learning++;
      else if (interval <= 30) buckets.solid++;
      else buckets.mastered++;
    }
    return buckets;
  });

  /** Reviews coming up over the next `days` days (overdue ones count for today) */
  forecast(days = 14): { key: string; label: string; count: number }[] {
    const result = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      result.push({ key: dayKey(d), label: i === 0 ? 'auj.' : d.toLocaleDateString('fr-FR', { day: 'numeric' }), count: 0 });
    }
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    for (const p of this.progress()) {
      if (!p.memorized) continue;
      const due = this.storage.dueDate(p);
      if (due >= end) continue;
      const index = due < start ? 0 : Math.floor((due.getTime() - start.getTime()) / 86_400_000);
      if (result[index]) result[index].count++;
    }
    return result;
  }

  /** Memorized verses that were hardest to recall: most "Difficile" ratings, then lowest ease */
  readonly hardest = computed(() =>
    this.progress()
      .filter(p => p.memorized && ((p.lapses ?? 0) > 0 || (p.ease ?? 2.5) < 2.5))
      .sort((a, b) => (b.lapses ?? 0) - (a.lapses ?? 0) || (a.ease ?? 2.5) - (b.ease ?? 2.5))
      .slice(0, 6)
  );

  setGoal(goal: number): void {
    const value = Math.max(1, Math.min(50, Math.round(goal)));
    this.goal.set(value);
    localStorage.setItem(GOAL_KEY, String(value));
  }

  // ─── Surah being learned and what comes next ───────────────────────────────

  /** Surah chosen for learning; by default the one of the last verse memorized, else Al-Fatiha */
  readonly focusSurah = signal<number>(this.loadNumber(FOCUS_KEY, 0));

  readonly currentSurah = computed(() => {
    const chosen = this.focusSurah();
    if (chosen >= 1 && chosen <= 114) return chosen;
    const last = [...this.progress()]
      .filter(p => p.memorized && p.surahId)
      .sort((a, b) => (b.memorizedAt ?? '').localeCompare(a.memorizedAt ?? '') || b.ayahId - a.ayahId)[0];
    return last?.surahId || 1;
  });

  setFocusSurah(surah: number): void {
    this.focusSurah.set(surah);
    localStorage.setItem(FOCUS_KEY, String(surah));
  }

  /** Verses of the current surah not memorized yet, in order */
  readonly remainingInSurah = computed(() => {
    const surah = this.catalog.get(this.currentSurah());
    const first = surah ? this.catalog.firstAyahId(surah.number) : null;
    if (!surah || !first) return [] as { ayahId: number; surahId: number; numberInSurah: number }[];
    const known = this.memorizedIds();
    const list = [];
    for (let n = 1; n <= surah.numberOfAyahs; n++) {
      const ayahId = first + n - 1;
      if (!known.has(ayahId)) list.push({ ayahId, surahId: surah.number, numberInSurah: n });
    }
    return list;
  });

  /** Today's new verses: as many as the goal still asks for (at least the next one) */
  readonly nextToLearn = computed(() => {
    const left = Math.max(1, this.goal() - this.today().learned);
    return this.remainingInSurah().slice(0, left);
  });

  /** Memorized count for every surah that has at least one memorized verse */
  readonly surahProgress = computed(() => {
    const counts = new Map<number, number>();
    for (const p of this.progress()) {
      if (p.memorized && p.surahId) counts.set(p.surahId, (counts.get(p.surahId) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([surahId, memorized]) => {
        const surah = this.catalog.get(surahId);
        const total = surah?.numberOfAyahs ?? 0;
        return { surahId, name: surah?.englishName ?? `Sourate ${surahId}`, arabic: surah?.name ?? '', memorized, total,
                 percent: total ? Math.round((memorized / total) * 100) : 0 };
      })
      .sort((a, b) => a.surahId - b.surahId);
  });

  // ─── Marking ───────────────────────────────────────────────────────────────

  isMemorized(ayahId: number): boolean {
    return this.memorizedIds().has(ayahId);
  }

  /** Marks verses as memorized; the ones that were not yet count as learned today */
  markMemorized(items: { ayahId: number; surahId: number }[]): number {
    const known = this.memorizedIds();
    const fresh = items.filter(i => !known.has(i.ayahId));
    if (!fresh.length) return 0;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.storage.updateMany(fresh.map(i => {
      const existing = this.storage.getAyahProgress(i.ayahId);
      return {
        ayahId: i.ayahId,
        surahId: i.surahId,
        memorized: true,
        memorizedAt: existing?.memorizedAt ?? now.toISOString(),
        ease: existing?.ease ?? DEFAULT_EASE,
        intervalDays: 1,
        nextReviewDate: tomorrow.toISOString()
      };
    }));
    this.addToLog({ learned: fresh.length });
    return fresh.length;
  }

  unmarkMemorized(ayahIds: number[]): void {
    const known = this.memorizedIds();
    const ids = ayahIds.filter(id => known.has(id));
    if (!ids.length) return;
    // Verses learned today and taken back no longer count toward today's goal
    const today = dayKey();
    const learnedToday = ids.filter(id => {
      const at = this.storage.getAyahProgress(id)?.memorizedAt;
      return at && dayKey(new Date(at)) === today;
    }).length;
    this.storage.updateMany(ids.map(ayahId => ({ ayahId, memorized: false, memorizedAt: undefined })));
    if (learnedToday) this.addToLog({ learned: -learnedToday });
  }

  // ─── Spaced review ─────────────────────────────────────────────────────────

  /** Days until the next review if the verse is rated this way now */
  nextInterval(p: UserProgress | undefined, rating: ReviewRating): number {
    const interval = p?.intervalDays ?? 0;
    const ease = p?.ease ?? DEFAULT_EASE;
    switch (rating) {
      case 'hard': return 1;
      case 'good': return interval < 1 ? 1 : interval < 3 ? 3 : Math.round(interval * ease);
      case 'easy': return interval < 1 ? 4 : Math.round(Math.max(interval, 3) * ease * 1.3);
    }
  }

  /** Records a review: the better it went, the later the verse comes back */
  review(ayahId: number, rating: ReviewRating): void {
    const p = this.storage.getAyahProgress(ayahId);
    if (!p) return;
    const ease = p.ease ?? DEFAULT_EASE;
    const nextEase = rating === 'hard' ? Math.max(MIN_EASE, ease - 0.2) : rating === 'easy' ? ease + 0.15 : ease;
    const days = this.nextInterval(p, rating);
    const next = new Date();
    next.setDate(next.getDate() + days);
    next.setHours(4, 0, 0, 0);   // due from early morning that day
    this.storage.updateProgress({
      ayahId,
      reviewCount: (p.reviewCount ?? 0) + 1,
      ease: nextEase,
      intervalDays: days,
      nextReviewDate: next.toISOString(),
      difficulty: rating === 'hard' ? 'HARD' : rating === 'easy' ? 'EASY' : 'MEDIUM',
      lapses: (p.lapses ?? 0) + (rating === 'hard' ? 1 : 0)
    });
    this.addToLog({ reviewed: 1 });
  }

  intervalLabel(days: number): string {
    if (days <= 1) return 'demain';
    if (days < 30) return `${days} j`;
    const months = Math.round(days / 30);
    return `${months} mois`;
  }

  // ─── Storage ───────────────────────────────────────────────────────────────

  private addToLog(add: Partial<DayLog>): void {
    const key = dayKey();
    this.log.update(log => {
      const day = log[key] ?? { learned: 0, reviewed: 0 };
      const next = { ...log, [key]: {
        learned: Math.max(0, day.learned + (add.learned ?? 0)),
        reviewed: Math.max(0, day.reviewed + (add.reviewed ?? 0))
      } };
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
      return next;
    });
  }

  private loadLog(): Record<string, DayLog> {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private loadNumber(key: string, fallback: number): number {
    const value = parseInt(localStorage.getItem(key) ?? '', 10);
    return isFinite(value) ? value : fallback;
  }
}
