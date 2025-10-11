import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { catchError, map, of, startWith } from 'rxjs';
import { MediaDataService } from '../../../services/media-data.service';
import { LiveStreamInfo, MediaImageSource } from '../../../models/media.model';

interface LiveStreamViewModel {
  stream: LiveStreamInfo | null;
  safeStreamUrl: SafeResourceUrl | null;
}

@Component({
  selector: 'app-live-stream-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-stream-widget.component.html',
  styleUrls: ['./live-stream-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveStreamWidgetComponent {
  loading = true;
  error: string | null = null;

  readonly liveStream$ = this.mediaDataService.getLiveStream().pipe(
    map(stream => this.mapToViewModel(stream)),
    catchError(() => {
      this.loading = false;
      this.error = 'Unable to load the live stream right now. Please try again later.';
      return of({ stream: null, safeStreamUrl: null } satisfies LiveStreamViewModel);
    }),
    startWith({ stream: null, safeStreamUrl: null } satisfies LiveStreamViewModel)
  );

  constructor(
    private readonly mediaDataService: MediaDataService,
    private readonly sanitizer: DomSanitizer
  ) {}

  onStreamLoaded(): void {
    this.loading = false;
  }

  onStreamFallback(): void {
    this.loading = false;
    this.error = 'We could not load the embedded stream. Watch directly on the platform.';
  }

  trackSource(_: number, source: MediaImageSource): number {
    return source.width;
  }

  private mapToViewModel(stream: LiveStreamInfo): LiveStreamViewModel {
    this.loading = false;
    this.error = null;

    return {
      stream,
      safeStreamUrl: this.sanitizer.bypassSecurityTrustResourceUrl(stream.streamUrl)
    };
  }
}
