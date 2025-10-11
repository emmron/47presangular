import { Component } from '@angular/core';

@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrls: ['./layout-header.component.scss']
})
export class LayoutHeaderComponent {
  readonly title = 'Trump 47 Campaign Tracker';
  readonly subtitle = 'Real-time intelligence on the 2024 campaign trail';
}
