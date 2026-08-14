import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { PolarChartModule, ScaleType } from '@swimlane/ngx-charts';
import { curveCardinalClosed } from 'd3-shape';
import { AsyncStateComponent } from '../../../common/components/async-state/async-state.component';
import { TypeBadgeComponent } from '../../../common/components/type-badge/type-badge.component';
import { POKEMON_STAT_LABELS, STAT_ORDER } from '../../../common/constants/pokemon.constants';
import { PokedexUiStore } from '../../state/pokedex-ui.store';
import type { AsyncState } from '../../../common/models/async-state.model';
import type { PokemonDetail } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-detail-panel',
  standalone: true,
  imports: [AsyncStateComponent, TypeBadgeComponent, PolarChartModule],
  templateUrl: './pokemon-detail-panel.component.html',
  styleUrl: './pokemon-detail-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetailPanelComponent {
  readonly isOpen = input(false);
  readonly state = input.required<AsyncState<unknown>>();
  readonly detail = input<PokemonDetail | null>(null);
  readonly close = output<void>();
  readonly retry = output<void>();

  protected readonly curve = curveCardinalClosed;

  protected readonly colorScheme = {
    name: 'pokemon',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#007acc'],
  };

  protected readonly chartData = computed(() => {
    const d = this.detail();
    if (!d) return [];
    return [
      {
        name: d.name,
        series: STAT_ORDER.map((statName) => ({
          name: POKEMON_STAT_LABELS[statName] ?? statName,
          value: d.stats.find((s) => s.name === statName)?.baseStat ?? 0,
        })),
      },
    ];
  });
}
