import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { PokemonSelectors } from './pokemon.selectors';
import { PokemonStore } from './pokemon.store';
import type { PokemonStoreState } from './pokemon.store';
import type { PokemonListItem } from '../models/pokemon.model';

function makePokemon(
  partial: Partial<PokemonListItem> & { id: number; name: string },
): PokemonListItem {
  return {
    height: 4,
    weight: 60,
    types: ['normal'],
    stats: [
      { name: 'hp', baseStat: 45 },
      { name: 'attack', baseStat: 49 },
      { name: 'defense', baseStat: 49 },
      { name: 'special-attack', baseStat: 65 },
      { name: 'special-defense', baseStat: 65 },
      { name: 'speed', baseStat: 45 },
    ],
    totalStats: 318,
    spriteUrl: null,
    ...partial,
  };
}

const pikachu = makePokemon({ id: 25, name: 'pikachu', types: ['electric'], totalStats: 320 });
const charmander = makePokemon({ id: 4, name: 'charmander', types: ['fire'], totalStats: 309 });
const bulbasaur = makePokemon({ id: 1, name: 'bulbasaur', types: ['grass', 'poison'], totalStats: 318 });

const SEEDED_STATE: PokemonStoreState = {
  byId: new Map([[25, pikachu], [4, charmander], [1, bulbasaur]]),
  allIds: [25, 4, 1],
  loading: false,
  error: null,
  detailLoading: false,
  detailError: null,
  selectedDetail: null,
  totalLoaded: 3,
};

describe('PokemonSelectors', () => {
  let selectors: PokemonSelectors;
  let state$: BehaviorSubject<PokemonStoreState>;

  beforeEach(() => {
    state$ = new BehaviorSubject<PokemonStoreState>(SEEDED_STATE);

    TestBed.configureTestingModule({
      providers: [PokemonSelectors, { provide: PokemonStore, useValue: { state$ } }],
    });
    selectors = TestBed.inject(PokemonSelectors);
  });

  describe('pagedPokemon$', () => {
    it('filters pokemon by name search (case-insensitive)', async () => {
      const filter$ = new BehaviorSubject({ search: 'pika', type: '' });
      const sort$ = new BehaviorSubject({ field: 'id' as const, direction: 'asc' as const });
      const page$ = new BehaviorSubject({ pageIndex: 0, pageSize: 10 });

      const result = await firstValueFrom(selectors.pagedPokemon$(filter$, sort$, page$));
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('pikachu');
    });

    it('filters pokemon by type', async () => {
      const filter$ = new BehaviorSubject({ search: '', type: 'fire' });
      const sort$ = new BehaviorSubject({ field: 'id' as const, direction: 'asc' as const });
      const page$ = new BehaviorSubject({ pageIndex: 0, pageSize: 10 });

      const result = await firstValueFrom(selectors.pagedPokemon$(filter$, sort$, page$));
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('charmander');
    });

    it('sorts by totalStats descending', async () => {
      const filter$ = new BehaviorSubject({ search: '', type: '' });
      const sort$ = new BehaviorSubject({ field: 'totalStats' as const, direction: 'desc' as const });
      const page$ = new BehaviorSubject({ pageIndex: 0, pageSize: 10 });

      const result = await firstValueFrom(selectors.pagedPokemon$(filter$, sort$, page$));
      expect(result.items[0].name).toBe('pikachu');    // 320
      expect(result.items[1].name).toBe('bulbasaur');  // 318
      expect(result.items[2].name).toBe('charmander'); // 309
    });

    it('paginates correctly', async () => {
      const filter$ = new BehaviorSubject({ search: '', type: '' });
      const sort$ = new BehaviorSubject({ field: 'id' as const, direction: 'asc' as const });
      const page$ = new BehaviorSubject({ pageIndex: 0, pageSize: 2 });

      const result = await firstValueFrom(selectors.pagedPokemon$(filter$, sort$, page$));
      expect(result.items).toHaveLength(2);
      expect(result.totalItems).toBe(3);
      expect(result.totalPages).toBe(2);
    });
  });
});
