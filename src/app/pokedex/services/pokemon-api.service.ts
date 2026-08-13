import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { retry } from 'rxjs/operators';
import { GraphqlClientService } from '../../core/graphql/graphql-client.service';
import { POKEAPI_GRAPHQL_URL } from '../../common/constants/pokemon.constants';
import type {
  PokemonAbility,
  PokemonDetail,
  PokemonListItem,
  PokemonStat,
} from '../models/pokemon.model';

// ── Raw API shapes ─────────────────────────────────────────────────────────

interface RawSprites {
  front_default?: string | null;
  other?: { 'official-artwork'?: { front_default?: string | null } };
}

interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
  pokemon_v2_pokemonstats: { base_stat: number; pokemon_v2_stat: { name: string } }[];
  pokemon_v2_pokemonsprites: { sprites: string | RawSprites }[];
}

interface RawAbility {
  pokemon_v2_ability: {
    name: string;
    pokemon_v2_abilityeffecttexts: { short_effect: string }[];
  };
  is_hidden: boolean;
}

// ── GraphQL query strings ──────────────────────────────────────────────────

const GET_POKEMON_LIST_QUERY = /* GraphQL */ `
  query GetPokemon($limit: Int, $offset: Int) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset, order_by: { id: asc }) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonstats {
        base_stat
        pokemon_v2_stat {
          name
        }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`;

const GET_POKEMON_BY_ID_QUERY = /* GraphQL */ `
  query GetPokemonById($id: Int!) {
    pokemon_v2_pokemon(where: { id: { _eq: $id } }) {
      id
      name
      height
      weight
      pokemon_v2_pokemontypes {
        pokemon_v2_type {
          name
        }
      }
      pokemon_v2_pokemonstats {
        base_stat
        pokemon_v2_stat {
          name
        }
      }
      pokemon_v2_pokemonsprites {
        sprites
      }
    }
  }
`;

const GET_ABILITIES_QUERY = /* GraphQL */ `
  query GetAbilities($pokemonId: Int) {
    pokemon_v2_pokemonability(where: { pokemon_id: { _eq: $pokemonId } }) {
      pokemon_v2_ability {
        name
        pokemon_v2_abilityeffecttexts(where: { language_id: { _eq: 9 } }) {
          short_effect
        }
      }
      is_hidden
    }
  }
`;

// ── Mapping helpers ────────────────────────────────────────────────────────

function extractSpriteUrl(raw: string | RawSprites | null | undefined): string | null {
  if (!raw) return null;
  const sprites: RawSprites = typeof raw === 'string' ? JSON.parse(raw) : raw;
  return sprites.other?.['official-artwork']?.front_default ?? sprites.front_default ?? null;
}

function mapStats(rawStats: RawPokemon['pokemon_v2_pokemonstats']): PokemonStat[] {
  return rawStats.map((s) => ({ name: s.pokemon_v2_stat.name, baseStat: s.base_stat }));
}

function mapPokemon(raw: RawPokemon): PokemonListItem {
  const stats = mapStats(raw.pokemon_v2_pokemonstats);
  const spriteRaw = raw.pokemon_v2_pokemonsprites[0]?.sprites ?? null;
  return {
    id: raw.id,
    name: raw.name,
    height: raw.height,
    weight: raw.weight,
    types: raw.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
    stats,
    spriteUrl: extractSpriteUrl(spriteRaw),
    totalStats: stats.reduce((sum, s) => sum + s.baseStat, 0),
  };
}

// ── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly graphql = inject(GraphqlClientService);

  /**
   * Fetches a paginated slice of Pokémon with types, stats, and sprites.
   * Retries up to 2 times with 800 ms delay on failure.
   */
  getPokemonList$(limit = 151, offset = 0): Observable<PokemonListItem[]> {
    return this.graphql
      .query$<{
        pokemon_v2_pokemon: RawPokemon[];
      }>(POKEAPI_GRAPHQL_URL, GET_POKEMON_LIST_QUERY, { limit, offset })
      .pipe(
        retry({ count: 2, delay: 800 }),
        map((data) => data.pokemon_v2_pokemon.map(mapPokemon)),
      );
  }

  /**
   * Fetches full detail for one Pokémon (base data + abilities) via two
   * parallel queries. Retries the combined request up to 2 times.
   */
  getPokemonById$(id: number): Observable<PokemonDetail | null> {
    return forkJoin({
      pokemonData: this.graphql.query$<{ pokemon_v2_pokemon: RawPokemon[] }>(
        POKEAPI_GRAPHQL_URL,
        GET_POKEMON_BY_ID_QUERY,
        { id },
      ),
      abilityData: this.graphql.query$<{
        pokemon_v2_pokemonability: RawAbility[];
      }>(POKEAPI_GRAPHQL_URL, GET_ABILITIES_QUERY, { pokemonId: id }),
    }).pipe(
      retry({ count: 2, delay: 800 }),
      map(({ pokemonData, abilityData }) => {
        const raw = pokemonData.pokemon_v2_pokemon[0];
        if (!raw) return null;
        const abilities: PokemonAbility[] = abilityData.pokemon_v2_pokemonability.map((a) => ({
          name: a.pokemon_v2_ability.name,
          shortEffect: a.pokemon_v2_ability.pokemon_v2_abilityeffecttexts[0]?.short_effect ?? '',
          isHidden: a.is_hidden,
        }));
        return { ...mapPokemon(raw), abilities };
      }),
    );
  }
}
