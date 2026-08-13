import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';
import { PokemonStore } from './pokemon.store';
import type { PokemonListItem } from '../models/pokemon.model';
import type { StatName } from '../../common/constants/pokemon.constants';

export type SortDirection = 'asc' | 'desc';

export interface PokemonFilter {
  search: string;
  type: string;
}

export interface PokemonSort {
  field: 'id' | 'name' | 'totalStats' | StatName;
  direction: SortDirection;
}

export interface PokemonPage {
  pageIndex: number;
  pageSize: number;
}

export interface PokemonPageResult {
  items: PokemonListItem[];
  totalItems: number;
  totalPages: number;
}

/**
 * Factory that returns selector observables derived from PokemonStore.
 * Call once per service/component — inject PokemonStore directly then pass it here,
 * or inject this service which does it internally.
 *
 * All streams use shareReplay(1) so multiple subscribers share one computation.
 */
@Injectable({ providedIn: 'root' })
export class PokemonSelectors {
  private readonly store = inject(PokemonStore);

  /** All Pokémon from the cache as a flat array, in insertion order. */
  readonly allPokemon$: Observable<PokemonListItem[]> = this.store.state$.pipe(
    map((s) => s.allIds.map((id) => s.byId.get(id)!).filter(Boolean)),
    distinctUntilChanged((a, b) => a.length === b.length && a === b),
    shareReplay(1),
  );

  /**
   * Returns a filtered+sorted+paged slice driven by three input observables.
   * The search runs client-side against the cache — no extra HTTP calls.
   *
   * @param filter$ - emits { search, type } whenever the user changes either input
   * @param sort$ - emits { field, direction } on column header click
   * @param page$ - emits { pageIndex, pageSize } on page change
   */
  pagedPokemon$(
    filter$: Observable<PokemonFilter>,
    sort$: Observable<PokemonSort>,
    page$: Observable<PokemonPage>,
  ): Observable<PokemonPageResult> {
    return combineLatest([this.allPokemon$, filter$, sort$, page$]).pipe(
      map(([all, filter, sort, page]) => {
        // 1. Filter
        const lowerSearch = filter.search.toLowerCase();
        let result = all;
        if (lowerSearch) {
          result = result.filter((p) => p.name.includes(lowerSearch));
        }
        if (filter.type) {
          result = result.filter((p) => p.types.includes(filter.type));
        }

        // 2. Sort
        result = [...result].sort((a, b) => {
          let av: number | string;
          let bv: number | string;

          if (sort.field === 'name') {
            av = a.name;
            bv = b.name;
          } else if (sort.field === 'totalStats') {
            av = a.totalStats;
            bv = b.totalStats;
          } else if (sort.field === 'id') {
            av = a.id;
            bv = b.id;
          } else {
            // stat name like 'hp', 'attack', etc.
            av = a.stats.find((s) => s.name === sort.field)?.baseStat ?? 0;
            bv = b.stats.find((s) => s.name === sort.field)?.baseStat ?? 0;
          }

          if (av < bv) return sort.direction === 'asc' ? -1 : 1;
          if (av > bv) return sort.direction === 'asc' ? 1 : -1;
          return 0;
        });

        // 3. Paginate
        const totalItems = result.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / page.pageSize));
        const safeIndex = Math.min(page.pageIndex, totalPages - 1);
        const start = safeIndex * page.pageSize;
        const items = result.slice(start, start + page.pageSize);

        return { items, totalItems, totalPages };
      }),
      shareReplay(1),
    );
  }
}
