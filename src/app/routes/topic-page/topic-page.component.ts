import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { marked } from 'marked';
import { map, switchMap } from 'rxjs/operators';

import { toLoadingState } from '../../models/loading-state.model';
import { TopicDataService } from '../../services/topic-data.service';
import { TopicDetail, NewsItem, TopicEvent } from '../../models/news.model';

interface TopicEventGroup {
  event: TopicEvent;
  items: NewsItem[];
}

interface TopicDetailView {
  lastUpdated: Date;
  curatedHtml: SafeHtml;
  detail: TopicDetail;
  momentumChart: { name: string; series: { name: Date; value: number }[] }[];
  eventGroups: TopicEventGroup[];
  callouts: { title: string; body: SafeHtml }[];
}

@Component({
  selector: 'app-topic-page',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, RouterLink, NgxChartsModule],
  templateUrl: './topic-page.component.html',
  styleUrl: './topic-page.component.scss'
})
export class TopicPageComponent {
  readonly colorScheme: Color = {
    name: 'topicMomentum',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#4c6ef5']
  };

  readonly viewState$ = toLoadingState(
    this.route.paramMap.pipe(
      map(params => params.get('slug') ?? ''),
      switchMap(slug => this.topicDataService.getTopicDetail(slug)),
      map(detail => this.buildView(detail))
    )
  );

  constructor(
    private route: ActivatedRoute,
    private topicDataService: TopicDataService,
    private sanitizer: DomSanitizer
  ) {
    marked.setOptions({ breaks: true });
  }

  trackByEvent(_: number, group: TopicEventGroup): string {
    return group.event.slug;
  }

  private buildView(detail: TopicDetail): TopicDetailView {
    const curatedHtml = this.renderMarkdown(detail.topic.curatedCopy || '');

    const callouts = (detail.topic.callouts || []).map(callout => ({
      title: callout.title,
      body: this.renderMarkdown(callout.markdown || '')
    }));

    const momentumChart = [
      {
        name: detail.topic.title,
        series: detail.topic.momentumSeries.map(point => ({
          name: point.date,
          value: point.value
        }))
      }
    ];

    const eventGroups = detail.topic.events.map(event => ({
      event,
      items: detail.items.filter(item => item.eventSlug === event.slug)
    }));

    return {
      lastUpdated: detail.lastUpdated,
      curatedHtml,
      detail,
      momentumChart,
      eventGroups,
      callouts
    };
  }

  private renderMarkdown(markdown: string): SafeHtml {
    const rendered = marked.parse(markdown || '');
    const html = typeof rendered === 'string' ? rendered : '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
