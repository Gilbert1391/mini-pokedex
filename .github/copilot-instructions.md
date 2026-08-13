# Mini Pokédex — Agent Instructions

Angular 21 assessment app (GraphQL Pokédex + team builder). Follow for all work in this repo.

## Non-negotiable: UI States

Every component loading async data (table, detail panel, team list, autocomplete) must render all 4 states via the shared `<app-async-state>` wrapper (`src/app/common/components/async-state/`): loading (skeleton), empty (message), error (message + Retry), success. Never ship a view with only success/loading handled.

## State Management

- Custom RxJS store only — never NgRx/Akita/NgXS.
- Stores are `BehaviorSubject`-based; selectors are derived streams via `map`, `distinctUntilChanged`, `combineLatest`, `shareReplay(1)`.
- Search inputs: `debounceTime(300) → distinctUntilChanged() → switchMap`.
- No subscription leaks: `takeUntilDestroyed()`, `DestroyRef`, or `async` pipe only.
- Optimistic updates (team create/delete): update UI immediately, roll back + toast on failure.

## Signals

- `signal()` for UI state, `computed()` for derived values, `effect()` for side effects (e.g. localStorage), `toSignal()` to bridge store selectors into templates.
- Components: `input()`/`output()` only — no `@Input`/`@Output` decorators.
- All components: standalone, `ChangeDetectionStrategy.OnPush`, `inject()`.

## Folder Structure & Naming

`src/app/{pokedex,teams,common,core}/...` with `state/`, `services/`, `models/`, `components/` per feature. Components: `component-name.component.ts`. Services: `service-name.service.ts`. Models: `entity.model.ts`.

## Code Quality

- JSDoc only on public methods of stores/services (not components, unless non-obvious).
- No `alert()`; no raw error dumps in templates.
- Commits: use the `conventional-commits` skill — no ad-hoc messages. Also enforced deterministically by husky + commitlint (`commitlint.config.js`).

## GraphQL

- Custom `GraphqlClientService` (HttpClient-based) — no Apollo.
- Public PokeAPI calls wrapped with `retry({count: 2, delay: 800})`.

## Styling & Assets

- SCSS with BEM naming per component: `.block { &__element {} &--modifier {} }`.
- Never hardcode colors/sizes — reference `:root` custom properties (`--color-primary`, `--color-surface`, `--panel-width`, `--backdrop-blur`, etc.) defined in `src/styles.scss`.
- Reuse shared mixins/placeholders from `common/styles/_shared.scss` (e.g. `%sk-shimmer`, `custom-scrollbar` mixin) instead of duplicating animations.
- Dark theme by default: `color-scheme: dark`, body background `var(--color-surface)`.
- Icons: SVG files in `src/assets/icons/ic_<name>.svg`; always set explicit `width`/`height`; decorative icons get `alt=""` + `aria-hidden="true"`.

## Tooling & Versions

- Align with guide pins where applicable: `rxjs ~7.8.0`, `typescript ~5.9.x`, `angular-eslint ^21.x`, `vitest ^4.x` + `@vitest/coverage-v8 ^4.x` for tests.
- Never add `aws-amplify`, `@aws-amplify/ui-angular`, or `@angular/material` — out of scope per assessment instructions; components are hand-rolled per guide's examples.
- Chart library: `@swimlane/ngx-charts` — use `ngx-charts-polar-chart` (`curveClosed: true`) for radar-style charts.
