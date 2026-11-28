import { Injectable, signal } from '@angular/core';

export interface LastRead {
  surahId: number;
  page: number;
  at: string;   // ISO date
}

const KEY = 'iqrah_last_read';
const LOG_KEY = 'iqrah_read_log';
const LOG_DAYS = 400;

/** Local calendar day, e.g. 2026-11-28 */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
}

/** Remembers where the reader stopped, for "Reprendre la lecture" on the home page */
@Injectable({ providedIn: 'root' })
export class ReadingHistoryService {
  readonly lastRead = signal<LastRead | null>(this.load());
  /** Mushaf pages opened, per day: { '2026-11-28': [1, 2, 3] } */
  readonly pagesByDay = signal<Record<string, number[]>>(this.loadLog());

  record(surahId: number, page: number): void {
    const entry: LastRead = { surahId, page, at: new Date().toISOString() };
    this.lastRead.set(entry);
    try {
      localStorage.setItem(KEY, JSON.stringify(entry));
    } catch {
      // storage full or unavailable: keep the in-memory value
    }
    this.logPage(page);
  }

  private logPage(page: number): void {
    const key = today();
    const log = this.pagesByDay();
    if (log[key]?.includes(page)) return;
    const next: Record<string, number[]> = { ...log, [key]: [...(log[key] ?? []), page] };
    // Keep the log small: only the last LOG_DAYS days
    const keys = Object.keys(next).sort();
    for (const old of keys.slice(0, Math.max(0, keys.length - LOG_DAYS))) delete next[old];
    this.pagesByDay.set(next);
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  private loadLog(): Record<string, number[]> {
    try {
      return JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
    } catch {
      return {};
    }
  }

  private load(): LastRead | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) as LastRead : null;
    } catch {
      return null;
    }
  }
}
