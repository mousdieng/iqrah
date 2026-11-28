import { Component, computed, inject } from '@angular/core';
import { MemorizeService } from '../../../services/memorize.service';
import { SurahCatalogService } from '../../../services/surah-catalog.service';
import { JUZ_START_IDS, TOTAL_AYAHS, juzRange } from '../../../shared/juz';

interface Milestone {
  id: string;
  icon: string;
  title: string;
  value: number;
  target: number;
}

/** Milestone badges and an estimate of when the whole Quran would be memorized at the current pace */
@Component({
  selector: 'app-milestones',
  standalone: true,
  template: `
    <div class="milestones">
      <div class="card projection">
        <h3 class="card-title">Projection</h3>
        <div class="proj-main">
          <span class="proj-value">{{ remaining().toLocaleString('fr-FR') }}</span>
          <span class="proj-label">versets restants</span>
        </div>
        <ul class="proj-list">
          <li>
            <span>Rythme des 30 derniers jours</span>
            <strong>{{ paceLabel() }}</strong>
          </li>
          <li>
            <span>À ce rythme, fin estimée</span>
            <strong>{{ finishAtPace() }}</strong>
          </li>
          <li>
            <span>Avec votre objectif ({{ memorize.goal() }} / jour)</span>
            <strong>{{ finishAtGoal() }}</strong>
          </li>
        </ul>
        @if (nextMilestone(); as n) {
          <div class="next">
            <span class="next-label">Prochain cap : <strong>{{ n.title }}</strong></span>
            <div class="progress"><span [style.width.%]="(n.value / n.target) * 100"></span></div>
            <span class="next-count">{{ n.value }} / {{ n.target }}</span>
          </div>
        }
      </div>

      <div class="card">
        <div class="card-head">
          <h3 class="card-title">Étapes</h3>
          <span class="muted">{{ achievedCount() }} / {{ milestones().length }} atteintes</span>
        </div>
        <ul class="badges">
          @for (m of milestones(); track m.id) {
            <li class="badge" [class.done]="m.value >= m.target" [title]="m.title + ' · ' + min(m.value, m.target) + ' / ' + m.target">
              <span class="badge-icon"><i [class]="'pi ' + m.icon" aria-hidden="true"></i></span>
              <span class="badge-title">{{ m.title }}</span>
              @if (m.value < m.target) {
                <span class="badge-progress"><span [style.width.%]="(m.value / m.target) * 100"></span></span>
              } @else {
                <span class="badge-done"><i class="pi pi-check" aria-hidden="true"></i> atteint</span>
              }
            </li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .milestones { display: grid; grid-template-columns: 1fr 1.6fr; gap: 1rem; }
    .card { display: flex; flex-direction: column; gap: 0.85rem; }
    .card-head { display: flex; align-items: baseline; justify-content: space-between; }
    .card-title { margin: 0; font-size: 0.95rem; }
    .muted { font-size: 0.8rem; color: var(--color-text-muted); }

    .proj-main { display: flex; align-items: baseline; gap: 0.5rem; }
    .proj-value { font-size: 2rem; font-weight: 700; color: var(--color-text-primary); }
    .proj-label { color: var(--color-text-muted); font-size: 0.85rem; }
    .proj-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .proj-list li { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.85rem; color: var(--color-text-secondary); }
    .proj-list strong { color: var(--color-text-primary); text-align: right; }
    .next { display: flex; flex-direction: column; gap: 0.35rem; padding-top: 0.75rem; border-top: 1px solid var(--color-card-border); font-size: 0.85rem; }
    .next-count { font-size: 0.75rem; color: var(--color-text-muted); }

    .badges { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr)); gap: 0.6rem; }
    .badge {
      display: flex; flex-direction: column; align-items: center; gap: 0.35rem; padding: 0.85rem 0.6rem;
      border-radius: var(--radius-md); border: 1px dashed var(--color-card-border); text-align: center;
      color: var(--color-text-muted);
    }
    .badge.done { border-style: solid; border-color: color-mix(in srgb, var(--color-accent) 55%, transparent); background: var(--color-accent-alpha); color: var(--color-text-primary); }
    .badge-icon { display: grid; place-items: center; width: 2.4rem; height: 2.4rem; border-radius: 50%; background: var(--color-surface-hover); font-size: 1rem; }
    .badge.done .badge-icon { background: var(--color-accent); color: #fff; }
    .badge-title { font-size: 0.78rem; font-weight: 600; line-height: 1.25; }
    .badge-progress { width: 80%; height: 4px; border-radius: 999px; background: var(--color-surface-hover); overflow: hidden; }
    .badge-progress span { display: block; height: 100%; background: var(--color-primary); }
    .badge-done { font-size: 0.7rem; color: var(--color-success); font-weight: 600; }

    @media (max-width: 860px) { .milestones { grid-template-columns: 1fr; } }
  `]
})
export class MilestonesComponent {
  readonly memorize = inject(MemorizeService);
  private catalog = inject(SurahCatalogService);

  private readonly memorizedCount = computed(() => this.memorize.memorizedIds().size);
  readonly remaining = computed(() => TOTAL_AYAHS - this.memorizedCount());

  /** Verses per day over the last 30 days */
  private readonly pace = computed(() => {
    this.memorize.log();
    return this.memorize.learnedInLast(30) / 30;
  });

  readonly paceLabel = computed(() => {
    const p = this.pace();
    if (p === 0) return '—';
    return p >= 1 ? `${p.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} versets / jour`
                  : `${(p * 7).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} versets / semaine`;
  });

  readonly finishAtPace = computed(() => this.finishDate(this.pace()) ?? 'apprenez quelques versets pour estimer');
  readonly finishAtGoal = computed(() => this.finishDate(this.memorize.goal()) ?? '—');

  readonly milestones = computed<Milestone[]>(() => {
    const known = this.memorize.memorizedIds();
    const count = known.size;
    const surahs = this.catalog.surahs();
    let completeSurahs = 0;
    for (const s of surahs) {
      const first = this.catalog.firstAyahId(s.number) ?? 0;
      let all = true;
      for (let id = first; id < first + s.numberOfAyahs; id++) if (!known.has(id)) { all = false; break; }
      if (all && first) completeSurahs++;
    }
    const juzDone = (juz: number) => {
      const { from, to } = juzRange(juz);
      let n = 0;
      for (let id = from; id <= to; id++) if (known.has(id)) n++;
      return n;
    };
    const bestJuz = Math.max(...JUZ_START_IDS.map((_, i) => {
      const { from, to } = juzRange(i + 1);
      return juzDone(i + 1) / (to - from + 1);
    }));
    const amma = juzRange(30);
    const reviews = this.memorize.progress().reduce((sum, p) => sum + (p.reviewCount ?? 0), 0);
    const fatiha = [1, 2, 3, 4, 5, 6, 7].filter(id => known.has(id)).length;

    return [
      { id: 'first', icon: 'pi-star', title: 'Premier verset', value: Math.min(count, 1), target: 1 },
      { id: 'fatiha', icon: 'pi-book', title: 'Al-Fatiha', value: fatiha, target: 7 },
      { id: 'v50', icon: 'pi-flag', title: '50 versets', value: count, target: 50 },
      { id: 'surah1', icon: 'pi-check-circle', title: 'Une sourate complète', value: Math.min(completeSurahs, 1), target: 1 },
      { id: 'streak7', icon: 'pi-bolt', title: '7 jours d\'affilée', value: this.memorize.bestStreak(), target: 7 },
      { id: 'reviews100', icon: 'pi-refresh', title: '100 révisions', value: reviews, target: 100 },
      { id: 'v100', icon: 'pi-flag-fill', title: '100 versets', value: count, target: 100 },
      { id: 'surah10', icon: 'pi-list-check', title: '10 sourates complètes', value: completeSurahs, target: 10 },
      { id: 'streak30', icon: 'pi-bolt', title: '30 jours d\'affilée', value: this.memorize.bestStreak(), target: 30 },
      { id: 'amma', icon: 'pi-moon', title: 'Juz Amma', value: juzDone(30), target: amma.to - amma.from + 1 },
      { id: 'juz', icon: 'pi-th-large', title: 'Un juz complet', value: Math.floor(bestJuz * 100), target: 100 },
      { id: 'v1000', icon: 'pi-trophy', title: '1 000 versets', value: count, target: 1000 },
      { id: 'hafiz', icon: 'pi-crown', title: 'Le Coran entier', value: count, target: TOTAL_AYAHS }
    ];
  });

  readonly achievedCount = computed(() => this.milestones().filter(m => m.value >= m.target).length);

  /** Closest milestone not reached yet (by how much is done) */
  readonly nextMilestone = computed(() =>
    this.milestones()
      .filter(m => m.value < m.target)
      .sort((a, b) => b.value / b.target - a.value / a.target)[0] ?? null
  );

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  private finishDate(perDay: number): string | null {
    if (perDay <= 0) return null;
    if (this.remaining() === 0) return 'terminé';
    const days = Math.ceil(this.remaining() / perDay);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const years = days / 365;
    const when = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    return years >= 1 ? `${when} (~${years.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} an${years >= 2 ? 's' : ''})` : when;
  }
}
