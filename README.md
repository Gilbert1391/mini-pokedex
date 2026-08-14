# Mini Pokédex

Angular 21 assessment app — browse Pokémon and build a team using GraphQL.

## Prerequisites

- Node.js 20 or 22 (tested on 22.21.0)
- npm 10+

## Setup

```bash
npm install
```

## Running the app

Two terminals are required — the Angular dev server and the local GraphQL mock server.

**Terminal 1 — mock server (teams CRUD):**

```bash
npm run mock-server
# GraphQL server running at http://localhost:4000/
```

**Terminal 2 — Angular dev server:**

```bash
npm start
# App running at http://localhost:4200/
```

Navigate to `http://localhost:4200` — it redirects to `/pokedex` automatically.

## Running tests

```bash
npm test
```

14 unit tests covering:

- `TeamStore` — optimistic create (placeholder), success swap, rollback + toast, delete rollback
- `PokemonSelectors` — name filter, type filter, totalStats sort, pagination
- `uniqueTeamNameValidator` — unique / duplicate / case-insensitive / empty

## Architecture

### Layer overview

```
GraphQL APIs
  ├── PokéAPI  (beta.pokeapi.co) — Pokémon list, detail, abilities
  └── Mock     (localhost:4000)  — Teams CRUD via json-graphql-server

Core
  └── GraphqlClientService — thin HttpClient POST wrapper, throws on GraphQL errors

Feature Services
  ├── PokemonApiService  — getPokemonList$, getPokemonById$ (both with retry x2/800ms)
  └── TeamApiService     — getTeams$, createTeam$, deleteTeam$

RxJS Stores
  ├── PokemonStore  — BehaviorSubject cache (Map<id, Pokemon>), loading/error signals
  │   └── PokemonSelectors  — pagedPokemon$: combineLatest of filter+sort+page observables
  └── TeamStore     — BehaviorSubject of teams[], optimistic create/delete with rollback

Signal Layer
  ├── PokedexUiStore  — UI signals (selectedId, isPanelOpen, page, sort, search)
  │                     + toSignal() bridges from RxJS to templates
  │                     + debounced search via Subject → debounceTime(300)
  └── TeamUiStore     — selectedTeamId signal with effect() → localStorage
                        + computed() for type distribution and total base stats

Components
  ├── /pokedex  — PokedexPage → PokedexTable + PokemonDetailPanel (ngx-charts radar)
  └── /teams    — TeamsPage → TeamCard + TeamBuilderForm (Reactive Forms)
```

### Key design decisions

- **Custom RxJS store** — `BehaviorSubject`-based, no NgRx. Selectors are derived streams via `combineLatest`/`shareReplay(1)`. No subscription leaks — stores are `providedIn: 'root'`, components use `toSignal()` or `async` pipe.
- **Signals as the UI layer** — `toSignal()` converts store observables to signals; `computed()` for derived values; `effect()` for side effects (localStorage). All components are `OnPush` with `inject()` and `input()`/`output()`.
- **Optimistic updates** — team create/delete updates the UI immediately with a temp entry, then swaps for the real server response (or rolls back + toasts on failure).
- **Async-state wrapper** — every async view uses `<app-async-state>` which enforces all four states: loading (skeleton shimmer), empty (message), error (message + Retry), success (projected content).
- **No Apollo** — `GraphqlClientService` is a 20-line HttpClient wrapper. PokeAPI calls use `retry({ count: 2, delay: 800 })`.
- **Bonus: type-highlight directive** — `[appTypeHighlight]` applies green/red left-border to table rows based on type effectiveness vs. the active type filter.

## What I'd improve with more time

1. **More Pokémon generations** — raise `DEFAULT_LOAD_LIMIT` from 151 (Gen 1) to 898+ and add a "Load more" button; or switch to server-side pagination with the PokeAPI offset.
2. **Virtual scroll** — replace client-side pagination with `@angular/cdk/ScrollingModule` for the table, with skeleton rows during load.
3. **Team detail view** — a dedicated panel showing all 6 members side-by-side with a combined type-coverage matrix.
4. **Mobile layout** — the detail panel currently overlays at fixed width; would benefit from a full-screen bottom sheet on narrow viewports.
5. **Component tests** — cover `PokedexTableComponent` sort/emit behaviour and `TeamBuilderFormComponent` validation flow with Angular Testing Library.
6. **E2E tests** — Playwright smoke tests for the four UI states (offline / throttled network).
7. **Proper type effectiveness** — the current directive only checks single-direction effectiveness; a full bidirectional chart would handle dual-type Pokémon correctly.
8. **Trainer switching** — the mock server has multiple trainers; a trainer picker in the nav would be a natural extension.

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
