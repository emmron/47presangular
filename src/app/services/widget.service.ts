import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WidgetPreset } from '../models/widget.model';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private readonly apiBase = 'https://api.47campaign.com/public/news';

  private readonly presets: WidgetPreset[] = [
    {
      id: 'headlines-light',
      name: 'Headlines (Light)',
      description: 'Compact headline ticker designed for news partners using light backgrounds.',
      theme: 'light',
      exampleHeadline: 'Trump announces 1M volunteer shift goal ahead of Labor Day weekend.',
    },
    {
      id: 'headlines-dark',
      name: 'Headlines (Dark)',
      description: 'High-contrast widget optimized for dark site themes and OTT devices.',
      theme: 'dark',
      exampleHeadline: 'Truckers Association endorses America First infrastructure blueprint.',
    },
  ];

  getPresets(): Observable<WidgetPreset[]> {
    return of(this.presets);
  }

  getEmbedSnippet(presetId: string): string {
    return `\
<!-- 47 Campaign Widget -->\n<div id="campaign-widget" data-preset="${presetId}" data-endpoint="${this.apiBase}"></div>\n<script src="https://cdn.47campaign.com/sdk/widget-sdk.js" async></script>\n<!-- End Widget -->`;
  }
}
