import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';

interface GraphqlResponse<T> {
  data: T;
  errors?: { message: string }[];
}

/** Thin HttpClient-based GraphQL client — no Apollo dependency. */
@Injectable({ providedIn: 'root' })
export class GraphqlClientService {
  private readonly http = inject(HttpClient);

  /**
   * Executes a GraphQL query or mutation against `url`.
   * Throws a plain Error if the response contains GraphQL errors.
   */
  query$<T>(url: string, query: string, variables?: Record<string, unknown>): Observable<T> {
    return this.http.post<GraphqlResponse<T>>(url, { query, variables }).pipe(
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors.map((e) => e.message).join('; '));
        }
        return response.data;
      }),
    );
  }
}
