import { Injectable, signal } from '@angular/core';

export interface LastRead {
  surahId: number;
  page: number;
  at: string;   // ISO date
}

const KEY = 'iqrah_last_read';

/** Remembers where the reader stopped, for "Reprendre la lecture" on the home page */
@Injectable({ providedIn: 'root' })
export class ReadingHistoryService {
  readonly lastRead = signal<LastRead | null>(this.load());

  record(surahId: number, page: number): void {
    const entry: LastRead = { surahId, page, at: new Date().toISOString() };
    this.lastRead.set(entry);
    try {
      localStorage.setItem(KEY, JSON.stringify(entry));
    } catch {
      // storage full or unavailable: keep the in-memory value
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
