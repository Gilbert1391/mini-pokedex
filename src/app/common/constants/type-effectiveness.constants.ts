/** Maps each attacking type to the types it hits super-effectively (2×). */
export const TYPES_WEAK_AGAINST: Record<string, string[]> = {
  fire: ['grass', 'ice', 'bug', 'steel'],
  water: ['fire', 'ground', 'rock'],
  grass: ['water', 'ground', 'rock'],
  electric: ['water', 'flying'],
  ice: ['grass', 'ground', 'flying', 'dragon'],
  fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
  poison: ['grass', 'fairy'],
  ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
  flying: ['grass', 'fighting', 'bug'],
  psychic: ['fighting', 'poison'],
  bug: ['grass', 'psychic', 'dark'],
  rock: ['fire', 'ice', 'flying', 'bug'],
  ghost: ['psychic', 'ghost'],
  dragon: ['dragon'],
  dark: ['psychic', 'ghost'],
  steel: ['ice', 'rock', 'fairy'],
  fairy: ['fighting', 'dragon', 'dark'],
  normal: [],
};

/** Returns true if any of `pokemonTypes` deals super-effective damage to `targetType`. */
export function isStrongAgainst(pokemonTypes: string[], targetType: string): boolean {
  return pokemonTypes.some((t) => TYPES_WEAK_AGAINST[t]?.includes(targetType) ?? false);
}

/** Returns true if `attackerType` deals super-effective damage to any of `pokemonTypes`. */
export function isWeakAgainst(pokemonTypes: string[], attackerType: string): boolean {
  return pokemonTypes.some((t) => TYPES_WEAK_AGAINST[attackerType]?.includes(t) ?? false);
}
