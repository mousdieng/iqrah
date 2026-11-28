import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MemorizeService } from '../../../services/memorize.service';
import { SurahCatalogService } from '../../../services/surah-catalog.service';

/** How solid the memorized verses are, the reviews coming up, and the hardest verses */
@Component({
  selector: 'app-review-health',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="health">
      <div class="card">
        <h3 class="card-title">Solidité</h3>
        @if (total()) {
          <div class="strength-bar" role="img" [attr.aria-label]="ariaStrength()">
            @for (b of buckets(); track b.id) {
              @if (b.count) {
                <span [class]="'seg ' + b.id" [style.flex-grow]="b.count" [title]="b.label + ' : ' + b.count"></span>
              }
            }
          </div>
          <ul class="strength-legend">
            @for (b of buckets(); track b.id) {
              <li>
                <span [class]="'sw ' + b.id"></span>
                <span class="b-label">{{ b.label }}</span>
                <span class="b-count">{{ b.count }}</span>
                <span class="b-hint">{{ b.hint }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="empty">Les versets mémorisés apparaîtront ici, du plus fragile au plus solide.</p>
        }
      </div>

      <div class="card">
        <div class="card-head">
          <h3 class="card-title">Révisions à venir</h3>
          <span class="muted">{{ upcomingTotal() }} sur 14 jours</span>
        </div>
        <div class="forecast">
          @for (d of forecast(); track d.key) {
            <div class="f-col" [title]="d.count + ' révision' + (d.count > 1 ? 's' : '')">
              <span class="f-count">{{ d.count || '' }}</span>
              <div class="f-bar"><span [style.height.%]="(d.count / forecastMax()) * 100" [class.today]="$first"></span></div>
              <span class="f-label">{{ d.label }}</span>
            </div>
          }
        </div>
        @if (memorize.due().length) {
          <a routerLink="/memorize/review" class="btn btn-primary btn-sm">
            <i class="pi pi-play" aria-hidden="true"></i> Réviser les {{ memorize.due().length }} du jour
          </a>
        }
      </div>

      <div class="card">
        <h3 class="card-title">Versets les plus difficiles</h3>
        @if (hardest().length) {
          <ul class="hard-list">
            @for (h of hardest(); track h.ayahId) {
              <li>
                <a [routerLink]="['/surah', h.surahId]" [queryParams]="{ ayah: h.ayahId }">{{ h.name }}</a>
                <span class="chip">{{ h.ref }}</span>
                <span class="lapses" [title]="h.lapses + ' fois noté difficile'">{{ h.lapses }}×</span>
              </li>
            }
          </ul>
          <a class="btn btn-secondary btn-sm" routerLink="/memorize/review" [queryParams]="{ ids: hardIds() }">
            <i class="pi pi-refresh" aria-hidden="true"></i> Retravailler ces versets
          </a>
        } @else {
          <p class="empty">Aucun verset difficile pour l'instant. Ceux que vous notez « Difficile » en révision apparaîtront ici.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .health { display: grid; grid-template-columns: 1.1fr 1.2fr 1fr; gap: 1rem; }
    .card { display: flex; flex-direction: column; gap: 0.85rem; }
    .card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
    .card-title { margin: 0; font-size: 0.95rem; }
    .muted, .empty { font-size: 0.8rem; color: var(--color-text-muted); margin: 0; }

    .strength-bar { display: flex; height: 0.9rem; border-radius: 999px; overflow: hidden; background: var(--color-surface-hover); gap: 2px; }
    .seg { flex-basis: 0; min-width: 4px; }
    .fresh, .sw.fresh { background: var(--color-accent); }
    .learning, .sw.learning { background: color-mix(in srgb, var(--color-primary) 45%, var(--color-surface-hover)); }
    .solid, .sw.solid { background: var(--color-primary); }
    .mastered, .sw.mastered { background: var(--color-success); }
    .strength-legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.45rem; }
    .strength-legend li { display: grid; grid-template-columns: 0.75rem 1fr auto; align-items: center; column-gap: 0.5rem; font-size: 0.85rem; }
    .sw { width: 0.75rem; height: 0.75rem; border-radius: 3px; }
    .b-label { color: var(--color-text-primary); }
    .b-count { font-weight: 700; font-variant-numeric: tabular-nums; }
    .b-hint { grid-column: 2 / -1; font-size: 0.72rem; color: var(--color-text-muted); }

    .forecast { display: grid; grid-template-columns: repeat(14, 1fr); gap: 0.25rem; height: 7rem; }
    .f-col { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .f-count { height: 0.9rem; font-size: 0.65rem; font-weight: 600; color: var(--color-text-secondary); }
    .f-bar { flex: 1; width: 100%; display: flex; flex-direction: column-reverse; border-radius: 3px; background: var(--color-surface-hover); overflow: hidden; }
    .f-bar span { background: var(--color-primary); opacity: 0.75; }
    .f-bar span.today { background: var(--color-accent); opacity: 1; }
    .f-label { font-size: 0.6rem; color: var(--color-text-muted); white-space: nowrap; }
    .btn { align-self: flex-start; }

    .hard-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .hard-list li { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
    .hard-list a { color: var(--color-text-primary); font-weight: 600; text-decoration: none; }
    .hard-list a:hover { color: var(--color-primary); }
    .lapses { margin-left: auto; font-size: 0.75rem; font-weight: 700; color: var(--color-error); }

    @media (max-width: 960px) { .health { grid-template-columns: 1fr 1fr; } .health > :last-child { grid-column: 1 / -1; } }
    @media (max-width: 640px) { .health { grid-template-columns: 1fr; } }
  `]
})
export class ReviewHealthComponent {
  readonly memorize = inject(MemorizeService);
  private catalog = inject(SurahCatalogService);

  readonly buckets = computed(() => {
    const s = this.memorize.strength();
    return [
      { id: 'fresh', label: 'Nouveaux', count: s.fresh, hint: 'pas encore révisés' },
      { id: 'learning', label: 'En cours', count: s.learning, hint: 'révision sous 7 jours' },
      { id: 'solid', label: 'Solides', count: s.solid, hint: 'révision dans 1 à 4 semaines' },
      { id: 'mastered', label: 'Maîtrisés', count: s.mastered, hint: 'révision dans plus d\'un mois' }
    ];
  });

  readonly total = computed(() => this.buckets().reduce((sum, b) => sum + b.count, 0));
  readonly ariaStrength = computed(() => this.buckets().map(b => `${b.label} ${b.count}`).join(', '));

  readonly forecast = computed(() => {
    this.memorize.progress();
    return this.memorize.forecast(14);
  });
  readonly forecastMax = computed(() => Math.max(1, ...this.forecast().map(d => d.count)));
  readonly upcomingTotal = computed(() => this.forecast().reduce((sum, d) => sum + d.count, 0));

  readonly hardest = computed(() => {
    this.catalog.surahs();
    return this.memorize.hardest().map(p => {
      const where = this.catalog.locate(p.ayahId);
      return {
        ayahId: p.ayahId,
        surahId: where?.surah.number ?? p.surahId,
        name: where?.surah.englishName ?? `Sourate ${p.surahId}`,
        ref: where ? `${where.surah.number}:${where.numberInSurah}` : `#${p.ayahId}`,
        lapses: p.lapses ?? 0
      };
    });
  });

  readonly hardIds = computed(() => this.hardest().map(h => h.ayahId).join(','));
}
