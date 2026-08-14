import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { AsyncStateComponent } from '../../../common/components/async-state/async-state.component';
import { PokedexTableComponent } from '../pokedex-table/pokedex-table.component';
import { PokemonDetailPanelComponent } from '../pokemon-detail-panel/pokemon-detail-panel.component';
import { PokemonStore } from '../../state/pokemon.store';
import { PokedexUiStore } from '../../state/pokedex-ui.store';
import {
  PAGE_SIZE_OPTIONS,
  POKEMON_TYPE_COLORS,
} from '../../../common/constants/pokemon.constants';
import {
  asyncEmpty,
  asyncError,
  asyncLoading,
  asyncSuccess,
} from '../../../common/models/async-state.model';
import type { SortChangeEvent } from '../pokedex-table/pokedex-table.component';

@Component({
  selector: 'app-pokedex-page',
  standalone: true,
  imports: [AsyncStateComponent, PokedexTableComponent, PokemonDetailPanelComponent],
  templateUrl: './pokedex-page.component.html',
  styleUrl: './pokedex-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPageComponent implements OnInit {
  protected readonly store = inject(PokemonStore);
  protected readonly uiStore = inject(PokedexUiStore);

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly typeOptions = Object.keys(POKEMON_TYPE_COLORS);

  /** Converts signal-based loading/error/data state to the AsyncState union. */
  protected readonly tableState = computed(() => {
    if (this.uiStore.isListLoading()) return asyncLoading();
    const err = this.uiStore.listError();
    if (err) return asyncError(err);
    const result = this.uiStore.pagedResult();
    if (!result || result.totalItems === 0) return asyncEmpty();
    return asyncSuccess(null);
  });

  protected readonly detailState = computed(() => {
    if (this.uiStore.isDetailLoading()) return asyncLoading<null>();
    const err = this.uiStore.detailError();
    if (err) return asyncError<null>(err);
    const d = this.uiStore.selectedDetail();
    if (!d) return asyncLoading<null>();
    return asyncSuccess(d);
  });

  ngOnInit(): void {
    this.store.loadPokemonList();
  }

  protected onSortChange(event: SortChangeEvent): void {
    this.uiStore.setSort(event.field, event.direction);
  }

  protected retryLoad(): void {
    this.store.loadPokemonList(151, 0, true);
  }

  protected retryDetail(): void {
    const id = this.uiStore.selectedPokemonId();
    if (id !== null) this.store.loadPokemonDetail(id);
  }

  protected onPageChange(delta: number): void {
    const result = this.uiStore.pagedResult();
    if (!result) return;
    const next = this.uiStore.currentPage() + delta;
    if (next >= 0 && next < result.totalPages) {
      this.uiStore.setPage(next);
    }
  }
}
