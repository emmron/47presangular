import { Component } from '@angular/core';
import { LayoutModule } from './layout/layout.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutModule],
  template: `
    <app-layout></app-layout>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f0f2f5;
    }
  `]
})
export class AppComponent {
  title = 'Trump 47 Campaign Tracker';
}
