import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlClientService } from '../../core/graphql/graphql-client.service';
import { DEFAULT_TRAINER_ID, MOCK_GRAPHQL_URL } from '../../common/constants/pokemon.constants';
import type { CreateTeamInput, Team } from '../models/team.model';

// ── Raw API shapes (snake_case — json-graphql-server preserves db.js keys) ──

interface RawTeam {
  id: string;
  trainer_id: string;
  name: string;
  pokemon_ids: number[];
  created_at: string;
}

// ── GraphQL query/mutation strings ─────────────────────────────────────────

const GET_TEAMS_QUERY = /* GraphQL */ `
  query GetTeams($trainerId: ID) {
    allTeams(filter: { trainer_id: $trainerId }) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const CREATE_TEAM_MUTATION = /* GraphQL */ `
  mutation CreateTeam($name: String!, $pokemonIds: [Int]!, $trainerId: ID!, $createdAt: String!) {
    createTeam(
      name: $name
      pokemon_ids: $pokemonIds
      trainer_id: $trainerId
      created_at: $createdAt
    ) {
      id
      trainer_id
      name
      pokemon_ids
      created_at
    }
  }
`;

const REMOVE_TEAM_MUTATION = /* GraphQL */ `
  mutation RemoveTeam($id: ID!) {
    removeTeam(id: $id) {
      id
    }
  }
`;

// ── Mapping helper ─────────────────────────────────────────────────────────

function mapTeam(raw: RawTeam): Team {
  return {
    id: raw.id,
    trainerId: raw.trainer_id,
    name: raw.name,
    pokemonIds: raw.pokemon_ids,
    createdAt: raw.created_at,
  };
}

// ── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class TeamApiService {
  private readonly graphql = inject(GraphqlClientService);

  /** Fetches all teams for the given trainer (defaults to trainer 1 — Ash). */
  getTeams$(trainerId = DEFAULT_TRAINER_ID): Observable<Team[]> {
    return this.graphql
      .query$<{ allTeams: RawTeam[] }>(MOCK_GRAPHQL_URL, GET_TEAMS_QUERY, {
        trainerId: String(trainerId),
      })
      .pipe(map((data) => data.allTeams.map(mapTeam)));
  }

  /** Creates a new team via mutation; returns the persisted team with server-assigned id. */
  createTeam$(input: CreateTeamInput): Observable<Team> {
    return this.graphql
      .query$<{ createTeam: RawTeam }>(MOCK_GRAPHQL_URL, CREATE_TEAM_MUTATION, {
        name: input.name,
        pokemonIds: input.pokemonIds,
        trainerId: String(DEFAULT_TRAINER_ID),
        createdAt: new Date().toISOString(),
      })
      .pipe(map((data) => mapTeam(data.createTeam)));
  }

  /** Removes a team by id. Returns void — callers should not depend on the response body. */
  deleteTeam$(id: string): Observable<void> {
    return this.graphql
      .query$<{ removeTeam: { id: string } | null }>(MOCK_GRAPHQL_URL, REMOVE_TEAM_MUTATION, { id })
      .pipe(map(() => undefined));
  }
}
