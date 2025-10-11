import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { NewsStateService } from '../../services/news-state.service';
import { NewsItemComponent } from '../news-item/news-item.component';
import { NewsItem, NewsFilter, SavedFilterPreset, DigestState } from '../../models/news.model';
import { AuthService } from '../../auth/auth.service';
import { NewsItem, NewsFilter } from '../../models/news.model';
import { NewsItemComponent } from '../news-item/news-item.component';

interface SourceOption {
  name: string;
  slug: string;
}

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NewsItemComponent],
  templateUrl: './news-feed.component.html',
  styleUrls: ['./news-feed.component.scss']
})
export class NewsFeedComponent implements OnInit, OnDestroy {
  newsItems: NewsItem[] = [];
  loading = false;
  error: string | null = null;
  lastUpdated: Date | null = null;
  searchTerm = '';
  selectedSource = '';
  presets: SavedFilterPreset[] = [];
  digestState: DigestState | null = null;
  newPresetName = '';
  presetMessage: string | null = null;
  savingPreset = false;
  selectedPresetId: string | null = null;
  user$ = this.authService.user$;

  private destroy$ = new Subject<void>();
  private searchDebounce$ = new Subject<string>();

  constructor(private stateService: NewsStateService, private authService: AuthService) {
    // Set up debounced search
    this.searchDebounce$.pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(term => {
      this.updateFilters({ searchTerm: term });
    });
  }

  ngOnInit(): void {
    // Subscribe to state changes
    this.stateService.state$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(state => {
      this.newsItems = state.items;
      this.loading = state.loading;
      this.error = state.error;
      this.lastUpdated = state.lastUpdated;
    });

    this.stateService.savedPresets$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((presets) => {
      this.presets = presets;
      if (this.selectedPresetId && !presets.find(preset => preset.id === this.selectedPresetId)) {
        this.selectedPresetId = null;
      }
    });

    this.stateService.digestSchedule$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((digest) => {
      this.digestState = digest;
    });

    // Initial data fetch
    this.fetchNews();
  constructor(private stateService: NewsStateService) {
    this.searchDebounce$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(term => {
        this.updateFilters({ searchTerm: term || undefined });
      });
  }

  ngOnInit(): void {
    this.stateService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.newsItems = state.items;
        this.loading = state.loading;
        this.error = state.error;
        this.lastUpdated = state.lastUpdated;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchNews(): void {
    this.stateService.fetchNews();
  }

  refreshNews(): void {
    this.fetchNews();
  }

  onSearchInput(term: string): void {
    this.searchTerm = term;
    this.searchDebounce$.next(term);
  }

  updateFilters(filters: Partial<NewsFilter>): void {
    this.stateService.updateFilters(filters);
  }

  onSourceChange(sourceSlug: string): void {
    this.selectedSource = sourceSlug;
    this.updateFilters({ sources: sourceSlug ? [sourceSlug] : undefined });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSource = '';
    this.stateService.resetFilters();
  }

  get availableSources(): SourceOption[] {
    const seen = new Map<string, string>();

    this.newsItems.forEach(item => {
      if (!seen.has(item.source.slug)) {
        seen.set(item.source.slug, item.source.name);
      }
    });

    return Array.from(seen.entries())
      .map(([slug, name]) => ({ slug, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  get filteredItems(): NewsItem[] {
    return this.stateService.getFilteredItems();
  }

  get lastUpdatedText(): string {
    if (!this.lastUpdated) {
      return 'Never';
    }
    return this.lastUpdated.toLocaleString();
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedSource);
  }

  saveCurrentFilters(): void {
    const trimmed = this.newPresetName.trim();
    if (!trimmed) {
      this.presetMessage = 'Provide a name for your briefing.';
      return;
    }

    this.presetMessage = null;
    this.savingPreset = true;

    this.stateService.saveCurrentFilters(trimmed).subscribe({
      next: (preset) => {
        this.savingPreset = false;
        this.newPresetName = '';
        this.presetMessage = `Saved briefing “${preset.name}”.`;
        this.selectedPresetId = preset.id;
      },
      error: (err) => {
        this.savingPreset = false;
        this.presetMessage = err.message || 'Unable to save briefing.';
      }
    });
  }

  applyPreset(preset: SavedFilterPreset): void {
    this.selectedPresetId = preset.id;
    this.stateService.applyPreset(preset);
    this.searchTerm = preset.filters.searchTerm || '';
    this.selectedSource = preset.filters.source || '';
  }

  deletePreset(preset: SavedFilterPreset): void {
    this.stateService.deleteFilterPreset(preset.id).subscribe({
      next: () => {
        if (this.selectedPresetId === preset.id) {
          this.selectedPresetId = null;
        }
        this.presetMessage = `Removed briefing “${preset.name}”.`;
      },
      error: (err) => {
        this.presetMessage = err.message || 'Unable to remove briefing.';
      }
    });
  }

  get hasPresets(): boolean {
    return this.presets.length > 0;
  }
}
