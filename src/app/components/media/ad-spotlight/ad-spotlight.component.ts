import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { MediaDataService } from '../../../services/media-data.service';
import { AdSpotlightInfo, MediaImageSource } from '../../../models/media.model';

interface AdSpotlightViewModel {
  ad: AdSpotlightInfo | null;
}

@Component({
  selector: 'app-ad-spotlight',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ad-spotlight.component.html',
  styleUrls: ['./ad-spotlight.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdSpotlightComponent {
  loading = true;
  error: string | null = null;

  readonly ad$ = this.mediaDataService.getAdSpotlight().pipe(
    map(ad => this.mapToViewModel(ad)),
    catchError(() => {
      this.loading = false;
      this.error = 'Unable to load the ad spotlight.';
      return of({ ad: null } satisfies AdSpotlightViewModel);
    }),
    startWith({ ad: null } satisfies AdSpotlightViewModel)
  );

  constructor(private readonly mediaDataService: MediaDataService) {}

  trackSource(_: number, source: MediaImageSource): number {
    return source.width;
  }

  private mapToViewModel(ad: AdSpotlightInfo): AdSpotlightViewModel {
    this.loading = false;
    this.error = null;
    return { ad };
  }
}
