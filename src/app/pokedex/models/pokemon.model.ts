export interface PokemonStat {
  name: string;
  baseStat: number;
}

export interface PokemonListItem {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  stats: PokemonStat[];
  spriteUrl: string | null;
  totalStats: number;
}

export interface PokemonAbility {
  name: string;
  shortEffect: string;
  isHidden: boolean;
}

export interface PokemonDetail extends PokemonListItem {
  abilities: PokemonAbility[];
}
