import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PokemonApiService } from '../services/pokemon-api.service';
import type { PokemonDetail, PokemonListItem } from '../models/pokemon.model';

export interface PokemonStoreState {
  /** All fetched Pokémon indexed by id — grows as we load batches. */
  byId: Map<number, PokemonListItem>;
  /** Ordered list of ids across all loaded batches. */
  allIds: number[];
  /** True while the initial list fetch is in flight. */
  loading: boolean;
  /** Set when the list fetch fails; null on success. */
  error: string | null;
  /** True when a detail request is in flight. */
  detailLoading: boolean;
  detailError: string | null;
  /** Full detail (includes abilities) for the currently selected Pokémon. */
  selectedDetail: PokemonDetail | null;
  /** Total number of Pokémon available (used to know if more can be loaded). */
  totalLoaded: number;
}

const INITIAL_STATE: PokemonStoreState = {
  byId: new Map(),
  allIds: [],
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
  selectedDetail: null,
  totalLoaded: 0,
};

@Injectable({ providedIn: 'root' })
export class PokemonStore {
  private readonly api = inject(PokemonApiService);

  private readonly _state$ = new BehaviorSubject<PokemonStoreState>(INITIAL_STATE);
  /** Emit the full store state to all subscribers. */
  readonly state$ = this._state$.asObservable();

  /** Snapshot of current state — use in non-reactive contexts only. */
  get snapshot(): PokemonStoreState {
    return this._state$.getValue();
  }

  // ── Public mutators ──────────────────────────────────────────────────────

  /**
   * Loads a batch of Pokémon and merges them into the cache.
   * If the cache already has data and `force` is false, this is a no-op.
   */
  loadPokemonList(limit = 151, offset = 0, force = false): void {
    const state = this.snapshot;
    if (state.loading) return;
    if (state.allIds.length > 0 && !force) return;

    this._patch({ loading: true, error: null });

    this.api.getPokemonList$(limit, offset).subscribe({
      next: (pokemon) => {
        const byId = new Map(state.byId);
        for (const p of pokemon) byId.set(p.id, p);
        const allIds = Array.from(byId.keys());
        this._patch({ byId, allIds, loading: false, totalLoaded: allIds.length });
      },
      error: (err: unknown) => {
        const error = err instanceof Error ? err.message : 'Failed to load Pokémon';
        this._patch({ loading: false, error });
      },
    });
  }

  /**
   * Loads full detail (stats + abilities) for the given Pokémon id.
   * The result is stored in `selectedDetail`.
   */
  loadPokemonDetail(id: number): void {
    this._patch({ detailLoading: true, detailError: null, selectedDetail: null });

    this.api.getPokemonById$(id).subscribe({
      next: (detail) => {
        this._patch({ selectedDetail: detail, detailLoading: false });
      },
      error: (err: unknown) => {
        const detailError = err instanceof Error ? err.message : 'Failed to load Pokémon detail';
        this._patch({ detailLoading: false, detailError });
      },
    });
  }

  /** Clears the currently selected detail (e.g. when the panel is closed). */
  clearSelectedDetail(): void {
    this._patch({ selectedDetail: null, detailError: null });
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private _patch(partial: Partial<PokemonStoreState>): void {
    this._state$.next({ ...this._state$.getValue(), ...partial });
  }
}
