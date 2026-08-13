import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { TeamStore } from './team.store';
import { PokemonStore } from '../../pokedex/state/pokemon.store';

export interface TypeDistributionEntry {
  type: string;
  count: number;
}

export interface TeamStats {
  totalBaseStats: number;
  typeDistribution: TypeDistributionEntry[];
}

const SELECTED_TEAM_KEY = 'selectedTeamId';

@Injectable({ providedIn: 'root' })
export class TeamUiStore {
  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);

  // ── Signal bridges ────────────────────────────────────────────────────

  readonly teams = toSignal(this.teamStore.state$.pipe(map((s) => s.teams)), { initialValue: [] });

  readonly isLoading = toSignal(this.teamStore.state$.pipe(map((s) => s.loading)), {
    initialValue: false,
  });

  readonly loadError = toSignal(this.teamStore.state$.pipe(map((s) => s.error)), {
    initialValue: null,
  });

  // ── UI signals ─────────────────────────────────────────────────────────

  /** Restored from localStorage on init; persisted on every change via effect(). */
  readonly selectedTeamId = signal<string | null>(localStorage.getItem(SELECTED_TEAM_KEY));

  constructor() {
    // effect() runs whenever selectedTeamId changes and syncs it to localStorage
    effect(() => {
      const id = this.selectedTeamId();
      if (id === null) {
        localStorage.removeItem(SELECTED_TEAM_KEY);
      } else {
        localStorage.setItem(SELECTED_TEAM_KEY, id);
      }
    });
  }

  // ── Derived (computed) values ──────────────────────────────────────────

  /** The full Team object for the currently selected team id (or null). */
  readonly selectedTeam = computed(() => {
    const id = this.selectedTeamId();
    return this.teams().find((t) => t.id === id) ?? null;
  });

  /**
   * Type distribution and total base stats for the selected team.
   * Joins team's pokemonIds against the Pokémon cache — returns null if
   * the cache hasn't loaded yet or no team is selected.
   */
  readonly selectedTeamStats = computed<TeamStats | null>(() => {
    const team = this.selectedTeam();
    if (!team) return null;

    const cache = this.pokemonStore.snapshot.byId;
    if (cache.size === 0) return null;

    let totalBaseStats = 0;
    const typeCounts = new Map<string, number>();

    for (const pokemonId of team.pokemonIds) {
      const pokemon = cache.get(pokemonId);
      if (!pokemon) continue;
      totalBaseStats += pokemon.totalStats;
      for (const type of pokemon.types) {
        typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      }
    }

    const typeDistribution: TypeDistributionEntry[] = Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return { totalBaseStats, typeDistribution };
  });

  // ── Public actions ─────────────────────────────────────────────────────

  selectTeam(id: string): void {
    this.selectedTeamId.set(id);
  }

  deselectTeam(): void {
    this.selectedTeamId.set(null);
  }
}
