import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { POKEMON_TYPE_COLORS } from '../../constants/pokemon.constants';

@Component({
  selector: 'app-type-badge',
  standalone: true,
  templateUrl: './type-badge.component.html',
  styleUrl: './type-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeBadgeComponent {
  readonly type = input.required<string>();
  protected readonly color = computed(() => POKEMON_TYPE_COLORS[this.type()] ?? '#777');
}
