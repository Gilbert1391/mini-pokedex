import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { Toast, ToastType } from '../common/models/toast.model';

/** Manages a live queue of toast notifications; auto-dismisses after 4 s. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts$ = new BehaviorSubject<Toast[]>([]);
  /** Observable queue consumed by ToastComponent. */
  readonly toasts$ = this._toasts$.asObservable();

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  /** Pushes a toast notification and schedules auto-dismiss. */
  show(message: string, type: ToastType = 'info', durationMs = 4000): void {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const toast: Toast = { id, message, type };
    this._toasts$.next([...this._toasts$.getValue(), toast]);

    const timer = setTimeout(() => this.dismiss(id), durationMs);
    this.timers.set(id, timer);
  }

  /** Removes a toast by id (called on auto-dismiss or manual close). */
  dismiss(id: string): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this._toasts$.next(this._toasts$.getValue().filter((t) => t.id !== id));
  }
}
