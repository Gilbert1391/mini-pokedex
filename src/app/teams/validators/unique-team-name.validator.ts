import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, map, timer } from 'rxjs';
import type { TeamStore } from '../state/team.store';

/**
 * Returns an async validator that checks if the team name is already taken.
 * Uses timer(300) to debounce — Angular cancels prior subscriptions on new input.
 */
export function uniqueTeamNameValidator(teamStore: TeamStore): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const name = (control.value as string)?.trim().toLowerCase();
    if (!name) return timer(0).pipe(map(() => null));
    return timer(300).pipe(
      map(() => {
        const taken = teamStore.snapshot.teams.some((t) => t.name.trim().toLowerCase() === name);
        return taken ? { uniqueTeamName: true } : null;
      }),
    );
  };
}
