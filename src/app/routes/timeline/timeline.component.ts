import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { map } from 'rxjs/operators';

import { toLoadingState } from '../../models/loading-state.model';
import { TopicDataService } from '../../services/topic-data.service';
import { TopicDataset, TopicEvent, Topic, NewsItem } from '../../models/news.model';

interface MomentumChartPoint {
  name: Date;
  value: number;
}

interface MomentumChartSeries {
  name: string;
  series: MomentumChartPoint[];
}

interface TimelineEventGroup {
  event: TopicEvent;
  items: NewsItem[];
}

interface TimelineTopicView {
  topic: Topic;
  momentumChart: MomentumChartSeries[];
  events: TimelineEventGroup[];
}

interface TimelineViewModel {
  lastUpdated: Date;
  topics: TimelineTopicView[];
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, RouterLink, NgxChartsModule],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss'
})
export class TimelineComponent {
  readonly colorScheme: Color = {
    name: 'timelineMomentum',
    selectable: false,
    group: ScaleType.Ordinal,
    domain: ['#4c6ef5', '#20c997', '#e8590c']
  };

  readonly viewState$ = toLoadingState(this.topicDataService.getDataset().pipe(
    map(dataset => this.buildViewModel(dataset))
  ));

  constructor(private topicDataService: TopicDataService) {}

  trackByTopic(_: number, view: TimelineTopicView): string {
    return view.topic.slug;
  }

  trackByEvent(_: number, group: TimelineEventGroup): string {
    return group.event.slug;
  }

  private buildViewModel(dataset: TopicDataset): TimelineViewModel {
    return {
      lastUpdated: dataset.lastUpdated,
      topics: dataset.topics.map(topic => this.buildTopicView(topic, dataset.items))
    };
  }

  private buildTopicView(topic: Topic, items: NewsItem[]): TimelineTopicView {
    const events = topic.events.map(event => ({
      event,
      items: items.filter(item =>
        item.eventSlug === event.slug && item.topics?.includes(topic.slug)
      )
    }));

    const momentumChart: MomentumChartSeries[] = [
      {
        name: topic.title,
        series: topic.momentumSeries.map(point => ({
          name: point.date,
          value: point.value
        }))
      }
    ];

    return {
      topic,
      events,
      momentumChart
    };
  }
}
