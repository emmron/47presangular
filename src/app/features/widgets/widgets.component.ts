import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WidgetPreset } from '../../models/widget.model';
import { WidgetService } from '../../services/widget.service';

@Component({
  selector: 'app-widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetsComponent implements OnInit {
  presets$!: Observable<WidgetPreset[]>;
  selectedPreset?: WidgetPreset;
  copied = false;

  constructor(private readonly widgetService: WidgetService) {}

  ngOnInit(): void {
    this.presets$ = this.widgetService.getPresets().pipe(
      tap((presets) => {
        if (!this.selectedPreset) {
          this.selectedPreset = presets[0];
        }
      })
    );
  }

  selectPreset(preset: WidgetPreset): void {
    this.selectedPreset = preset;
    this.copied = false;
  }

  async copySnippet(): Promise<void> {
    if (!this.selectedPreset) {
      return;
    }
    const snippet = this.widgetService.getEmbedSnippet(this.selectedPreset.id);
    await navigator.clipboard.writeText(snippet);
    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }

  getSnippet(): string {
    return this.selectedPreset
      ? this.widgetService.getEmbedSnippet(this.selectedPreset.id)
      : '';
  }
}
