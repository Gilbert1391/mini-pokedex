import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TeamStore } from './team.store';
import { TeamApiService } from '../services/team-api.service';
import { ToastService } from '../../core/toast.service';
import type { Team } from '../models/team.model';

const serverTeam: Team = {
  id: 'server-1',
  trainerId: '1',
  name: 'Test Team',
  pokemonIds: [1, 2],
  createdAt: '2024-01-01T00:00:00Z',
};

describe('TeamStore', () => {
  let store: TeamStore;
  let mockApi: {
    getTeams$: ReturnType<typeof vi.fn>;
    createTeam$: ReturnType<typeof vi.fn>;
    deleteTeam$: ReturnType<typeof vi.fn>;
  };
  let mockToast: {
    show: ReturnType<typeof vi.fn>;
    dismiss: ReturnType<typeof vi.fn>;
    toasts$: unknown;
  };

  beforeEach(() => {
    mockApi = {
      getTeams$: vi.fn().mockReturnValue(of([])),
      createTeam$: vi.fn(),
      deleteTeam$: vi.fn(),
    };
    mockToast = {
      show: vi.fn(),
      dismiss: vi.fn(),
      toasts$: of([]),
    };

    TestBed.configureTestingModule({
      providers: [
        TeamStore,
        { provide: TeamApiService, useValue: mockApi },
        { provide: ToastService, useValue: mockToast },
      ],
    });
    store = TestBed.inject(TeamStore);
  });

  describe('createTeam — optimistic update', () => {
    it('immediately adds a placeholder team before the mutation resolves', () => {
      // Subject never emits until we explicitly push a value, preserving the optimistic state
      const pending$ = new Subject<Team>();
      mockApi['createTeam$'].mockReturnValue(pending$.asObservable());
      store.createTeam({ name: 'Test Team', pokemonIds: [1, 2] });

      const teams = store.snapshot.teams;
      expect(teams).toHaveLength(1);
      expect(teams[0].id).toMatch(/^temp-/);
      expect(teams[0].name).toBe('Test Team');
      pending$.complete();
    });

    it('replaces the optimistic placeholder with the server response on success', () => {
      mockApi['createTeam$'].mockReturnValue(of(serverTeam));
      store.createTeam({ name: 'Test Team', pokemonIds: [1, 2] });

      const teams = store.snapshot.teams;
      expect(teams).toHaveLength(1);
      expect(teams[0].id).toBe('server-1');
    });

    it('rolls back the optimistic entry and shows an error toast on failure', () => {
      mockApi['createTeam$'].mockReturnValue(throwError(() => new Error('Network error')));
      store.createTeam({ name: 'Test Team', pokemonIds: [1, 2] });

      expect(store.snapshot.teams).toHaveLength(0);
      expect(mockToast['show']).toHaveBeenCalledWith('Network error', 'error');
    });
  });

  describe('deleteTeam — optimistic delete', () => {
    it('removes the team immediately', () => {
      // Seed with a real team
      store['_state$'].next({ ...store.snapshot, teams: [serverTeam] });
      mockApi['deleteTeam$'].mockReturnValue(of(undefined));

      store.deleteTeam('server-1');

      expect(store.snapshot.teams).toHaveLength(0);
    });

    it('re-inserts the team at the original position and shows a toast on failure', () => {
      store['_state$'].next({ ...store.snapshot, teams: [serverTeam] });
      mockApi['deleteTeam$'].mockReturnValue(throwError(() => new Error('Delete failed')));

      store.deleteTeam('server-1');

      expect(store.snapshot.teams).toHaveLength(1);
      expect(store.snapshot.teams[0].id).toBe('server-1');
      expect(mockToast['show']).toHaveBeenCalledWith('Delete failed', 'error');
    });
  });
});
