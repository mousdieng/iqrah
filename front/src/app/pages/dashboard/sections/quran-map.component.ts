import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemorizeService } from '../../../services/memorize.service';
import { SurahCatalogService } from '../../../services/surah-catalog.service';
import { JUZ_START_IDS, juzRange } from '../../../shared/juz';

interface Tile {
  number: number;
  title: string;
  memorized: number;
  total: number;
  percent: number;
  level: 0 | 1 | 2 | 3 | 4;
  link: (string | number)[];
  query?: Record<string, number>;
}

/** The whole Quran at a glance: 30 juz or 114 surahs, colored by how much is memorized */
@Component({
  selector: 'app-quran-map',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card map">
      <div class="map-head">
        <div class="segmented" role="tablist" aria-label="Vue de la carte">
          <button type="button" role="tab" [class.active]="view() === 'juz'" [attr.aria-selected]="view() === 'juz'" (click)="view.set('juz')">30 juz</button>
          <button type="button" role="tab" [class.active]="view() === 'surah'" [attr.aria-selected]="view() === 'surah'" (click)="view.set('surah')">114 sourates</button>
        </div>
        <span class="map-summary">{{ startedCount() }} commencé{{ startedCount() > 1 ? 's' : '' }} · {{ completeCount() }} complet{{ completeCount() > 1 ? 's' : '' }}</span>
      </div>

      @if (view() === 'juz') {
        <div class="juz-grid">
          @for (t of juzTiles(); track t.number) {
            <a class="juz" [class]="'juz l' + t.level" [routerLink]="t.link" [queryParams]="t.query" [title]="t.title">
              <span class="juz-fill" [style.height.%]="t.percent"></span>
              <span class="juz-num">{{ t.number }}</span>
              <span class="juz-percent">{{ t.percent }}%</span>
            </a>
          }
        </div>
      } @else {
        <div class="surah-grid">
          @for (t of surahTiles(); track t.number) {
            <a class="surah" [class]="'surah l' + t.level" [routerLink]="t.link" [title]="t.title">{{ t.number }}</a>
          }
        </div>
      }

      <div class="legend">
        <span class="sw l0"></span> pas commencé
        <span class="sw l1"></span> commencé
        <span class="sw l3"></span> plus de la moitié
        <span class="sw l4"></span> complet
      </div>
    </div>
  `,
  styles: [`
    .map { display: flex; flex-direction: column; gap: 1rem; }
    .map-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
    .map-summary { font-size: 0.85rem; color: var(--color-text-muted); }

    .juz-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 0.5rem; }
    .juz {
      position: relative; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 3.6rem; border-radius: var(--radius-md); border: 1px solid var(--color-card-border);
      background: var(--color-surface); color: var(--color-text-primary); text-decoration: none;
      transition: transform var(--transition-fast), border-color var(--transition-fast);
    }
    .juz:hover { transform: translateY(-2px); border-color: var(--color-primary); }
    .juz-fill { position: absolute; left: 0; right: 0; bottom: 0; background: color-mix(in srgb, var(--color-primary) 22%, transparent); }
    .juz.l4 .juz-fill { background: color-mix(in srgb, var(--color-success) 30%, transparent); }
    .juz-num { position: relative; font-weight: 700; font-size: 1.05rem; }
    .juz-percent { position: relative; font-size: 0.68rem; color: var(--color-text-muted); }
    .juz.l4 { border-color: var(--color-success); }

    .surah-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(2.1rem, 1fr)); gap: 0.3rem; }
    .surah {
      display: grid; place-items: center; aspect-ratio: 1; border-radius: 6px; font-size: 0.7rem; font-weight: 600;
      text-decoration: none; color: var(--color-text-muted); background: var(--color-surface-hover);
      transition: transform var(--transition-fast);
    }
    .surah:hover { transform: scale(1.12); }
    .surah.l1 { background: color-mix(in srgb, var(--color-primary) 22%, var(--color-surface-hover)); color: var(--color-text-primary); }
    .surah.l2 { background: color-mix(in srgb, var(--color-primary) 40%, var(--color-surface-hover)); color: var(--color-text-primary); }
    .surah.l3 { background: color-mix(in srgb, var(--color-primary) 65%, var(--color-surface-hover)); color: #fff; }
    .surah.l4 { background: var(--color-success); color: #fff; }

    .legend { display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; font-size: 0.72rem; color: var(--color-text-muted); }
    .sw { width: 0.8rem; height: 0.8rem; border-radius: 3px; margin-left: 0.4rem; background: var(--color-surface-hover); }
    .sw.l1 { background: color-mix(in srgb, var(--color-primary) 22%, var(--color-surface-hover)); }
    .sw.l3 { background: color-mix(in srgb, var(--color-primary) 65%, var(--color-surface-hover)); }
    .sw.l4 { background: var(--color-success); }

    @media (max-width: 640px) {
      .juz-grid { grid-template-columns: repeat(6, 1fr); gap: 0.35rem; }
      .juz-num { font-size: 0.9rem; }
    }
  `]
})
export class QuranMapComponent {
  private memorize = inject(MemorizeService);
  private catalog = inject(SurahCatalogService);

  readonly view = signal<'juz' | 'surah'>('juz');

  readonly juzTiles = computed<Tile[]>(() => {
    const known = this.memorize.memorizedIds();
    this.catalog.surahs();
    return JUZ_START_IDS.map((_, i) => {
      const juz = i + 1;
      const { from, to } = juzRange(juz);
      let memorized = 0;
      for (const id of known) if (id >= from && id <= to) memorized++;
      const total = to - from + 1;
      const start = this.catalog.locate(from);
      return this.tile(juz, `Juz ${juz}`, memorized, total,
        start ? ['/surah', start.surah.number] : ['/surahs'], start ? { ayah: from } : undefined);
    });
  });

  readonly surahTiles = computed<Tile[]>(() => {
    const known = this.memorize.memorizedIds();
    return this.catalog.surahs().map(s => {
      const first = this.catalog.firstAyahId(s.number) ?? 0;
      let memorized = 0;
      for (let id = first; id < first + s.numberOfAyahs; id++) if (known.has(id)) memorized++;
      return this.tile(s.number, `${s.number}. ${s.englishName}`, memorized, s.numberOfAyahs, ['/surah', s.number]);
    });
  });

  private readonly tiles = computed(() => this.view() === 'juz' ? this.juzTiles() : this.surahTiles());
  readonly startedCount = computed(() => this.tiles().filter(t => t.memorized > 0).length);
  readonly completeCount = computed(() => this.tiles().filter(t => t.level === 4).length);

  private tile(number: number, name: string, memorized: number, total: number,
               link: (string | number)[], query?: Record<string, number>): Tile {
    const ratio = total ? memorized / total : 0;
    const level = memorized === 0 ? 0 : ratio >= 1 ? 4 : ratio >= 0.5 ? 3 : ratio >= 0.2 ? 2 : 1;
    return {
      number, link, query, memorized, total, level,
      percent: Math.floor(ratio * 100),
      title: `${name} · ${memorized} / ${total} versets mémorisés`
    };
  }
}
