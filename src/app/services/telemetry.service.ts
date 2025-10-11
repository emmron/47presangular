import { Injectable } from '@angular/core';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

import { NewsItem } from '../models/news.model';

interface TelemetryClient {
  captureMessage?(message: string, context?: Record<string, unknown>): void;
  captureException?(error: unknown, context?: Record<string, unknown>): void;
  trackEvent?(name: string, properties?: Record<string, unknown>): void;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private readonly client: TelemetryClient | null;

  constructor() {
    this.client = this.resolveClient();
  }

  logEvent(name: string, properties?: Record<string, unknown>): void {
    if (this.client?.trackEvent) {
      this.client.trackEvent(name, properties);
    } else if (this.client?.captureMessage) {
      this.client.captureMessage(name, properties);
    } else {
      console.debug(`[telemetry] ${name}`, properties);
    }
  }

  logError(error: unknown, context?: Record<string, unknown>): void {
    if (this.client?.captureException) {
      this.client.captureException(error, context);
    } else {
      console.error('[telemetry] error', error, context);
    }
  }

  collectMetrics(): MonoTypeOperatorFunction<NewsItem> {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let count = 0;
    return (source$) =>
      new Observable<NewsItem>((subscriber) =>
        source$.subscribe({
          next: (item) => {
            count += 1;
            subscriber.next(item);
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const duration = end - start;
            this.logEvent('news.ingestion.normalized', {
              itemCount: count,
              durationMs: Number(duration.toFixed(2))
            });
            subscriber.complete();
          }
        })
      );
  }

  private resolveClient(): TelemetryClient | null {
    const globalObject = globalThis as any;
    if (globalObject.Sentry) {
      return globalObject.Sentry as TelemetryClient;
    }
    if (globalObject.__OTEL_EXPORTER__) {
      return globalObject.__OTEL_EXPORTER__ as TelemetryClient;
    }
    return null;
  }
}
