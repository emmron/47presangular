import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NewsFeedComponent } from './components/news-feed/news-feed.component';
import { LiveStreamWidgetComponent } from './components/media/live-stream-widget/live-stream-widget.component';
import { AdSpotlightComponent } from './components/media/ad-spotlight/ad-spotlight.component';
import { EventMapComponent } from './components/media/event-map/event-map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NewsFeedComponent, LiveStreamWidgetComponent, AdSpotlightComponent, EventMapComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Trump 47 Campaign Tracker';
}
