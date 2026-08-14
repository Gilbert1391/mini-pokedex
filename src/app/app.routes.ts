import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/pokedex', pathMatch: 'full' },
  {
    path: 'pokedex',
    loadComponent: () =>
      import('./pokedex/components/pokedex-page/pokedex-page.component').then(
        (m) => m.PokedexPageComponent,
      ),
  },
  {
    path: 'teams',
    loadComponent: () =>
      import('./teams/components/teams-page/teams-page.component').then(
        (m) => m.TeamsPageComponent,
      ),
  },
];
