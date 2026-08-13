import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-rows',
  standalone: true,
  templateUrl: './skeleton-rows.component.html',
  styleUrl: './skeleton-rows.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonRowsComponent {
  readonly count = input(5);

  protected get rows(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
