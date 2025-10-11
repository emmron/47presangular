import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-key-facts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './key-facts.component.html',
  styleUrls: ['./key-facts.component.scss']
})
export class KeyFactsComponent {
  @Input() summary: string[] | null = null;

  get hasSummary(): boolean {
    return !!this.summary && this.summary.length > 0;
  }
}
