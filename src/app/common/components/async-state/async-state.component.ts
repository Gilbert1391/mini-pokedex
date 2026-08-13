import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { AsyncState } from '../../models/async-state.model';
import { SkeletonRowsComponent } from '../skeleton-rows/skeleton-rows.component';

@Component({
  selector: 'app-async-state',
  standalone: true,
  imports: [SkeletonRowsComponent],
  templateUrl: './async-state.component.html',
  styleUrl: './async-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsyncStateComponent {
  readonly state = input.required<AsyncState<unknown>>();
  readonly emptyMessage = input('No results found.');
  readonly skeletonRows = input(5);
  readonly retry = output<void>();

  protected readonly errorMessage = computed(() => {
    const s = this.state();
    return s.status === 'error' ? s.error : null;
  });
}
