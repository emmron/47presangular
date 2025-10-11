import { Component } from '@angular/core';

@Component({
  selector: 'app-layout-header',
  templateUrl: './layout-header.component.html',
  styleUrls: ['./layout-header.component.scss']
})
export class LayoutHeaderComponent {
  readonly title = 'Aussie Cricket Pulse';
  readonly subtitle = 'Real-time intelligence across Australian cricket';
}
