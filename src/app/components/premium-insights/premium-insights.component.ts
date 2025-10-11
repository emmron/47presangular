import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitlementService, EntitlementState } from '../../services/entitlement.service';
import { TrackingService } from '../../services/tracking.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-premium-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-insights.component.html',
  styleUrls: ['./premium-insights.component.scss']
})
export class PremiumInsightsComponent {
  readonly entitlement$: Observable<EntitlementState> = this.entitlement.entitlement$;

  readonly supporterInsights = [
    'Early polling toplines across battleground states',
    'Messaging experiments before public release',
    'Field deployment heat map synced with VAN data',
  ];

  readonly strategistInsights = [
    'Nightly analytics briefing deck',
    'Microtargeting personas with CRM engagement scoring',
    'Paid media allocation recommendations',
  ];

  constructor(
    private entitlement: EntitlementService,
    private tracking: TrackingService,
  ) {}

  loginWithStripe(): void {
    this.entitlement.loginWithStripe('demo_stripe_session');
    this.tracking.emitEvent('premium_login', { provider: 'stripe' });
  }

  loginWithMemberful(): void {
    this.entitlement.loginWithMemberful('demo_member_id');
    this.tracking.emitEvent('premium_login', { provider: 'memberful' });
  }

  logout(): void {
    this.entitlement.logout();
    this.tracking.emitEvent('premium_logout');
  }
}
