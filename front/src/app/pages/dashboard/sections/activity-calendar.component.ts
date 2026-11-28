import { Component, ElementRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { MemorizeService, dayKey } from '../../../services/memorize.service';
import { ReadingHistoryService } from '../../../services/reading-history.service';

interface Cell {
  key: string;
  date: Date;
  learned: number;
  reviewed: number;
  pages: number;
  level: 0 | 1 | 2 | 3 | 4;
  future: boolean;
}

const WEEKS = 26;

/** Calendar of the last 6 months (learned, reviewed, pages read per day), streaks and weekly totals */
@Component({
  selector: 'app-activity-calendar',
  standalone: true,
  template: `
    <div class="card activity">
      <div class="activity-stats">
        <div class="a-stat"><span class="a-value">{{ memorize.streak() }}</span><span class="a-label">jours d'affilée</span></div>
        <div class="a-stat"><span class="a-value">{{ memorize.bestStreak() }}</span><span class="a-label">meilleure série</span></div>
        <div class="a-stat"><span class="a-value">{{ month().learned }}</span><span class="a-label">appris ce mois</span></div>
        <div class="a-stat"><span class="a-value">{{ month().reviewed }}</span><span class="a-label">révisés ce mois</span></div>
        <div class="a-stat"><span class="a-value">{{ month().pages }}</span><span class="a-label">pages lues ce mois</span></div>
      </div>

      <div class="heatmap-scroll" #scroller>
        <div class="heatmap" [style.--weeks]="weeks().length">
          <div class="months">
            @for (m of monthLabels(); track m.index) {
              <span [style.grid-column]="m.index + 1">{{ m.label }}</span>
            }
          </div>
          <div class="days">
            <span>L</span><span></span><span>M</span><span></span><span>V</span><span></span><span></span>
          </div>
          <div class="grid">
            @for (week of weeks(); track $index) {
              <div class="week">
                @for (c of week; track c.key) {
                  <span class="cell" [class]="'cell l' + c.level" [class.future]="c.future" [class.today]="c.key === todayKey"
                        [title]="tooltip(c)"></span>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="legend">
        Moins <span class="cell l0"></span><span class="cell l1"></span><span class="cell l2"></span><span class="cell l3"></span><span class="cell l4"></span> Plus
      </div>

      <h3 class="sub-title">12 dernières semaines</h3>
      <div class="weekly">
        @for (w of weekly(); track w.label) {
          <div class="w-col" [title]="w.label + ' : ' + w.learned + ' appris, ' + w.reviewed + ' révisés'">
            <div class="w-bar">
              <span class="w-reviewed" [style.height.%]="(w.reviewed / weeklyMax()) * 100"></span>
              <span class="w-learned" [style.height.%]="(w.learned / weeklyMax()) * 100"></span>
            </div>
            <span class="w-label">{{ w.label }}</span>
          </div>
        }
      </div>
      <div class="legend left"><span class="dot learned"></span> appris <span class="dot reviewed"></span> révisés</div>
    </div>
  `,
  styles: [`
    .activity { display: flex; flex-direction: column; gap: 1rem; }
    .activity-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.75rem; }
    .a-stat { display: flex; flex-direction: column; }
    .a-value { font-size: 1.5rem; font-weight: 700; color: var(--color-text-primary); font-variant-numeric: tabular-nums; }
    .a-label { font-size: 0.78rem; color: var(--color-text-muted); }

    .heatmap-scroll { overflow-x: auto; padding-bottom: 0.25rem; }
    .heatmap { --cell: 0.95rem; display: grid; grid-template-columns: 1.2rem max-content; grid-template-rows: auto auto; gap: 0.25rem 0.35rem; width: max-content; margin: 0 auto; }
    .months { grid-column: 2; display: grid; grid-template-columns: repeat(var(--weeks), var(--cell)); column-gap: 3px; font-size: 0.7rem; color: var(--color-text-muted); }
    .months span { white-space: nowrap; }
    .days { display: grid; grid-template-rows: repeat(7, var(--cell)); gap: 3px; font-size: 0.65rem; color: var(--color-text-muted); }
    .days span { line-height: 1; display: flex; align-items: center; }
    .grid { display: grid; grid-template-columns: repeat(var(--weeks), var(--cell)); gap: 3px; }
    .week { display: grid; grid-template-rows: repeat(7, var(--cell)); gap: 3px; }

    .cell { display: inline-block; width: var(--cell, 0.75rem); height: var(--cell, 0.75rem); border-radius: 3px; background: var(--color-surface-hover); }
    .cell.l1 { background: color-mix(in srgb, var(--color-primary) 28%, var(--color-surface-hover)); }
    .cell.l2 { background: color-mix(in srgb, var(--color-primary) 50%, var(--color-surface-hover)); }
    .cell.l3 { background: color-mix(in srgb, var(--color-primary) 75%, var(--color-surface-hover)); }
    .cell.l4 { background: var(--color-primary); }
    .cell.future { visibility: hidden; }
    .cell.today { outline: 2px solid var(--color-accent); outline-offset: 1px; }

    .legend { display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; font-size: 0.72rem; color: var(--color-text-muted); }
    .legend.left { justify-content: flex-start; gap: 0.35rem; }
    .legend .cell { --cell: 0.75rem; }
    .dot { width: 0.55rem; height: 0.55rem; border-radius: 2px; margin-left: 0.35rem; }
    .dot.learned, .w-learned { background: var(--color-primary); }
    .dot.reviewed, .w-reviewed { background: var(--color-accent); opacity: 0.75; }

    .sub-title { margin: 0.25rem 0 0; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-text-muted); }
    .weekly { display: grid; grid-template-columns: repeat(12, 1fr); gap: 0.4rem; height: 6.5rem; }
    .w-col { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
    .w-bar { flex: 1; width: 100%; max-width: 1.75rem; display: flex; flex-direction: column-reverse; border-radius: 4px; background: var(--color-surface-hover); overflow: hidden; }
    .w-label { font-size: 0.65rem; color: var(--color-text-muted); white-space: nowrap; }

    @media (max-width: 640px) {
      .activity-stats { grid-template-columns: repeat(3, 1fr); }
      .a-value { font-size: 1.25rem; }
      .heatmap { --cell: 0.8rem; margin: 0; }
      .weekly { gap: 0.2rem; }
      .w-label { font-size: 0.55rem; }
    }
  `]
})
export class ActivityCalendarComponent {
  readonly memorize = inject(MemorizeService);
  private reading = inject(ReadingHistoryService);

  readonly todayKey = dayKey();
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  constructor() {
    // On narrow screens the calendar scrolls: start on the most recent weeks
    afterNextRender(() => {
      const el = this.scroller()?.nativeElement;
      if (el) el.scrollLeft = el.scrollWidth;
    });
  }

  /** One column per week, Monday first, ending with the current week */
  readonly weeks = computed<Cell[][]>(() => {
    const log = this.memorize.log();
    const pages = this.reading.pagesByDay();
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const start = new Date(today);
    const weekday = (today.getDay() + 6) % 7;   // 0 = Monday
    start.setDate(today.getDate() - weekday - (WEEKS - 1) * 7);

    const weeks: Cell[][] = [];
    for (let w = 0; w < WEEKS; w++) {
      const week: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = dayKey(date);
        const learned = log[key]?.learned ?? 0;
        const reviewed = log[key]?.reviewed ?? 0;
        const read = pages[key]?.length ?? 0;
        week.push({ key, date, learned, reviewed, pages: read, level: this.level(learned * 2 + reviewed + read), future: date > today });
      }
      weeks.push(week);
    }
    return weeks;
  });

  /** Month name above the first week that starts in it */
  readonly monthLabels = computed(() => {
    const labels: { index: number; label: string }[] = [];
    let last = -1;
    this.weeks().forEach((week, index) => {
      const month = week[0].date.getMonth();
      if (month !== last) {
        if (index < this.weeks().length - 1) labels.push({ index, label: week[0].date.toLocaleDateString('fr-FR', { month: 'short' }) });
        last = month;
      }
    });
    return labels;
  });

  readonly month = computed(() => {
    const prefix = dayKey().slice(0, 7);
    const log = this.memorize.log();
    const pages = this.reading.pagesByDay();
    let learned = 0, reviewed = 0, read = 0;
    for (const [key, d] of Object.entries(log)) if (key.startsWith(prefix)) { learned += d.learned; reviewed += d.reviewed; }
    for (const [key, p] of Object.entries(pages)) if (key.startsWith(prefix)) read += p.length;
    return { learned, reviewed, pages: read };
  });

  /** Totals for each of the last 12 weeks */
  readonly weekly = computed(() => {
    const all = this.weeks();
    return all.slice(-12).map(week => ({
      label: week[0].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' }),
      learned: week.reduce((s, c) => s + c.learned, 0),
      reviewed: week.reduce((s, c) => s + c.reviewed, 0)
    }));
  });

  readonly weeklyMax = computed(() => Math.max(1, ...this.weekly().map(w => w.learned + w.reviewed)));

  tooltip(c: Cell): string {
    const date = c.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!c.learned && !c.reviewed && !c.pages) return `${date} : aucune activité`;
    const parts = [];
    if (c.learned) parts.push(`${c.learned} appris`);
    if (c.reviewed) parts.push(`${c.reviewed} révisés`);
    if (c.pages) parts.push(`${c.pages} page${c.pages > 1 ? 's' : ''} lue${c.pages > 1 ? 's' : ''}`);
    return `${date} : ${parts.join(', ')}`;
  }

  private level(score: number): Cell['level'] {
    if (score <= 0) return 0;
    if (score < 4) return 1;
    if (score < 10) return 2;
    if (score < 20) return 3;
    return 4;
  }
}
