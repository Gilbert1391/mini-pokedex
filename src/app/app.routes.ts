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
];
