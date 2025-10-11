import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { switchMap, takeUntil, tap, catchError } from 'rxjs/operators';
import { Meta, Title } from '@angular/platform-browser';

import { NewsApiService } from '../../../services/news-api.service';
import { StoryDetail } from '../../../models/news.model';
import { KeyFactsComponent } from '../key-facts/key-facts.component';
import { SourceListComponent } from '../source-list/source-list.component';
import { StoryTimelineComponent } from '../story-timeline/story-timeline.component';

@Component({
  selector: 'app-story-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, KeyFactsComponent, SourceListComponent, StoryTimelineComponent],
  templateUrl: './story-detail.component.html',
  styleUrls: ['./story-detail.component.scss']
})
export class StoryDetailComponent implements OnInit, OnDestroy {
  story: StoryDetail | null = null;
  loading = true;
  error: string | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  constructor(private route: ActivatedRoute, private newsApi: NewsApiService) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          const id = params.get('id');
          if (!id) {
            this.error = 'Story identifier is missing.';
            this.loading = false;
            return of(null);
          }

          this.loading = true;
          this.error = null;
          return this.newsApi.getStoryDetail(id).pipe(
            tap(detail => {
              if (detail) {
                this.updateMeta(detail);
              }
            }),
            catchError(error => {
              this.error = error.message ?? 'Unable to load this story right now.';
              this.loading = false;
              return of(null);
            })
          );
        })
      )
      .subscribe(detail => {
        this.loading = false;
        if (detail) {
          this.story = detail;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateMeta(detail: StoryDetail): void {
    const summary = detail.summary?.[0] ?? detail.content;
    const pageTitle = `${detail.title} | Aussie Cricket Central`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: summary });
    this.meta.updateTag({ name: 'og:title', content: pageTitle });
    this.meta.updateTag({ name: 'og:description', content: summary });
    if (detail.imageUrl) {
      this.meta.updateTag({ name: 'og:image', content: detail.imageUrl });
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: summary });
  }
}
