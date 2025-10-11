import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsFeedComponent } from '../news-feed/news-feed.component';
import { EngagementBannerComponent } from '../engagement-banner/engagement-banner.component';
import { ReferralService } from '../../services/referral.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NewsFeedComponent, EngagementBannerComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private referrals: ReferralService) {}

  get referralCode(): string {
    return this.referrals.getReferralCode();
  }
}
