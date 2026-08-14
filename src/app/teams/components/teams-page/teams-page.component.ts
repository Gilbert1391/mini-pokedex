import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AsyncStateComponent } from '../../../common/components/async-state/async-state.component';
import { TeamCardComponent } from '../team-card/team-card.component';
import { TeamBuilderFormComponent } from '../team-builder-form/team-builder-form.component';
import { TeamStore } from '../../state/team.store';
import { TeamUiStore } from '../../state/team-ui.store';
import { PokemonStore } from '../../../pokedex/state/pokemon.store';
import {
  asyncEmpty,
  asyncError,
  asyncLoading,
  asyncSuccess,
} from '../../../common/models/async-state.model';

@Component({
  selector: 'app-teams-page',
  standalone: true,
  imports: [AsyncStateComponent, TeamCardComponent, TeamBuilderFormComponent],
  templateUrl: './teams-page.component.html',
  styleUrl: './teams-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsPageComponent implements OnInit {
  protected readonly teamStore = inject(TeamStore);
  protected readonly uiStore = inject(TeamUiStore);
  private readonly pokemonStore = inject(PokemonStore);

  protected readonly showForm = signal(false);

  protected readonly teamsState = computed(() => {
    if (this.uiStore.isLoading()) return asyncLoading();
    const err = this.uiStore.loadError();
    if (err) return asyncError(err);
    const teams = this.uiStore.teams();
    if (teams.length === 0) return asyncEmpty();
    return asyncSuccess(null);
  });

  ngOnInit(): void {
    this.teamStore.loadTeams();
    // Ensure Pokémon cache is populated so team card stats work
    this.pokemonStore.loadPokemonList();
  }

  protected retryLoad(): void {
    this.teamStore.loadTeams(true);
  }
}
