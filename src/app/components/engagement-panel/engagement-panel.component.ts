import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsItem } from '../../models/news.model';
import { EngagementService } from '../../services/engagement.service';

@Component({
  selector: 'app-engagement-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './engagement-panel.component.html',
  styleUrls: ['./engagement-panel.component.scss']
})
export class EngagementPanelComponent {
  @Input() story: NewsItem | null = null;
  @Output() signupCompleted = new EventEmitter<void>();

  email = '';
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private engagementService: EngagementService) { }

  get shareText(): string {
    if (!this.story) {
      return 'Follow the latest developments in the Trump 2024 campaign.';
    }
    return `${this.story.title} — via Trump 47 Campaign Tracker`;
  }

  get shareUrl(): string {
    return this.story?.link || 'https://trump47.example/news';
  }

  encode(value: string): string {
    return encodeURIComponent(value);
  }

  submitNewsletter(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;
    this.engagementService.submitNewsletterSignup(this.email, this.story?.id).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Thanks for subscribing! Check your inbox soon.';
        this.email = '';
        this.signupCompleted.emit();
        this.trackEvent('newsletter_signup', { storyId: this.story?.id || null });
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'We were unable to process your signup. Please try again later.';
      }
    });
  }

  onShare(network: 'twitter' | 'facebook' | 'linkedin'): void {
    const payload = {
      storyId: this.story?.id || null,
      network,
      url: this.shareUrl
    };
    this.trackEvent('social_share', payload);
  }

  private trackEvent(eventName: string, payload: Record<string, unknown>): void {
    this.engagementService.trackEvent(eventName, payload).subscribe();
  }
}
