export const POKEMON_TYPE_COLORS: Record<string, string> = {
  normal: '#9a9a7a',
  fire: '#f08030',
  water: '#6890f0',
  electric: '#f8d030',
  grass: '#78c850',
  ice: '#98d8d8',
  fighting: '#c03028',
  poison: '#a040a0',
  ground: '#e0c068',
  flying: '#a890f0',
  psychic: '#f85888',
  bug: '#a8b820',
  rock: '#b8a038',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848',
  steel: '#b8b8d0',
  fairy: '#ee99ac',
};

export const POKEMON_STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  'special-attack': 'Sp.Atk',
  'special-defense': 'Sp.Def',
  speed: 'Speed',
};

export const STAT_ORDER = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

export type StatName = (typeof STAT_ORDER)[number];

/** Max number of Pokémon per team */
export const TEAM_MAX_SIZE = 6;

/** Min number of Pokémon per team */
export const TEAM_MIN_SIZE = 1;

export const TEAM_NAME_MIN_LENGTH = 3;
export const TEAM_NAME_MAX_LENGTH = 30;

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const POKEAPI_GRAPHQL_URL = 'https://beta.pokeapi.co/graphql/v1beta';
export const MOCK_GRAPHQL_URL = 'http://localhost:4000/graphql';

export const DEFAULT_TRAINER_ID = 1;
