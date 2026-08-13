export type AsyncState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'empty' }
  | { readonly status: 'error'; readonly error: string }
  | { readonly status: 'success'; readonly data: T };

export function asyncLoading<T = never>(): AsyncState<T> {
  return { status: 'loading' };
}

export function asyncEmpty<T = never>(): AsyncState<T> {
  return { status: 'empty' };
}

export function asyncError<T = never>(error: string): AsyncState<T> {
  return { status: 'error', error };
}

export function asyncSuccess<T>(data: T): AsyncState<T> {
  return { status: 'success', data };
}
