import { FormControl } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { vi } from 'vitest';
import { ValidationErrors } from '@angular/forms';
import { uniqueTeamNameValidator } from './unique-team-name.validator';
import type { TeamStore } from '../state/team.store';

const mockStore = {
  snapshot: {
    teams: [
      { id: '1', trainerId: '1', name: 'Kanto Starters', pokemonIds: [], createdAt: '' },
      { id: '2', trainerId: '1', name: 'Johto Squad', pokemonIds: [], createdAt: '' },
    ],
  },
} as unknown as TeamStore;

describe('uniqueTeamNameValidator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null when the name is not taken', async () => {
    const validator = uniqueTeamNameValidator(mockStore);
    const control = new FormControl('Brand New Team');
    const promise = firstValueFrom(validator(control) as Observable<ValidationErrors | null>);
    await vi.advanceTimersByTimeAsync(300);
    expect(await promise).toBeNull();
  });

  it('returns { uniqueTeamName: true } when the name is already in use', async () => {
    const validator = uniqueTeamNameValidator(mockStore);
    const control = new FormControl('Kanto Starters');
    const promise = firstValueFrom(validator(control) as Observable<ValidationErrors | null>);
    await vi.advanceTimersByTimeAsync(300);
    expect(await promise).toEqual({ uniqueTeamName: true });
  });

  it('is case-insensitive', async () => {
    const validator = uniqueTeamNameValidator(mockStore);
    const control = new FormControl('johto squad');
    const promise = firstValueFrom(validator(control) as Observable<ValidationErrors | null>);
    await vi.advanceTimersByTimeAsync(300);
    expect(await promise).toEqual({ uniqueTeamName: true });
  });

  it('returns null for an empty control value', async () => {
    const validator = uniqueTeamNameValidator(mockStore);
    const control = new FormControl('');
    const promise = firstValueFrom(validator(control) as Observable<ValidationErrors | null>);
    await vi.advanceTimersByTimeAsync(0);
    expect(await promise).toBeNull();
  });
});
