import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TypeBadgeComponent } from '../../../common/components/type-badge/type-badge.component';
import { PokemonStore } from '../../../pokedex/state/pokemon.store';
import type { Team } from '../../models/team.model';
import type { PokemonListItem } from '../../../pokedex/models/pokemon.model';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [TypeBadgeComponent],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamCardComponent {
  readonly team = input.required<Team>();
  readonly isSelected = input(false);
  readonly select = output<string>();
  readonly delete = output<string>();

  private readonly pokemonStore = inject(PokemonStore);

  readonly members = computed<PokemonListItem[]>(() => {
    const byId = this.pokemonStore.pokemonById();
    return this.team()
      .pokemonIds.map((id) => byId.get(id))
      .filter(Boolean) as PokemonListItem[];
  });

  readonly totalBaseStats = computed(() =>
    this.members().reduce((sum, p) => sum + p.totalStats, 0),
  );

  readonly typeDistribution = computed(() => {
    const counts = new Map<string, number>();
    for (const p of this.members()) {
      for (const type of p.types) counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  protected onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.team().id);
  }
}
