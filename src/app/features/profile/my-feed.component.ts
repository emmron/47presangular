import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UserPreferencesService } from '../../services/user-preferences.service';
import { NotificationDeliveryService } from '../../services/notification-delivery.service';
import { NewsStateService } from '../../services/news-state.service';
import {
  SavedArticleSummary,
  SavedNewsFilter,
  UserProfile,
  NotificationPreferences
} from '../../models/user.model';
import { NotificationCenterComponent } from '../notifications/notification-center/notification-center.component';

@Component({
  selector: 'app-my-feed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationCenterComponent],
  templateUrl: './my-feed.component.html',
  styleUrls: ['./my-feed.component.scss']
})
export class MyFeedComponent implements OnInit, OnDestroy {
  readonly profile$ = this.preferences.profile$;
  readonly savedFilters$ = this.preferences.savedFilters$;
  readonly savedArticles$ = this.preferences.savedArticles$;

  readonly followTopicControl = new FormControl<string>('', { nonNullable: true });
  readonly digestForm = this.fb.group({
    emailDigest: [false],
    digestFrequency: ['weekly'],
    pushNotifications: [false]
  });

  notificationPermission: NotificationPermission | 'unsupported' = typeof Notification === 'undefined'
    ? 'unsupported'
    : Notification.permission;
  savingDigestPreferences = false;
  savingTopics = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly preferences: UserPreferencesService,
    private readonly notifications: NotificationDeliveryService,
    private readonly newsState: NewsStateService,
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        if (!profile) {
          return;
        }

        const preferences = profile.notificationPreferences;
        this.digestForm.patchValue({
          emailDigest: preferences.emailDigest,
          digestFrequency: preferences.digestFrequency,
          pushNotifications: preferences.pushNotifications
        }, { emitEvent: false });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async addFollowTopic(): Promise<void> {
    const topic = this.followTopicControl.value.trim();
    if (!topic) {
      return;
    }

    const profile = this.preferences.currentProfile;
    if (!profile) {
      this.error = 'Sign in to manage follow topics.';
      return;
    }

    if (profile.followTopics.includes(topic)) {
      this.followTopicControl.setValue('');
      return;
    }

    this.savingTopics = true;
    try {
      await this.preferences.updateFollowTopics([...profile.followTopics, topic]);
      this.followTopicControl.setValue('');
      this.error = null;
    } catch (error) {
      console.error('Failed to add follow topic', error);
      this.error = error instanceof Error ? error.message : 'Unable to add follow topic.';
    } finally {
      this.savingTopics = false;
    }
  }

  async removeFollowTopic(topic: string, profile: UserProfile): Promise<void> {
    this.savingTopics = true;
    try {
      const updatedTopics = profile.followTopics.filter(existing => existing !== topic);
      await this.preferences.updateFollowTopics(updatedTopics);
      this.error = null;
    } catch (error) {
      console.error('Failed to remove follow topic', error);
      this.error = error instanceof Error ? error.message : 'Unable to remove follow topic.';
    } finally {
      this.savingTopics = false;
    }
  }

  async applySavedFilter(filter: SavedNewsFilter): Promise<void> {
    try {
      await this.newsState.applySavedFilter(filter.id);
      this.error = null;
    } catch (error) {
      console.error('Failed to apply saved filter from profile', error);
      this.error = error instanceof Error ? error.message : 'Unable to apply saved filter.';
    }
  }

  async deleteSavedFilter(filter: SavedNewsFilter): Promise<void> {
    try {
      await this.newsState.removeSavedFilter(filter.id);
    } catch (error) {
      console.error('Failed to delete saved filter', error);
      this.error = error instanceof Error ? error.message : 'Unable to delete saved filter.';
    }
  }

  async removeSavedArticle(article: SavedArticleSummary): Promise<void> {
    try {
      await this.preferences.removeSavedArticle(article.articleId);
    } catch (error) {
      console.error('Failed to remove saved article', error);
      this.error = error instanceof Error ? error.message : 'Unable to remove saved article.';
    }
  }

  async saveDigestPreferences(): Promise<void> {
    const profile = this.preferences.currentProfile;
    if (!profile) {
      this.error = 'Sign in to manage notification preferences.';
      return;
    }

    const formValue = this.digestForm.getRawValue();
    const digestFrequency = (formValue.digestFrequency as NotificationPreferences['digestFrequency']) ?? 'weekly';

    const updatedPreferences: NotificationPreferences = {
      ...profile.notificationPreferences,
      emailDigest: !!formValue.emailDigest,
      pushNotifications: !!formValue.pushNotifications,
      digestFrequency
    };

    this.savingDigestPreferences = true;

    try {
      await this.preferences.updateNotificationPreferences(updatedPreferences);

      if (updatedPreferences.emailDigest) {
        await this.notifications.optInToEmailDigest(digestFrequency);
      } else {
        await this.notifications.optOutOfEmailDigest();
      }

      if (updatedPreferences.pushNotifications) {
        const permission = await this.notifications.requestBrowserPermission();
        this.notificationPermission = permission;

        if (permission === 'granted') {
          const registration = await (navigator?.serviceWorker?.ready ?? Promise.resolve(undefined));
          const subscription = await registration?.pushManager.getSubscription();
          if (subscription) {
            await this.notifications.enablePushNotifications(subscription, profile.followTopics);
          }
        }
      } else {
        await this.notifications.disablePushNotifications();
      }

      this.error = null;
    } catch (error) {
      console.error('Failed to update notification preferences', error);
      this.error = error instanceof Error ? error.message : 'Unable to update notification preferences.';
    } finally {
      this.savingDigestPreferences = false;
    }
  }

  getNotificationPermissionDescription(): string {
    if (this.notificationPermission === 'unsupported') {
      return 'Browser notifications are not supported in this environment.';
    }
    return this.notificationPermission === 'granted'
      ? 'Browser notifications enabled'
      : 'Notifications pending permission';
  }
}
