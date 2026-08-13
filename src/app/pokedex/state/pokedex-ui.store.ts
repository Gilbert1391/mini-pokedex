import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Subject, map, tap, debounceTime, distinctUntilChanged } from 'rxjs';
import { PokemonStore } from './pokemon.store';
import { PokemonSelectors } from './pokemon.selectors';
import type {
  PokemonFilter,
  PokemonPage,
  PokemonPageResult,
  PokemonSort,
} from './pokemon.selectors';
import { DEFAULT_PAGE_SIZE } from '../../common/constants/pokemon.constants';

@Injectable({ providedIn: 'root' })
export class PokedexUiStore {
  private readonly pokemonStore = inject(PokemonStore);
  private readonly selectors = inject(PokemonSelectors);

  // ── UI signals ─────────────────────────────────────────────────────────
  readonly selectedPokemonId = signal<number | null>(null);
  readonly isPanelOpen = signal(false);

  // ── Table control signals (immediate — reflect current input value) ───
  readonly searchQuery = signal('');
  readonly typeFilter = signal('');
  readonly currentPage = signal(0);
  readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  readonly sortField = signal<PokemonSort['field']>('id');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // ── RxJS subjects that drive the selectors ────────────────────────────

  private readonly _filter$ = new BehaviorSubject<PokemonFilter>({ search: '', type: '' });
  private readonly _sort$ = new BehaviorSubject<PokemonSort>({ field: 'id', direction: 'asc' });
  private readonly _page$ = new BehaviorSubject<PokemonPage>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  // Raw search keypresses → debounced → updates _filter$
  private readonly _searchRaw$ = new Subject<string>();

  constructor() {
    // Debounce search: wait 300ms of inactivity before filtering
    this._searchRaw$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((q) => this._filter$.next({ ...this._filter$.getValue(), search: q.toLowerCase() })),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  // ── Signal bridges: RxJS → signal for templates ───────────────────────

  /** Paginated result — drives the table. Recomputes on any filter/sort/page change. */
  readonly pagedResult = toSignal(
    this.selectors.pagedPokemon$(this._filter$, this._sort$, this._page$),
  );

  readonly isListLoading = toSignal(this.pokemonStore.state$.pipe(map((s) => s.loading)), {
    initialValue: false,
  });

  readonly listError = toSignal(this.pokemonStore.state$.pipe(map((s) => s.error)), {
    initialValue: null,
  });

  readonly isDetailLoading = toSignal(this.pokemonStore.state$.pipe(map((s) => s.detailLoading)), {
    initialValue: false,
  });

  readonly detailError = toSignal(this.pokemonStore.state$.pipe(map((s) => s.detailError)), {
    initialValue: null,
  });

  readonly selectedDetail = toSignal(this.pokemonStore.state$.pipe(map((s) => s.selectedDetail)), {
    initialValue: null,
  });

  // ── Derived (computed) values ──────────────────────────────────────────

  /** Current page slice count — used by pagination controls. */
  readonly pageItemCount = computed(() => this.pagedResult()?.items.length ?? 0);

  // ── Public actions ────────────────────────────────────────────────────

  /** Called on every keypress in the search box — debounces automatically. */
  setSearch(query: string): void {
    this.searchQuery.set(query);
    this._searchRaw$.next(query);
  }

  setTypeFilter(type: string): void {
    this.typeFilter.set(type);
    this._filter$.next({ ...this._filter$.getValue(), type });
    this.setPage(0);
  }

  setSort(field: PokemonSort['field'], direction: 'asc' | 'desc'): void {
    this.sortField.set(field);
    this.sortDirection.set(direction);
    this._sort$.next({ field, direction });
    this.setPage(0);
  }

  setPage(pageIndex: number): void {
    this.currentPage.set(pageIndex);
    this._page$.next({ pageIndex, pageSize: this.pageSize() });
  }

  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this._page$.next({ pageIndex: 0, pageSize });
    this.currentPage.set(0);
  }

  selectPokemon(id: number): void {
    this.selectedPokemonId.set(id);
    this.isPanelOpen.set(true);
    this.pokemonStore.loadPokemonDetail(id);
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
    this.pokemonStore.clearSelectedDetail();
  }
}
