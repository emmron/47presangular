import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';

export interface Loading {
  state: "loading";
}

export interface Loaded<T> {
  state: "loaded";
  data: T;
}

export interface Errored {
  state: "error";
  error: Error;
}

export type LoadingState<T = unknown> = Loading | Loaded<T> | Errored;

export function toLoadingState<T>(source$: Observable<T>): Observable<LoadingState<T>> {
  return source$.pipe(
    map((data: T) => ({ state: "loaded", data } as Loaded<T>)),
    catchError((error: Error) => of({ state: "error", error } as Errored)),
    startWith({ state: "loading" } as Loading)
  );
}
