import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validates that an array-valued control has between `min` and `max` items. */
export function pokemonCountValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const ids: number[] = control.value ?? [];
    if (ids.length < min) return { minPokemon: { required: min, actual: ids.length } };
    if (ids.length > max) return { maxPokemon: { max, actual: ids.length } };
    return null;
  };
}
