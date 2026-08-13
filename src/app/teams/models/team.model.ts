export interface Team {
  /** String because json-graphql-server returns ID as string */
  id: string;
  trainerId: string;
  name: string;
  pokemonIds: number[];
  createdAt: string;
}

export interface CreateTeamInput {
  name: string;
  pokemonIds: number[];
}
