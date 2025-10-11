import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngagementService, EngagementAction } from '../../services/engagement.service';
import { TrackingService } from '../../services/tracking.service';

@Component({
  selector: 'app-engagement-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './engagement-banner.component.html',
  styleUrls: ['./engagement-banner.component.scss']
})
export class EngagementBannerComponent {
  @Input() referralCode?: string;

  constructor(
    private engagement: EngagementService,
    private tracking: TrackingService,
  ) {}

  get actions(): EngagementAction[] {
    return this.engagement.getInlineActions(this.referralCode);
  }

  onClick(action: EngagementAction): void {
    this.tracking.emitEvent('cta_click', {
      action: action.id,
      platform: action.platform,
      referralCode: this.referralCode,
    });
  }
}
