import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  TEAM_MAX_SIZE,
  TEAM_MIN_SIZE,
  TEAM_NAME_MAX_LENGTH,
  TEAM_NAME_MIN_LENGTH,
} from '../../../common/constants/pokemon.constants';
import { TeamStore } from '../../state/team.store';
import { PokemonStore } from '../../../pokedex/state/pokemon.store';
import { uniqueTeamNameValidator } from '../../validators/unique-team-name.validator';
import { pokemonCountValidator } from '../../validators/pokemon-count.validator';
import type { PokemonListItem } from '../../../pokedex/models/pokemon.model';

@Component({
  selector: 'app-team-builder-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './team-builder-form.component.html',
  styleUrl: './team-builder-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderFormComponent implements OnInit {
  readonly cancel = output<void>();

  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);

  protected readonly nameLimits = { min: TEAM_NAME_MIN_LENGTH, max: TEAM_NAME_MAX_LENGTH };
  protected readonly maxSlots = TEAM_MAX_SIZE;

  protected readonly form = new FormGroup({
    name: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(TEAM_NAME_MIN_LENGTH),
        Validators.maxLength(TEAM_NAME_MAX_LENGTH),
      ],
      asyncValidators: [uniqueTeamNameValidator(this.teamStore)],
    }),
    pokemonIds: new FormControl<number[]>([], {
      validators: [pokemonCountValidator(TEAM_MIN_SIZE, TEAM_MAX_SIZE)],
    }),
  });

  get name() {
    return this.form.controls.name;
  }
  get pokemonIds() {
    return this.form.controls.pokemonIds;
  }

  // ── Autocomplete ──────────────────────────────────────────────────────

  protected readonly selectedPokemon = signal<PokemonListItem[]>([]);
  protected readonly rawAutocompleteInput = signal('');
  protected readonly isDropdownOpen = signal(false);

  private readonly _autocompleteInput$ = new Subject<string>();

  private readonly _filteredQuery = signal('');

  private readonly _autocompleteDebounce = toSignal(
    this._autocompleteInput$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((q) => this._filteredQuery.set(q.toLowerCase())),
      takeUntilDestroyed(),
    ),
    { initialValue: null },
  );

  protected readonly dropdownItems = computed<PokemonListItem[]>(() => {
    const q = this._filteredQuery();
    if (!q) return [];
    const selectedIds = new Set(this.selectedPokemon().map((p) => p.id));
    return Array.from(this.pokemonStore.pokemonById().values())
      .filter((p) => p.name.toLowerCase().includes(q) && !selectedIds.has(p.id))
      .slice(0, 8);
  });

  // ── Host listener to close dropdown on outside click ──────────────────

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const host = (event.target as HTMLElement).closest('app-team-builder-form');
    if (!host) this.isDropdownOpen.set(false);
  }

  ngOnInit(): void {
    // Ensure pokemon cache is ready for the autocomplete
    this.pokemonStore.loadPokemonList();
  }

  // ── Autocomplete actions ───────────────────────────────────────────────

  protected onAutocompleteInput(value: string): void {
    this.rawAutocompleteInput.set(value);
    this._autocompleteInput$.next(value);
    this.isDropdownOpen.set(value.length > 0);
  }

  protected selectPokemon(pokemon: PokemonListItem): void {
    if (this.selectedPokemon().length >= TEAM_MAX_SIZE) return;
    const next = [...this.selectedPokemon(), pokemon];
    this.selectedPokemon.set(next);
    this.pokemonIds.setValue(next.map((p) => p.id));
    this.pokemonIds.markAsDirty();
    this.rawAutocompleteInput.set('');
    this._filteredQuery.set('');
    this.isDropdownOpen.set(false);
  }

  protected removePokemon(id: number): void {
    const next = this.selectedPokemon().filter((p) => p.id !== id);
    this.selectedPokemon.set(next);
    this.pokemonIds.setValue(next.map((p) => p.id));
    this.pokemonIds.markAsDirty();
  }

  // ── Form submit ────────────────────────────────────────────────────────

  protected onSubmit(): void {
    if (this.form.invalid || this.form.pending) return;
    const name = this.name.value?.trim() ?? '';
    const pokemonIds = this.pokemonIds.value ?? [];
    this.teamStore.createTeam({ name, pokemonIds });
    this.form.reset({ name: '', pokemonIds: [] });
    this.selectedPokemon.set([]);
    this.cancel.emit();
  }
}
