import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TypeBadgeComponent } from '../../../common/components/type-badge/type-badge.component';
import { TypeHighlightDirective } from '../../../common/directives/type-highlight.directive';
import { POKEMON_STAT_LABELS, STAT_ORDER } from '../../../common/constants/pokemon.constants';
import type { PokemonListItem } from '../../models/pokemon.model';
import type { PokemonSort, SortDirection } from '../../state/pokemon.selectors';

export interface SortChangeEvent {
  field: PokemonSort['field'];
  direction: SortDirection;
}

@Component({
  selector: 'app-pokedex-table',
  standalone: true,
  imports: [TypeBadgeComponent, TypeHighlightDirective],
  templateUrl: './pokedex-table.component.html',
  styleUrl: './pokedex-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexTableComponent {
  readonly pokemon = input<PokemonListItem[]>([]);
  readonly sortField = input<PokemonSort['field']>('id');
  readonly sortDirection = input<SortDirection>('asc');
  readonly selectedId = input<number | null>(null);
  readonly highlightType = input('');

  readonly rowClick = output<number>();
  readonly sortChange = output<SortChangeEvent>();

  protected readonly statOrder = STAT_ORDER;
  protected readonly statLabels = POKEMON_STAT_LABELS;

  protected onHeaderClick(field: PokemonSort['field']): void {
    const next: SortDirection =
      this.sortField() === field && this.sortDirection() === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field, direction: next });
  }

  protected sortIcon(field: PokemonSort['field']): string {
    if (this.sortField() !== field) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected isActive(field: PokemonSort['field']): boolean {
    return this.sortField() === field;
  }

  protected getStat(pokemon: PokemonListItem, statName: string): number {
    return pokemon.stats.find((s) => s.name === statName)?.baseStat ?? 0;
  }
}
