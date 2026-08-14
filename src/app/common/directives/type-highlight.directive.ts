import { Directive, ElementRef, computed, effect, inject, input } from '@angular/core';
import { isStrongAgainst, isWeakAgainst } from '../constants/type-effectiveness.constants';

/**
 * Bonus directive: applied to table rows to highlight strength/weakness
 * of the row's Pokémon relative to the currently filtered type.
 *
 * Usage: <tr [appTypeHighlight]="pokemon.types" [highlightAgainst]="typeFilter()">
 */
@Directive({
  selector: '[appTypeHighlight]',
  standalone: true,
})
export class TypeHighlightDirective {
  /** The Pokémon's type(s) for this row. */
  readonly appTypeHighlight = input<string[]>([]);
  /** The currently selected filter type to compare against. */
  readonly highlightAgainst = input('');

  private readonly el = inject(ElementRef<HTMLElement>);

  constructor() {
    effect(() => {
      const types = this.appTypeHighlight();
      const against = this.highlightAgainst();
      const host = this.el.nativeElement;

      host.classList.remove('type-highlight--strong', 'type-highlight--weak');

      if (!against || types.length === 0) return;

      if (isStrongAgainst(types, against)) {
        host.classList.add('type-highlight--strong');
      } else if (isWeakAgainst(types, against)) {
        host.classList.add('type-highlight--weak');
      }
    });
  }
}
