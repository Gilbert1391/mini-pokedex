import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastService } from '../../../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  protected readonly toasts = toSignal(this.toastService.toasts$, { initialValue: [] });

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
