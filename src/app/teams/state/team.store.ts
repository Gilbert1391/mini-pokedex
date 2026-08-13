import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from '../../core/toast.service';
import { TeamApiService } from '../services/team-api.service';
import type { CreateTeamInput, Team } from '../models/team.model';

export interface TeamStoreState {
  teams: Team[];
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: TeamStoreState = {
  teams: [],
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class TeamStore {
  private readonly api = inject(TeamApiService);
  private readonly toast = inject(ToastService);

  private readonly _state$ = new BehaviorSubject<TeamStoreState>(INITIAL_STATE);
  /** Observable of the full team store state. */
  readonly state$ = this._state$.asObservable();

  get snapshot(): TeamStoreState {
    return this._state$.getValue();
  }

  // ── Public mutators ──────────────────────────────────────────────────────

  /** Loads all teams from the API; no-op if already loaded and !force. */
  loadTeams(force = false): void {
    const state = this.snapshot;
    if (state.loading) return;
    if (state.teams.length > 0 && !force) return;

    this._patch({ loading: true, error: null });

    this.api.getTeams$().subscribe({
      next: (teams) => this._patch({ teams, loading: false }),
      error: (err: unknown) => {
        const error = err instanceof Error ? err.message : 'Failed to load teams';
        this._patch({ loading: false, error });
      },
    });
  }

  /**
   * Optimistic create: immediately appends a placeholder team with a
   * temporary id, then replaces it with the server response on success,
   * or rolls back + shows a toast on failure.
   */
  createTeam(input: CreateTeamInput): void {
    const tempId = `temp-${Date.now()}`;
    const optimisticTeam: Team = {
      id: tempId,
      trainerId: '1',
      name: input.name,
      pokemonIds: input.pokemonIds,
      createdAt: new Date().toISOString(),
    };

    // Immediate UI update
    this._patch({ teams: [...this.snapshot.teams, optimisticTeam] });

    this.api.createTeam$(input).subscribe({
      next: (created) => {
        // Swap the temporary entry for the real one from the server
        const teams = this.snapshot.teams.map((t) => (t.id === tempId ? created : t));
        this._patch({ teams });
      },
      error: (err: unknown) => {
        // Roll back: remove the optimistic entry
        const teams = this.snapshot.teams.filter((t) => t.id !== tempId);
        this._patch({ teams });
        const message = err instanceof Error ? err.message : 'Failed to create team';
        this.toast.show(message, 'error');
      },
    });
  }

  /**
   * Optimistic delete: removes the team immediately, then re-inserts it
   * (at its original position) and shows a toast if the mutation fails.
   */
  deleteTeam(id: string): void {
    const state = this.snapshot;
    const teamIndex = state.teams.findIndex((t) => t.id === id);
    const team = state.teams[teamIndex];
    if (!team) return;

    // Immediate UI update
    this._patch({ teams: state.teams.filter((t) => t.id !== id) });

    this.api.deleteTeam$(id).subscribe({
      error: (err: unknown) => {
        // Roll back: re-insert at original position
        const teams = [...this.snapshot.teams];
        teams.splice(teamIndex, 0, team);
        this._patch({ teams });
        const message = err instanceof Error ? err.message : 'Failed to delete team';
        this.toast.show(message, 'error');
      },
    });
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private _patch(partial: Partial<TeamStoreState>): void {
    this._state$.next({ ...this._state$.getValue(), ...partial });
  }
}
